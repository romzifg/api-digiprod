import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductEcourseMaterial } from "src/entities/product-ecourse-material.entity";
import { DeepPartial, Repository } from "typeorm";

@Injectable()
export class ProductEcourseMaterialRepository {
    constructor(
        @InjectRepository(ProductEcourseMaterial)
        private readonly productEcourseMaterialRepository: Repository<ProductEcourseMaterial>
    ) { }

    public async findLastStatus(productUuid: string): Promise<ProductEcourseMaterial | null> {
        return await this.productEcourseMaterialRepository.findOne({
            where: {
                product: {
                    uuid: productUuid
                }
            },
            relations: {
                product: true
            },
            order: {
                id: 'DESC'
            }
        })
    }

    public async findByProductId(productId: number): Promise<ProductEcourseMaterial[]> {
        return await this.productEcourseMaterialRepository.find({
            where: {
                product: {
                    id: productId
                }
            },
            relations: {
                productEcourseSubMaterials: true
            },
            order: {
                id: 'DESC'
            }
        })
    }

    public async create(data: DeepPartial<ProductEcourseMaterial>[]): Promise<ProductEcourseMaterial[]> {
        const newProductEcourseMaterial = this.productEcourseMaterialRepository.create(data);
        return await this.productEcourseMaterialRepository.save(newProductEcourseMaterial)
    }

    public async delete(productId: number): Promise<void> {
        await this.productEcourseMaterialRepository.delete({ product: { id: productId } })
    }
}