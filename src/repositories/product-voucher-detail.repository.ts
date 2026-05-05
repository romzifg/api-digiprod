import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductVoucherDetail } from "src/entities/product-voucher-detail.entity";
import { DeepPartial, Repository } from "typeorm";

@Injectable()
export class ProductVoucherDetailRepository {
    constructor(
        @InjectRepository(ProductVoucherDetail)
        private readonly productVoucherDetailRepository: Repository<ProductVoucherDetail>
    ) { }

    public async findVoucherActiveByProductId(productId: number): Promise<ProductVoucherDetail[]> {
        return await this.productVoucherDetailRepository.find({
            where: {
                product: {
                    id: productId
                },
                productVoucher: {
                    is_active: true
                }
            },
            relations: {
                productVoucher: true,
                product: true
            },
            order: {
                id: 'DESC'
            }
        });
    }

    public async create(data: DeepPartial<ProductVoucherDetail>): Promise<ProductVoucherDetail> {
        const newProductVoucherDetail = this.productVoucherDetailRepository.create(data);
        return await this.productVoucherDetailRepository.save(newProductVoucherDetail)
    }

    public async delete(id: number): Promise<any> {
        return await this.productVoucherDetailRepository.delete({
            productVoucher: {
                id: id
            }
        });
    }
}