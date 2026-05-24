import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductEcourseMaterial } from "src/entities/product-ecourse-material.entity";
import { ProductEcourseSubMaterial } from "src/entities/product-ecourse-sub-material.entity";
import { DeepPartial, Repository } from "typeorm";

@Injectable()
export class ProductEcourseSubMaterialRepository {
    constructor(
        @InjectRepository(ProductEcourseSubMaterial)
        private readonly productEcourseSubMaterialRepository: Repository<ProductEcourseSubMaterial>
    ) { }

    public async findByMaterialId(materialId: number): Promise<ProductEcourseSubMaterial[]> {
        return await this.productEcourseSubMaterialRepository.find({
            select: {
                id: true,
                uuid: true,
                title: true,
                video_url: true,
                duration: true
            },
            where: {
                productEcourseMaterial: {
                    id: materialId
                }
            },
        })
    }

    public async findByProductId(productId: number): Promise<ProductEcourseSubMaterial[]> {
        return await this.productEcourseSubMaterialRepository.find({
            where: {
                productEcourseMaterial: {
                    product: {
                        id: productId
                    }
                }
            },
        })
    }

    public async findByUuid(uuid: string): Promise<ProductEcourseSubMaterial | null> {
        return await this.productEcourseSubMaterialRepository.findOne({
            where: {
                uuid
            },
        })
    }

    public async create(data: DeepPartial<ProductEcourseSubMaterial>[]): Promise<ProductEcourseSubMaterial[]> {
        const newProductEcourseSubMaterial = this.productEcourseSubMaterialRepository.create(data);
        return await this.productEcourseSubMaterialRepository.save(newProductEcourseSubMaterial)
    }

    public async delete(productEcourseMaterial: ProductEcourseMaterial): Promise<void> {
        await this.productEcourseSubMaterialRepository.delete({
            productEcourseMaterial: productEcourseMaterial
        })
    }
}