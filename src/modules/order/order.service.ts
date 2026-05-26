import { PaymentRepository } from './../../repositories/payment.repository';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import moment from "moment";
import { MidtransClient } from 'src/clients/midtrans.client';
import { generalConstant } from 'src/constants/general.constant';
import { orderContant } from 'src/constants/order.contant';
import { roleConstant } from 'src/constants/role.constant';
import { typeConstant } from 'src/constants/type.constant';
import { OrderDto } from 'src/dto/order.dto';
import { Order } from 'src/entities/order.entity';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { IPagination, IQueryParams } from 'src/interfaces/database.interface';
import { OrderRepository } from 'src/repositories/order.repository';
import { ProductEcourseMaterialRepository } from 'src/repositories/product-ecourse-material.repository';
import { ProductEcourseSubMaterialRepository } from 'src/repositories/product-ecourse-sub-material.repository';
import { ProductVoucherRepository } from 'src/repositories/product-voucher.repository';
import { ProductRepository } from 'src/repositories/product.repository';
import { UserProductRepository } from 'src/repositories/user-product.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { PaginationUtil } from 'src/utils/pagination.util';
import { TransactionUtil } from 'src/utils/transaction.util';
import { DeepPartial, QueryRunner } from 'typeorm';
import { MidtransDto } from 'src/dto/midtrans.dto';
import { paymentStatusContant } from 'src/constants/payment-status.contant';

