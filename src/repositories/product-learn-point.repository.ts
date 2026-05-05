import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductLearnPoint } from "src/entities/product-learn-point.entity";
import { Product } from "src/entities/product.entity";
import { DeepPartial, Repository } from "typeorm";

@Injectable()
export class ProductLearnPointRepository {
    constructor(
        @InjectRepository(ProductLearnPoint)
        private readonly productLearnPointRepository: Repository<ProductLearnPoint>
    ) { }

    public async create(productLearnPoint: DeepPartial<ProductLearnPoint>[]): Promise<ProductLearnPoint[]> {
        const newProductLearnPoint = this.productLearnPointRepository.create(productLearnPoint);
        return await this.productLearnPointRepository.save(newProductLearnPoint)
    }

    public async delete(product: Product): Promise<void> {
        await this.productLearnPointRepository.delete({ product: product })
    }
}