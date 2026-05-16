import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { approvalStatusContant } from 'src/constants/approval-status.contant';
import { generalConstant } from 'src/constants/general.constant';
import { typeConstant } from 'src/constants/type.constant';
import { ProductDto } from 'src/dto/product.dto';
import { Category } from 'src/entities/category.entity';
import { Product } from 'src/entities/product.entity';
import { Type } from 'src/entities/type.entity';
import { User } from 'src/entities/user.entity';
import { CategoryRepository } from 'src/repositories/category.repository';
import { ProductApprovalRepository } from 'src/repositories/product-approval.repository';
import { ProductAudienceRepository } from 'src/repositories/product-audience.repository';
import { ProductEcourseMaterialRepository } from 'src/repositories/product-ecourse-material.repository';
import { ProductEcourseSubMaterialRepository } from 'src/repositories/product-ecourse-sub-material.repository';
import { ProductLearnPointRepository } from 'src/repositories/product-learn-point.repository';
import { ProductRatingRepository } from 'src/repositories/product-rating.repository';
import { ProductVoucherDetailRepository } from 'src/repositories/product-voucher-detail.repository';
import { ProductRepository } from 'src/repositories/product.repository';
import { TypeRepository } from 'src/repositories/type.repository';
import { UserProductRepository } from 'src/repositories/user-product.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { AwsUtil } from 'src/utils/aws.util';
import { PaginationUtil } from 'src/utils/pagination.util';

import * as path from 'path'
import { IPagination, IQueryParams } from 'src/interfaces/database.interface';
import { roleConstant } from 'src/constants/role.constant';
import { ProductEcourseMaterial } from 'src/entities/product-ecourse-material.entity';
import { CreateProductDto } from 'src/dto/create-product.dto';
import { UpdateProductDto } from 'src/dto/update-product.dto';
import { ApproveRejectDto } from 'src/dto/approve-reject.dto';
import { ProductApproval } from 'src/entities/product-approval.entity';

@Injectable()
export class ProductService {
    private logger: Logger = new Logger(ProductService.name);

    constructor(
        private readonly productRepository: ProductRepository,
        private readonly productLearnPointRepository: ProductLearnPointRepository,
        private readonly productAudienceRepository: ProductAudienceRepository,
        private readonly productVoucherDetailRepository: ProductVoucherDetailRepository,
        private readonly productEcourseMaterialRepository: ProductEcourseMaterialRepository,
        private readonly productEcourseSubMaterialRepository: ProductEcourseSubMaterialRepository,
        private readonly productRatingRepository: ProductRatingRepository,
        private readonly productApprovalRepository: ProductApprovalRepository,
        private readonly typeRepository: TypeRepository,
        private readonly categoryRepository: CategoryRepository,
        private readonly userRepository: UserRepository,
        private readonly userProductRepository: UserProductRepository,
        private readonly awsUtil: AwsUtil,
        private readonly paginationUtil: PaginationUtil,
    ) { }

    private async getRequiredEntities(data: ProductDto, authorUuid: string): Promise<{
        type: Type,
        user: User,
        category: Category
    }> {
        const [type, user, category] = await Promise.all([
            this.typeRepository.findByCode(data.type_code),
            this.userRepository.findByUuid(authorUuid),
            this.categoryRepository.findOne(data.category_id),
        ])

        if (!type) {
            throw new NotFoundException(generalConstant.TYPE_NOT_FOUND)
        }
        if (!user) {
            throw new NotFoundException(generalConstant.USER_NOT_FOUND)
        }
        if (!category) {
            throw new NotFoundException(generalConstant.CATEGORY_NOT_FOUND)
        }

        return { type, user, category }
    }

    private initializeBaseProduct(data: ProductDto, entities: {
        type: Type,
        user: User,
        category: Category
    }, isUpdate: boolean = false): Partial<Product> {
        try {
            let baseData: any = {
                name: data.name,
                description: data.description,
                price: data.price,
                type: entities.type,
                category: entities.category,
                level: data.level,
                author: entities.user,
                status: approvalStatusContant.PENDING,
            }

            if (!isUpdate) {
                const uuid = randomUUID();
                baseData = {
                    ...baseData,
                    uuid: uuid
                }
            }

            return baseData
        } catch (error) {
            throw error;
        }
    }

