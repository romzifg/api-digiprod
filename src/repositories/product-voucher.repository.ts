import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductVoucher } from "src/entities/product-voucher.entity";
import { DeepPartial, FindOneOptions, Repository, UpdateResult } from "typeorm";

@Injectable()
export class ProductVoucherRepository {
    constructor(
        @InjectRepository(ProductVoucher)
        private readonly productVoucherRepository: Repository<ProductVoucher>
    ) { }

    public async findAll(authorUuid: string): Promise<ProductVoucher[]> {
        return await this.productVoucherRepository.find({
            where: {
                user: {
                    uuid: authorUuid
                }
            },
            order: {
                id: 'ASC'
            }
        });
    }

    public async findOne(uuid: string): Promise<ProductVoucher | null> {
        return await this.productVoucherRepository.findOne({
            select: {
                id: true,
                uuid: true,
                title: true,
                code: true,
                percentage: true,
                end_date: true,
                is_active: true,
                productVoucherDetails: {
                    id: true,
                    product: {
                        id: true,
                        uuid: true,
                        name: true
                    }
                }
            },
            relations: {
                productVoucherDetails: {
                    product: true
                }
            },
            where: {
                uuid: uuid
            }
        })
    }

    public async findByCode(code: string): Promise<ProductVoucher | null> {
        return await this.productVoucherRepository.findOne({
            where: {
                code: code
            }
        })
    }

    public async findActiveProductVoucher(params: FindOneOptions<ProductVoucher>): Promise<ProductVoucher | null> {
        return await this.productVoucherRepository.findOne(params)
    }

    public async create(data: DeepPartial<ProductVoucher>): Promise<ProductVoucher> {
        const newProductVoucher = this.productVoucherRepository.create(data);
        return await this.productVoucherRepository.save(newProductVoucher)
    }

    public async update(uuid: string, data: DeepPartial<ProductVoucher>): Promise<UpdateResult> {
        return await this.productVoucherRepository.update(uuid, data);
    }
}