import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { generalConstant } from 'src/constants/general.constant';
import { typeConstant } from 'src/constants/type.constant';
import { UserActivityDto } from 'src/dto/user-activity.dto';
import { UserActivityHistory } from 'src/entities/user-activity-history.entity';
import { ProductEcourseSubMaterialRepository } from 'src/repositories/product-ecourse-sub-material.repository';
import { ProductRepository } from 'src/repositories/product.repository';
import { TypeRepository } from 'src/repositories/type.repository';
import { UserActivityHistoryRepository } from 'src/repositories/user-activity-history.repository';
import { UserProductRepository } from 'src/repositories/user-product.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { DataSource, DeepPartial } from 'typeorm';

@Injectable()
export class UserActivityService {
    private logger: Logger = new Logger(UserActivityService.name)

    constructor(
        private readonly userActivityRepository: UserActivityHistoryRepository,
        private readonly productEcourseSubMaterialRepository: ProductEcourseSubMaterialRepository,
        private readonly userProductRepository: UserProductRepository,
        private readonly typeRepository: TypeRepository,
        private readonly productRepository: ProductRepository,
        private readonly userRepository: UserRepository,

        private readonly dataSource: DataSource,
    ) { }

    public async create(userUuid: string, data: UserActivityDto): Promise<any> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        
        try {
            await queryRunner.startTransaction();
            const user = await this.userRepository.findByUuid(userUuid)
            if (!user) {
                throw new NotFoundException(generalConstant.USER_NOT_FOUND)
            }

            const product = await this.productRepository.findByUuid(data.product_id)
            if (!product) {
                throw new NotFoundException(generalConstant.PRODUCT_NOT_FOUND)
            }

            const subMaterial = await this.productEcourseSubMaterialRepository.findByUuid(data.ecourse_sub_material_id)
            if (data.ecourse_sub_material_id && !subMaterial) {
                throw new NotFoundException(generalConstant.ECOURSE_SUB_MATERIAL_NOT_FOUND)
            }

            const type = await this.typeRepository.findByCode(product.type.code)
            if (!type) {
                throw new NotFoundException(generalConstant.TYPE_NOT_FOUND)
            }

            const payload: DeepPartial<UserActivityHistory> = {
                user: user,
                product: product,
                ecourseSubMaterial: subMaterial || null,
                type: type
            }

            if (product.type.code == typeConstant.ECOURSE) {
                payload.activity = `Course sub material ${subMaterial?.title || ''} has been completed on course ${product.name}`
            } else if (product.type.code == typeConstant.EBOOK) {
                payload.activity = `Read ebook ${product?.name || ''}`
                payload.ecourseSubMaterial = null
            } else {
                payload.activity = `Attend webinar ${product?.name || ''}`
                payload.ecourseSubMaterial = null
            }

            await this.userActivityRepository.create(payload)

            if (product.type.code == typeConstant.ECOURSE) {
                const countActivity = await this.userActivityRepository.findRecentActivity({
                    where: {
                        user: {
                            uuid: user.uuid
                        },
                        product: {
                            uuid: product.uuid
                        },
                        type: {
                            code: typeConstant.ECOURSE
                        }
                    }
                })

                const subMaterial = await this.productEcourseSubMaterialRepository.findByProductId(product.id)
                if (countActivity.length == subMaterial.length) {
                    await this.userProductRepository.update(product, user, {
                        is_done: true
                    }, queryRunner)
                }
            } else if (product.type.code == typeConstant.EBOOK || product.type.code == typeConstant.WEBINAR) {
                await this.userProductRepository.update(product, user, {
                    is_done: true
                }, queryRunner)
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(error)
            throw error
        } finally {
            await queryRunner.release();
        }
    }
}
