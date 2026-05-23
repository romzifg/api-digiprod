import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductRating } from "src/entities/product-rating.entity";
import { DeepPartial, Repository } from "typeorm";

@Injectable()
export class ProductRatingRepository {
    constructor(
        @InjectRepository(ProductRating)
        private readonly productRatingRepository: Repository<ProductRating>
    ) { }

    public async findRatingByProductId(productId: number): Promise<ProductRating[]> {
        return await this.productRatingRepository.find({
            where: {
                product: {
                    id: productId
                }
            },
            relations: {
                user: true,
                product: true
            }
        })
    }

    public async countRatingByProductIdAndUserId(productUuid: string, userUuid: string): Promise<number> {
        return await this.productRatingRepository.count({
            where: {
                product: {
                    uuid: productUuid
                },
                user: {
                    uuid: userUuid
                }
            }
        })
    }

    public async create(productRating: DeepPartial<ProductRating>): Promise<ProductRating> {
        const newProductRating = this.productRatingRepository.create(productRating);
        return await this.productRatingRepository.save(newProductRating)
    }
}