import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { generalConstant } from 'src/constants/general.constant';
import { typeConstant } from 'src/constants/type.constant';
import { ProductRatingDto } from 'src/dto/product-rating.dto';
import { ProductEcourseSubMaterialRepository } from 'src/repositories/product-ecourse-sub-material.repository';
import { ProductRatingRepository } from 'src/repositories/product-rating.repository';
import { ProductRepository } from 'src/repositories/product.repository';
import { UserActivityHistoryRepository } from 'src/repositories/user-activity-history.repository';
import { UserProductRepository } from 'src/repositories/user-product.repository';
import { UserRepository } from 'src/repositories/user.repository';

@Injectable()
export class UserProductService {
    private logger: Logger = new Logger(UserProductService.name)

    constructor(
        private readonly userActivityRepository: UserActivityHistoryRepository,
        private readonly productEcourseSubMaterialRepository: ProductEcourseSubMaterialRepository,
        private readonly userProductRepository: UserProductRepository,
        private readonly productRatingRepository: ProductRatingRepository,
        private readonly productRepository: ProductRepository,
        private readonly userRepository: UserRepository,
    ) { }

    public async getAllByUser(userUuid: string): Promise<any> {
        try {
            const products = await this.userProductRepository.findAll({
                select: {
                    id: true,
                    user: {
                        uuid: true,
                    },
                    product: {
                        uuid: true,
                        name: true,
                        image: true,
                        webinar_date: true,
                        webinar_time: true,
                        webinar_link: true,
                        ebook_link: true,
                        ebook_page_count: true,
                        author: {
                            uuid: true,
                            name: true,
                        },
                        type: {
                            name: true
                        }
                    }
                },
                where: {
                    user: {
                        uuid: userUuid
                    }
                },
                relations: {
                    user: true,
                    product: {
                        author: true,
                        type: true
                    }
                },
                order: {
                    id: 'DESC'
                }
            })

            let data: any[] = []
            for (const item of products) {
                const countActivity = await this.userActivityRepository.findRecentActivity({
                    where: {
                        user: {
                            uuid: item.user.uuid
                        },
                        product: {
                            uuid: item.product.uuid
                        },
                        type: {
                            code: typeConstant.ECOURSE
                        }
                    }
                })

                const subMaterial = await this.productEcourseSubMaterialRepository.findByProductId(item.product.id)
                const progress = subMaterial.length > 0 ? (countActivity.length / subMaterial.length) * 100 : 0
                const existingRating = await this.productRatingRepository.countRatingByProductIdAndUserId(
                    item.product.uuid,
                    item.user.uuid
                )
                const completeOrNot = await this.userProductRepository.findOne({
                    where: {
                        user: {
                            uuid: userUuid
                        },
                        product: {
                            uuid: item.product.uuid
                        },
                        is_done: true
                    }
                })

                data.push({
                    uuid: item.product.uuid,
                    name: item.product.name,
                    image: item.product.image,
                    author_name: item.product.author.name,
                    webinar_date: item.product.webinar_date,
                    webinar_time: item.product.webinar_time,
                    webinar_link: item.product.webinar_link,
                    ebook_link: item.product.ebook_link,
                    ebook_page_count: item.product.ebook_page_count,
                    type: item.product.type.name,
                    is_done: !!completeOrNot,
                    is_have_rating: existingRating > 0,
                    e_course_progress: progress
                })
            }

            return data
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async getEbookLink(userUuid: string, productUuid: string): Promise<any> {
        try {
            const product = await this.productRepository.findByUuid(productUuid)
            if (!product) {
                throw new NotFoundException(generalConstant.PRODUCT_NOT_FOUND)
            }

            const completeOrNot = await this.userProductRepository.findOne({
                where: {
                    user: {
                        uuid: userUuid
                    },
                    product: {
                        uuid: productUuid
                    },
                    is_done: true
                }
            })

            return {
                e_book_link: product.ebook_link,
                is_done: !!completeOrNot
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async getMaterialByUser(userUuid: string, productUuid: string): Promise<any> {
        try {
            const product = await this.productRepository.findByUuid(productUuid)
            if (!product) {
                throw new NotFoundException(generalConstant.PRODUCT_NOT_FOUND)
            }

            const userProduct = await this.userProductRepository.findAll({
                select: {
                    id: true,
                    product: {
                        uuid: true,
                        productEcourseMaterials: {
                            id: true,
                            uuid: true,
                            title: true
                        }
                    }
                },
                where: {
                    user: { uuid: userUuid },
                    product: { uuid: productUuid }
                },
                relations: {
                    product: {
                        productEcourseMaterials: true
                    }
                },
                order: {
                    product: {
                        productEcourseMaterials: {
                            id: 'DESC'
                        }
                    }
                }
            })

            const material = await Promise.all(
                userProduct.flatMap((item) => {
                    return item.product.productEcourseMaterials.map(async (material) => {
                        const subMaterials = await this.productEcourseSubMaterialRepository.findByMaterialId(material.id)
                        const subData = await Promise.all(
                            subMaterials.map(async (sub) => {
                                const activity = await this.userActivityRepository.findOneBySubMaterial({
                                    where: {
                                        user: {
                                            uuid: userUuid
                                        },
                                        product: {
                                            uuid: productUuid
                                        },
                                        ecourseSubMaterial: {
                                            uuid: sub.uuid
                                        }
                                    }
                                })

                                return {
                                    uuid: sub.uuid,
                                    title: sub.title,
                                    video_url: sub.video_url,
                                    duration: sub.duration,
                                    is_done: !!activity,
                                }
                            })
                        )

                        const totalDuration = subData.reduce((acc, curr) => acc + curr.duration, 0)
                        return {
                            title: material.title,
                            total_sub_material: subData.length,
                            total_duration: totalDuration,
                            sub_material: subData
                        }
                    })
                })
            )

            return {
                product_name: product.name,
                total_material: material.reduce((acc, curr) => acc + curr.total_sub_material, 0),
                total_duration: material.reduce((acc, curr) => acc + curr.total_duration, 0),
                section: material
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async createRating(userUuid: string, data: ProductRatingDto): Promise<any> {
        try {
            const product = await this.productRepository.findByUuid(data.product_id)
            if (!product) {
                throw new NotFoundException(generalConstant.PRODUCT_NOT_FOUND)
            }

            const user = await this.userRepository.findByUuid(userUuid)
            if (!user) {
                throw new NotFoundException(generalConstant.USER_NOT_FOUND)
            }

            const existingRating = await this.productRatingRepository.countRatingByProductIdAndUserId(data.product_id, userUuid)
            if(existingRating != 0) {
                throw new NotFoundException(generalConstant.RATING_ALREADY_EXISTS)
            }

            await this.productRatingRepository.create({
                user: user,
                product: product,
                rating: data.rating,
                review: data.review ? data.review : null
            })
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }
}
