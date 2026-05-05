import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductApproval } from "src/entities/product-approval.entity";
import { DeepPartial, Repository } from "typeorm";

@Injectable()
export class ProductApprovalRepository {
    constructor(
        @InjectRepository(ProductApproval)
        private readonly productApprovalRepository: Repository<ProductApproval>
    ) { }

    public async findLastStatus(productUuid: string): Promise<ProductApproval | null> {
        return await this.productApprovalRepository.findOne({
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

    public async create(productApproval: DeepPartial<ProductApproval>): Promise<ProductApproval> {
        const newProductApproval = this.productApprovalRepository.create(productApproval);
        return await this.productApprovalRepository.save(newProductApproval)
    }
}