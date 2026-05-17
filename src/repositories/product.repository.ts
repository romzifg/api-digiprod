import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { approvalStatusContant } from "src/constants/approval-status.contant";
import { Product } from "src/entities/product.entity";
import { IQueryParams } from "src/interfaces/database.interface";
import { DeepPartial, FindManyOptions, FindOptionsWhere, ILike, IsNull, LessThanOrEqual, Like, Not, QueryRunner, Repository, UpdateResult } from "typeorm";

@Injectable()
export class ProductRepository {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>
    ) { }

    private buildWhereClause(searchQuery?: string): FindOptionsWhere<Product>[] {
        const whereClause: FindOptionsWhere<Product>[] = []

        if (searchQuery) {
            const searchValue = `%${searchQuery}%`
            whereClause.push(
                { name: ILike(searchValue) },
                { author: { name: ILike(searchValue) } }
            )
        }

        return whereClause
    }

    private async generateProductCode(): Promise<string> {
        const lastProduct = await this.productRepository.findOne({
            select: { code: true },
            where: {
                code: Not(IsNull())
            },
            order: {
                code: 'DESC'
            }
        })

        let newNumber = 1
        if (lastProduct?.code) {
            const lastNumber = parseInt(lastProduct.code.replace('PROD-', ''), 10)
            newNumber = lastNumber + 1
        }

        return `PROD-${newNumber.toString().padStart(4, '0')}`
    }

    private sortColumn(params: Partial<IQueryParams>): object {
        if (params.column == undefined || params.sort == undefined) {
            return { id: 'DESC' }
        }

        return { [params.column]: params.sort }
    }

    public async create(product: DeepPartial<Product>): Promise<Product> {
        product.code = await this.generateProductCode()
        const newProduct = this.productRepository.create(product);
        return this.productRepository.save(newProduct)
    }

    public async update(uuid: string, data: DeepPartial<Product>): Promise<UpdateResult> {
        return await this.productRepository.update({ uuid: uuid }, data);
    }

    public async updateWithTransaction(productUuid: string, data: DeepPartial<Product>, queryRunner: QueryRunner): Promise<UpdateResult> {
        return await queryRunner.manager.update(Product,
            {
                uuid: productUuid

            }, data
        )
    }

    public async findAllForVoucher(authorUuid: string): Promise<Product[]> {
        return await this.productRepository.find({
            select: {
                id: true,
                uuid: true,
                name: true,
                type: {
                    name: true
                }
            },
            relations: {
                type: true
            },
            where: {
                author: {
                    uuid: authorUuid
                }
            }
        })
    }

    public async countProduct(authorUuid?: string): Promise<number> {
        let whereClause: FindManyOptions<Product> = {}

        if (authorUuid) {
            whereClause = {
                where: {
                    author: {
                        uuid: authorUuid
                    }
                }
            }
        }

        return this.productRepository.count(whereClause)
    }

    public async findAllByType(typeCode: string, limit: number): Promise<Product[]> {
        return await this.productRepository.find({
            select: {
                id: true,
                uuid: true,
                name: true,
                price: true,
                image: true,
                level: true,
                webinar_date: true,
                webinar_time: true,
                author: {
                    name: true
                },
                category: {
                    name: true
                },
            },
            relations: {
                type: true,
                author: true,
                category: true
            },
            where: {
                type: {
                    code: typeCode
                },
                status: approvalStatusContant.APPROVED
            },
            order: {
                id: 'DESC'
            },
            take: limit
        })
    }

    public async findLatestProduct(authorUuid?: string): Promise<Product[]> {
        let options: FindManyOptions<Product> = {
            select: {
                id: true,
                uuid: true,
                name: true,
                image: true,
                author: {
                    name: true
                },
                category: {
                    name: true
                },
            },
            relations: {
                type: true,
                author: true,
                category: true
            },
            order: {
                id: 'DESC'
            },
            take: 5
        }

        if (authorUuid) {
            options.where = {
                author: {
                    uuid: authorUuid
                }
            }
        }

        return await this.productRepository.find(options)
    }

    public async findAllWithPaginationForCreator(params: IQueryParams, authorUuid: string): Promise<{ data: Product[], total: number }> {
        const offset: number = (params.page - 1) * params.limit
        let whereClause: FindOptionsWhere<Product>[] = []

        if (params.query) {
            whereClause = this.buildWhereClause(params.query)
        }

        if (authorUuid) {
            const authorFilter: FindOptionsWhere<Product> = {
                author: {
                    uuid: authorUuid
                }
            }

            if (whereClause && whereClause.length) {
                whereClause = whereClause.map((clause) => ({
                    ...clause,
                    ...authorFilter
                }))
            } else {
                whereClause = [authorFilter]
            }
        }

        const [data, total] = await this.productRepository.findAndCount({
            select: {
                id: true,
                uuid: true,
                name: true,
                code: true,
                status: true,
                image: true,
                updated_at: true,
                author: {
                    id: true,
                    name: true
                },
                type: {
                    id: true,
                    name: true,
                    code: true
                },
            },
            relations: {
                author: true,
                type: true,
            },
            where: whereClause,
            order: {
                updated_at: 'DESC'
            },
            skip: offset,
            take: params.limit,
        })

        return { data, total }
    }

    public async findAllWithPaginationForUser(params: IQueryParams): Promise<{ data: Product[], total: number }> {
        const offset: number = (params.page - 1) * params.limit
        let whereClause: FindOptionsWhere<Product>[] = []
        const baseCondition: FindOptionsWhere<Product> = {
            status: approvalStatusContant.APPROVED,
            type: {
                code: params.type_code
            }
        }

        if (params.query) {
            const searchCondition = this.buildWhereClause(params.query)
            whereClause = searchCondition.map((condition) => ({
                ...condition,
                ...baseCondition
            }))
        } else {
            whereClause = [baseCondition]
        }

        if (params.categrory) {
            whereClause = whereClause.map((condition) => ({
                ...condition,
                category: {
                    id: Number(params.categrory)
                }
            }))
        }

        if (params.price) {
            whereClause = whereClause.map((condition) => ({
                ...condition,
                price: LessThanOrEqual(Number(params.price))
            }))
        }

        if (params.level) {
            whereClause = whereClause.map((condition) => ({
                ...condition,
                level: params.level?.toLowerCase()
            }))
        }

        if (params.rating) {
            whereClause = whereClause.map((condition) => ({
                ...condition,
                productRatings: {
                    rating: Number(params.rating)
                }
            }))
        }

        const [data, total] = await this.productRepository.findAndCount({
            select: {
                id: true,
                uuid: true,
                name: true,
                code: true,
                status: true,
                price: true,
                image: true,
                level: true,
                created_at: true,
                updated_at: true,
                amount_sold: true,
                author: {
                    id: true,
                    name: true
                },
                type: {
                    id: true,
                    name: true,
                    code: true
                },
                category: {
                    id: true,
                    name: true
                }
            },
            relations: {
                author: true,
                type: true,
                category: true
            },
            where: whereClause,
            order: this.sortColumn(params),
            skip: offset,
            take: params.limit,
        })

        return { data, total }
    }

    public async findById(productId: number): Promise<Product | null> {
        return await this.productRepository.findOne({
            where: {
                id: productId
            },
            relations: {
                productAudiences: true,
                productLearnPoints: true,
                author: true,
                productEcourseMaterials: {
                    productEcourseSubMaterials: true
                },
                type: true,
                category: true
            }
        })
    }

    public async findByUuid(productUuid: string): Promise<Product | null> {
        return await this.productRepository.findOne({
            where: {
                uuid: productUuid
            },
            relations: {
                productAudiences: true,
                productLearnPoints: true,
                author: {
                    job: true
                },
                productEcourseMaterials: {
                    productEcourseSubMaterials: true
                },
                type: true,
                category: true
            }
        })
    }
}