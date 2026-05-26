import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { generalConstant } from 'src/constants/general.constant';
import { ProductVoucherDto, ValidateProductVoucherDto } from 'src/dto/voucher.dto';
import { ProductVoucher } from 'src/entities/product-voucher.entity';
import { ProductVoucherDetailRepository } from 'src/repositories/product-voucher-detail.repository';
import { ProductVoucherRepository } from 'src/repositories/product-voucher.repository';
import { ProductRepository } from 'src/repositories/product.repository';
import { UserRepository } from 'src/repositories/user.repository';

import moment from "moment"
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { ProductVoucherDetail } from 'src/entities/product-voucher-detail.entity';

@Injectable()
export class ProductVoucherService {
    private readonly logger: Logger = new Logger(ProductVoucherService.name);

    constructor(
        private readonly productRepository: ProductRepository,
        private readonly productVoucherRepository: ProductVoucherRepository,
        private readonly productVoucherDetailRepository: ProductVoucherDetailRepository,
        private readonly userRepository: UserRepository,

        private readonly dataSource: DataSource,
    ) { }

    public async getAll(userUuid: string): Promise<ProductVoucher[]> {
        try {
            return await this.productVoucherRepository.findAll(userUuid);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    public async getOne(uuid: string): Promise<ProductVoucher | null> {
        try {
            return await this.productVoucherRepository.findOne(uuid);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    public async checkVoucher(data: ValidateProductVoucherDto): Promise<any> {
        try {
            const product = await this.productRepository.findByUuid(data.product_id);
            if (!product) {
                throw new Error(generalConstant.PRODUCT_NOT_FOUND);
            }

            const voucher = await this.productVoucherRepository.findActiveProductVoucher({
                select: {
                    id: true,
                    uuid: true,
                    title: true,
                    code: true,
                    percentage: true,
                    end_date: true,
                    is_active: true
                },
                where: {
                    code: data.code,
                    is_active: true,
                    productVoucherDetails: {
                        product: {
                            uuid: data.product_id
                        }
                    }
                }
            });
            if (!voucher) {
                throw new Error(generalConstant.VOUCHER_NOT_FOUND);
            }

            const today = moment().format("YYYY-MM-DD");
            if (voucher && moment(voucher.end_date).isBefore(today)) {
                throw new Error(generalConstant.VOUCHER_EXPIRED);
            }

            return {
                ...voucher,
                normal_price: +product.price,
                discounted_price: +product.price - (+product.price * voucher.percentage / 100)
            }
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    public async create(data: ProductVoucherDto, userUuid: string): Promise<ProductVoucher | null> {
        try {
            const user = await this.userRepository.findByUuid(userUuid);
            if (!user) {
                throw new BadRequestException(generalConstant.USER_NOT_FOUND);
            }

            return await this.dataSource.transaction(async (manager) => {
                const voucherExists = await this.productVoucherRepository.findByCode(data.code.toUpperCase())
                if (voucherExists) {
                    throw new BadRequestException(generalConstant.VOUCHER_CODE_ALREADY_EXISTS);
                }

                const voucher = await manager.save(ProductVoucher, {
                    uuid: randomUUID(),
                    title: data.title,
                    code: data.code.toUpperCase(),
                    percentage: data.percentage,
                    end_date: data.end_date,
                    is_active: data.is_active ?? true,
                    user: user
                })

                let details: any = []
                for (const item of data.products) {
                    const product = await this.productRepository.findById(item);
                    if (!product) {
                        throw new BadRequestException(generalConstant.PRODUCT_NOT_FOUND);
                    }

                    const productVoucher = await this.productVoucherDetailRepository.findVoucherActiveByProductId(item);
                    if (productVoucher) {
                        throw new BadRequestException(`Product with name ${productVoucher.product.name} has already been active voucher`);
                    }

                    details.push({
                        productVoucher: voucher,
                        product: product
                    })
                }

                await manager.save(ProductVoucherDetail, details);

                return await manager.findOne(ProductVoucher, { where: { uuid: voucher.uuid } });
            })
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    public async update(uuid: string, data: ProductVoucherDto): Promise<any> {
        try {
            return await this.dataSource.transaction(async (manager) => {
                const voucher = await this.productVoucherRepository.findOne(uuid);
                if (!voucher) {
                    throw new BadRequestException(generalConstant.VOUCHER_NOT_FOUND);
                }

                await manager.update(ProductVoucher, { uuid }, {
                    title: data.title,
                    code: data.code.toUpperCase(),
                    percentage: data.percentage,
                    end_date: data.end_date,
                    is_active: data.is_active ?? true,
                })
                await manager.delete(ProductVoucherDetail, {
                    productVoucher: { id: voucher.id },
                });

                let details: any = []
                for (const item of data.products) {
                    const product = await this.productRepository.findById(item);
                    if (!product) {
                        throw new BadRequestException(generalConstant.PRODUCT_NOT_FOUND);
                    }

                    const productVoucherDetail = await manager.findOne(ProductVoucherDetail, {
                        where: {
                            product: {
                                id: item
                            },
                            productVoucher: {
                                is_active: true
                            }
                        },
                    });
                    if (productVoucherDetail) {
                        throw new BadRequestException(`Product with name ${productVoucherDetail.product.name} has already been active voucher`);
                    }

                    details.push({
                        productVoucher: voucher,
                        product: product
                    })
                }

                await manager.save(ProductVoucherDetail, details);

                return await manager.findOne(ProductVoucher, { 
                    where: { uuid: uuid } ,
                    relations: {
                        productVoucherDetails: true
                    },
                });
            })
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
}