    private getProductSpesificData(type: Type, data: ProductDto): any {
        const typeName = type.name.toLowerCase();

        if (typeName == typeConstant.EBOOK.toLowerCase()) {
            return {
                ebook_page_count: data.ebook_page_count,
            }
        }
        if (typeName == typeConstant.WEBINAR.toLowerCase()) {
            return {
                webinar_date: data.webinar_date,
                webinar_duration: data.webinar_duration,
                webinar_time: data.webinar_time,
                webinar_link: data.webinar_link,
            }
        }
    }

    private async createLearnPoint(data: ProductDto, product: Product): Promise<void> {
        const learnPoints = [...data.learn_points]

        if (learnPoints && learnPoints.length > 0) {
            const learnPointPayload = learnPoints.map((item) => ({
                name: item,
                product: product,
            }))

            await this.productLearnPointRepository.create(learnPointPayload)
        }
    }

    private async createAudience(data: ProductDto, product: Product): Promise<void> {
        const audiences = [...data.audiences]

        if (audiences && audiences.length > 0) {
            const audiencePayload = audiences.map((item) => ({
                name: item,
                product: product,
            }))

            await this.productAudienceRepository.create(audiencePayload)
        }
    }

    private async createEcourseMaterial(data: ProductDto, product: Product): Promise<void> {
        const materials = [...data.ecourse_materials]

        if (!materials || materials.length == 0) return

        const materialPayload = materials.map((item) => ({
            product: product,
            uuid: randomUUID(),
            title: item.title
        }))

        const saveMaterials = await this.productEcourseMaterialRepository.create(materialPayload)
        const subPayload = saveMaterials.flatMap((mat, i) =>
            (materials[i]?.ecourse_sub_materials ?? []).map(sm => ({
                uuid: randomUUID(),
                title: sm.title,
                video_url: sm.video_url,
                duration: sm.duration,
                product_eccourse_material: mat,
            }))
        )

        if (subPayload.length > 0) {
            await this.productEcourseSubMaterialRepository.create(subPayload)
        }
    }

    private buildApprovalPayloadProduct(product: Product, data: ApproveRejectDto): any {
        const payload: Partial<ProductApproval> = {
            uuid: randomUUID(),
            status: data.status,
            product: product,
            note: null
        }

        if (data.status == approvalStatusContant.REJECTED) {
            payload.note = data.note
        }

        return payload
    }

    public async presignUpload(filename: string, contentType: string, uuid: string): Promise<{
        url: string,
        key: string
    }> {
        try {
            const tempKey = this.awsUtil.makeTempKey(uuid, filename);
            return await this.awsUtil.createPresignedPutUrl(tempKey, contentType);
        } catch (error) {
            throw error;
        }
    }