@Injectable()
export class OrderService {
    private readonly logger: Logger = new Logger(OrderService.name)

    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly paymentRepository: PaymentRepository,
        private readonly productRepository: ProductRepository,
        private readonly productEcourseMaterialRepository: ProductEcourseMaterialRepository,
        private readonly productEcourseSubMaterialRepository: ProductEcourseSubMaterialRepository,
        private readonly productVoucherRepository: ProductVoucherRepository,
        private readonly userRepository: UserRepository,
        private readonly userProductRepository: UserProductRepository,
        private readonly midtransClient: MidtransClient,
        private readonly transactionUtil: TransactionUtil,
        private readonly paginationUtil: PaginationUtil,
    ) { }

    private async sendToMidtrans(data: OrderDto, user: User, product: Product, order: Order, queryRunner: QueryRunner): Promise<any> {
        const expiredDateTime = moment().add(1, 'hour')
        const expiredTimeInSeconds = expiredDateTime.diff(moment(), 'second')

        const payload: MidtransDto = {
            transaction_details: {
                order_id: order.uuid,
                gross_amount: data.total_amount,
            },
            customer_details: {
                first_name: user.name,
                email: user.email,
                phone: user.phone_number,
            },
            item_details: [
                {
                    id: product.uuid,
                    price: data.total_amount,
                    quantity: 1,
                    name: product.name,
                }
            ],
            expiry: {
                unit: 'second',
                duration: expiredTimeInSeconds
            },
            enabled_payments: this.getPaymentMethod(data.payment_method)
        }

        const midtrans = await this.midtransClient.sendToMidtrans(payload)
        let baseData = {
            uuid: randomUUID(),
            order: order,
            amount: data.total_amount,
            payment_link: midtrans.redirect_url,
            expired_at: expiredDateTime.format('YYYY-MM-DD HH:mm:ss'),
            status: paymentStatusContant.PENDING
        }

        await this.paymentRepository.create(baseData, queryRunner)
        return midtrans
    }

    private getPaymentMethod(method: string): string[] {
        const paymentMethodMap: { [key: string]: string[] } = {
            'bank_transfer': ['bca_va', 'bni_va', 'bri_va'],
            'ewallet': ['shoopepay'],
            'minimarket': ['alfamart', 'indomart'],
            'credit': ['creadit_card']
        }
        return paymentMethodMap[method] || ['bca_va', 'bni_va', 'bri_va']
    }

    public async getAll(user: any, params: IQueryParams): Promise<any> {
        try {
            let authorUuid
            if (user.role == roleConstant.CREATOR) {
                authorUuid = user.uuid
            }

            const { data, total } = await this.orderRepository.findAllWithPagination(params, authorUuid)
            const paginationParams: IPagination = {
                count: total,
                pageSize: +params.limit,
                page: +params.page,
                data,
            }

            return this.paginationUtil.generatePagination(paginationParams)
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async getByUuid(uuid: string): Promise<any | null> {
        try {
            const order: Order | null = await this.orderRepository.findOne({
                select: {
                    id: true,
                    uuid: true,
                    code: true,
                    date: true,
                    status: true,
                    amount: true,
                    use_voucher: true,
                    product: {
                        id: true,
                        uuid: true,
                        name: true,
                        image: true,
                        price: true,
                        webinar_date: true,
                        webinar_time: true,
                        webinar_duration: true,
                        ebook_page_count: true,
                        level: true,
                        category: {
                            name: true,
                        },
                        type: {
                            code: true,
                            name: true
                        },
                        author: {
                            name: true
                        }
                    },
                    user: {
                        name: true,
                        email: true
                    }
                },
                relations: {
                    payment: true,
                    user: true,
                    product: {
                        type: true,
                        category: true,
                        author: true,
                    }
                },
                where: { uuid: uuid }
            })

            if (!order) {
                throw new NotFoundException(generalConstant.ORDER_NOT_FOUND)
            }

            let totalSubModule = 0
            const modules = await this.productEcourseMaterialRepository.findByProductId(order.product.id)
            if (order.product.type.code == typeConstant.ECOURSE) {
                for (const module of modules) {
                    const submodules = await this.productEcourseSubMaterialRepository.findByMaterialId(module.id)
                    for (const submodule of submodules) {
                        totalSubModule += submodule.duration
                    }
                }
            }

            order.product['total_modules'] = modules.length ?? 0
            order.product['total_sub_modules'] = totalSubModule

            const voucher = await this.productVoucherRepository.findActiveProductVoucher({
                where: {
                    productVoucherDetails: {
                        product: {
                            uuid: order.product.uuid
                        }
                    },
                    is_active: true
                }
            })

            return {
                ...order,
                voucher_code: order.use_voucher ? voucher?.code : null,
                discount_amount: order.use_voucher ? (+order.product.price * (voucher?.percentage ?? 0)) / 100 : 0
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async create(data: OrderDto): Promise<any> {
        try {
            const result = await this.transactionUtil.execetueTransaction(
                async (queryRunner: QueryRunner): Promise<any> => {
                    const userProduct = await this.userProductRepository.findOne({
                        where: {
                            user: {
                                uuid: data.user_id
                            },
                            product: {
                                uuid: data.product_id
                            }
                        }
                    })

                    if (userProduct) {
                        throw new BadRequestException(generalConstant.PRODUCT_ALREADY_EXISTS)
                    }

                    const product = await this.productRepository.findByUuid(data.product_id)
                    if (!product) {
                        throw new NotFoundException(generalConstant.PRODUCT_NOT_FOUND)
                    }

                    const user = await this.userRepository.findByUuid(data.user_id as string)
                    if (!user) {
                        throw new NotFoundException(generalConstant.USER_NOT_FOUND)
                    }

                    const today = moment().format("YYYY-MM-DD HH:mm:ss")
                    const order: DeepPartial<Order> = {
                        uuid: randomUUID(),
                        product,
                        user,
                        amount: data.total_amount,
                        date: today,
                        status: orderContant.PENDING,
                        use_voucher: data.use_voucher
                    }

                    const newOrder = await this.orderRepository.create(order, queryRunner)

                    return this.sendToMidtrans(data, user, product, newOrder, queryRunner)
                })

            if (result instanceof Error) {
                throw new BadRequestException(result.message)
            }

            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async getOrderByUser(userUuid: string, params: IQueryParams): Promise<any> {
        try {
            const { data, total } = await this.orderRepository.findAllWithPaginationForUser(params, userUuid)
            const paginationParams: IPagination = {
                count: total,
                pageSize: +params.limit,
                page: +params.page,
                data,
            }

            return this.paginationUtil.generatePagination(paginationParams)
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }
}
