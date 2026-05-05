import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductAudience } from "src/entities/product-audience.entity";
import { Product } from "src/entities/product.entity";
import { DeepPartial, Repository } from "typeorm";

@Injectable()
export class ProductAudienceRepository {
    constructor(
        @InjectRepository(ProductAudience)
        private readonly productAudienceRepository: Repository<ProductAudience>
    ) { }

    public async create(productAudience: DeepPartial<ProductAudience>[]): Promise<ProductAudience[]> {
        const newProductAudience = this.productAudienceRepository.create(productAudience);
        return await this.productAudienceRepository.save(newProductAudience)
    }

    public async delete(product: Product): Promise<void> {
        await this.productAudienceRepository.delete({ product: product })
    }
}