    public async finilizeObjectFromTemp(imageKey: string): Promise<string> {
        try {
            const productUuid = randomUUID()
            let imageUrl: string | undefined
            if (imageKey) {
                if (!imageKey.startsWith('temp/')) {
                    throw new BadRequestException('Invalide temp image key')
                }

                const ext = path.extname(imageKey || '.png')
                const finalKey = `products/${productUuid}/${randomUUID()}${ext}`

                imageUrl = await this.awsUtil.finalizeObjectFromTemp(imageKey, finalKey)
            }

            return imageUrl || ''
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async getAllForVoucher(authorUuid: string): Promise<any> {
        try {
            return await this.productRepository.findAllForVoucher(authorUuid)
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async getProductWithPaginationForCreator(params: IQueryParams, user: any): Promise<any> {
        try {
            let authorUuid: any = null
            if (user.role == roleConstant.CREATOR) {
                authorUuid = user.uuid
            }

            const { data, total } = await this.productRepository.findAllWithPaginationForCreator(params, authorUuid)
            const paginationParams: IPagination = {
                count: total,
                pageSize: params.limit,
                page: params.page,
                data: data
            }

            return this.paginationUtil.generatePagination(paginationParams)
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async getProductWithPaginationForUser(params: IQueryParams, user: any): Promise<any> {
        try {
            const { data, total } = await this.productRepository.findAllWithPaginationForUser(params)
            let newData: any = []
            for (const item of data) {
                const voucher = await this.productVoucherDetailRepository.findVoucherActiveByProductId(item.id)
                const ratings = await this.productRatingRepository.findRatingByProductId(item.id)
                let ratingAverage = 0
                if (ratings.length > 0) {
                    const sum = ratings.reduce((acc, cur) => acc + cur.rating, 0)
                    ratingAverage = sum / ratings.length
                }

                let result: any = {
                    image: item?.image,
                    uuid: item?.uuid,
                    name: item?.name,
                    level: item?.level,
                    type: item?.type.name,
                    category: item?.category.name,
                    author: item?.author.name,
                    price: item?.price,
                    discount_price: voucher ? item?.price * ((1 - voucher?.productVoucher?.percentage) / 100) : 0
                }

                newData.push(result)
            }

            const paginationParams: IPagination = {
                count: total,
                pageSize: params.limit,
                page: params.page,
                data: newData
            }

            return this.paginationUtil.generatePagination(paginationParams)
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async getByUuidForCreatorOrAdmin(productUuid: string): Promise<any> {
        try {
            const product = await this.productRepository.findByUuid(productUuid)
            if (!product) {
                throw new NotFoundException(generalConstant.PRODUCT_NOT_FOUND)
            }

            const lastApprovalStatus = await this.productApprovalRepository.findLastStatus(productUuid)
            product.price = +product.price
            product['rejection_reasong'] = lastApprovalStatus?.note || null

            return product
        } catch (error) {
            this.logger.error(error)

        }
    }

    public async getByUuidForProductDetail(productUuid: string): Promise<any> {
        try {
            const product = await this.productRepository.findByUuid(productUuid)
            if (!product) {
                throw new NotFoundException(generalConstant.PRODUCT_NOT_FOUND)
            }

            const ratings = await this.productRatingRepository.findRatingByProductId(product.id)
            const voucher = await this.productVoucherDetailRepository.findVoucherActiveByProductId(product.id)
            let ratingAverage = 0
            if (ratings.length > 0) {
                const sum = ratings.reduce((acc, cur) => acc + cur.rating, 0)
                ratingAverage = sum / ratings.length
            }
            const curriculumData: any = []
            if (product.type.code == typeConstant.ECOURSE.toLowerCase()) {
                const curriculums: ProductEcourseMaterial[] = await this.productEcourseMaterialRepository.findByProductId(product.id)
                if (curriculums.length == 0) {
                    throw new NotFoundException(generalConstant.CURRICULUM_NOT_FOUND)
                }

                for (const item of curriculums) {
                    curriculumData.push({
                        title: item.title,
                        total_sub_material: item.productEcourseSubMaterials?.length || 0,
                        total_duration: item.productEcourseSubMaterials?.reduce((acc, cur) => acc + cur.duration, 0) || 0,
                        sub_materials: item.productEcourseSubMaterials.map((el) => ({
                            title: el.title,
                            video_url: el.video_url,
                            duration: el.duration
                        }))
                    })
                }
            }

            const discountPrice = voucher ? product?.price * ((1 - voucher?.productVoucher?.percentage) / 100) : 0

            return {
                uuid: product.uuid,
                name: product.name,
                description: product.description,
                image: product.image,
                level: product.level,
                type: product.type.name,
                category: product.category.name,
                price: product.price,
                rating_average: ratingAverage,
                link_preview: curriculumData[0]?.sub_materials?.[0]?.video_url,
                discount_price: discountPrice,
                voucher_code: voucher ? voucher.productVoucher?.code : null,
                is_discount: discountPrice !== 0,
                percentage_discount: voucher ? voucher?.productVoucher?.percentage : null,
                learn_points: product.productLearnPoints.map((el) => el.name),
                audience: product.productAudiences.map((el) => el.name),
                curriculum: curriculumData,
                author: {
                    name: product.author.name,
                    profession: product.author.job.name,
                    bio: product.author.bio,
                    photo: product.author.photo
                },
                rating: ratings.map((el) => ({
                    users: el.user.name,
                    rating: el.rating,
                    review: el.review
                }))

            }
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async create(data: CreateProductDto, authorUuid: string): Promise<any> {
        try {
            const entities = await this.getRequiredEntities(data, authorUuid)
            const productType = entities.type
            const baseProduct = this.initializeBaseProduct(data, entities)
            const typeSpesificData = this.getProductSpesificData(productType, data)
            const finalProductData = {
                ...baseProduct,
                ...typeSpesificData
            }

            const newProduct = await this.productRepository.create(finalProductData)
            await Promise.all([
                this.createAudience(data, newProduct),
                this.createLearnPoint(data, newProduct),
            ])

            if (productType.name.toLowerCase() == typeConstant.ECOURSE.toLowerCase()) {
                await this.createEcourseMaterial(data, newProduct)
            }

            const imageUrl = await this.finilizeObjectFromTemp(data.image_key)
            await this.productRepository.update(newProduct.uuid, { image: imageUrl })

            if (productType.name.toLowerCase() == typeConstant.EBOOK.toLowerCase()) {
                const ebookLink = await this.finilizeObjectFromTemp(data.ebook_link)
                await this.productRepository.update(newProduct.uuid, { ebook_link: ebookLink })
            }

            return await this.productRepository.findByUuid(newProduct.uuid)
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async update(data: UpdateProductDto, productUuid: string): Promise<any> {
        try {
            const product = await this.productRepository.findByUuid(productUuid)
            if (!product) {
                throw new NotFoundException(generalConstant.PRODUCT_NOT_FOUND)
            }

            const entities = await this.getRequiredEntities(data, product.author.uuid)
            const productType = entities.type
            const baseProduct = this.initializeBaseProduct(data, entities)
            const typeSpesificData = this.getProductSpesificData(productType, data)
            const finalProductData = {
                ...baseProduct,
                ...typeSpesificData
            }

            await this.productRepository.update(productUuid, finalProductData)
            await Promise.all([
                this.productLearnPointRepository.delete(product),
                this.productAudienceRepository.delete(product)
            ])
            await Promise.all([
                this.createAudience(data, product),
                this.createLearnPoint(data, product),
            ])

            if (productType.name.toLowerCase() == typeConstant.ECOURSE.toLowerCase()) {
                await this.productEcourseMaterialRepository.delete(product.uuid)
                const eCourseMaterial = await this.productEcourseMaterialRepository.findByProductId(product.id)
                if (eCourseMaterial.length > 0) {
                    for (const material of eCourseMaterial) {
                        await this.productEcourseSubMaterialRepository.delete(material)
                    }
                }

                await this.createEcourseMaterial(data, product)
            }

            if (data?.image_key) {
                const imageUrl = await this.finilizeObjectFromTemp(data.image_key)
                await this.productRepository.update(product.uuid, { image: imageUrl })
            }

            if (data?.ebook_link) {
                const ebookLink = await this.finilizeObjectFromTemp(data.ebook_link)
                await this.productRepository.update(product.uuid, { ebook_link: ebookLink })
            }

            return await this.productRepository.findByUuid(product.uuid)
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async approveOrRejectProduct(productUuid: string, data: ApproveRejectDto): Promise<any> {
        try {
            const product = await this.productRepository.findByUuid(productUuid)
            if (!product) {
                throw new NotFoundException(generalConstant.PRODUCT_NOT_FOUND)
            }

            const approvalPayload = this.buildApprovalPayloadProduct(product, data)
            await this.productApprovalRepository.create(approvalPayload)
            await this.productRepository.update(productUuid, { status: data.status })
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async reSubmitProduct(productUuid: string, status: number): Promise<any> {
        try {
            const product = await this.productRepository.findByUuid(productUuid)
            if (!product) {
                throw new NotFoundException(generalConstant.PRODUCT_NOT_FOUND)
            }

            await this.productRepository.update(productUuid, { status: status })
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async getProductLandingPage(params: any): Promise<any> {
        try {
            const products = await this.productRepository.findAllByType(params.code, params.limit)
            let newData: any = []
            for (const item of products) {
                const ratings = await this.productRatingRepository.findRatingByProductId(item.id)
                const voucher = await this.productVoucherDetailRepository.findVoucherActiveByProductId(item.id)
                let ratingAverage = 0
                if (ratings.length > 0) {
                    const sum = ratings.reduce((acc, cur) => acc + cur.rating, 0)
                    ratingAverage = sum / ratings.length
                }

                newData.push({
                    uuid: item.uuid,
                    image: item.image,
                    name: item.name,
                    level: item.level,
                    category: item.category.name,
                    author: item.author.name,
                    price: item.price,
                    discountPrice: voucher ? item.price * (1 - voucher.productVoucher.percentage / 100) : 0,
                    ratingAverage: ratingAverage,
                    webinar_date: item.webinar_date,
                    webinar_time: item.webinar_time,
                })
            }

            return newData
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async getUserProduct(userUuid: string, productUuid: string): Promise<any> {
        try {
            const user = await this.userRepository.findByUuid(userUuid)
            if (!user) {
                throw new NotFoundException(generalConstant.USER_NOT_FOUND)
            }

            const product = await this.productRepository.findByUuid(productUuid)
            if (!product) {
                throw new NotFoundException(generalConstant.PRODUCT_NOT_FOUND)
            }

            const userProduct = await this.userProductRepository.findOne({
                where: {
                    user: {
                        uuid: userUuid
                    },
                    product: {
                        uuid: productUuid
                    }
                }
            })

            return {
                is_purchased: !!userProduct,
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }
}
