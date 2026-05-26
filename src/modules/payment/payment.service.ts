import { randomUUID } from 'crypto';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import moment from "moment";
import { generalConstant } from 'src/constants/general.constant';
import { orderContant } from 'src/constants/order.contant';
import { paymentMethodContant } from 'src/constants/payment-method.contant';
import { getPaymentStatus, paymentStatusStringConstant } from 'src/constants/payment-status.contant';
import { OrderRepository } from 'src/repositories/order.repository';
import { PaymentRepository } from 'src/repositories/payment.repository';
import { ProductRepository } from 'src/repositories/product.repository';
import { UserProductRepository } from 'src/repositories/user-product.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { TransactionUtil } from 'src/utils/transaction.util';
import { QueryRunner } from 'typeorm';

@Injectable()
export class PaymentService {
    private logger: Logger = new Logger(PaymentService.name);

    constructor(
        private readonly userRepository: UserRepository,
        private readonly orderRepository: OrderRepository,
        private readonly paymentRepository: PaymentRepository,
        private readonly productRepository: ProductRepository,
        private readonly userProductRepository: UserProductRepository,
        private readonly transactionUtil: TransactionUtil,
    ) { }

    public async getMidtransWebhook(body: any): Promise<any> {
        try {
            const result = await this.transactionUtil.execetueTransaction(
                async (queryRunner: QueryRunner): Promise<any> => {
                    const order = await this.orderRepository.findOne({
                        relations: {
                            user: true,
                            product: {
                                author: true
                            }
                        },
                        where: { uuid: body.order_id }
                    })

                    if (!order) {
                        throw new NotFoundException(generalConstant.ORDER_NOT_FOUND);
                    }

                    const status = getPaymentStatus(body.transaction_status)
                    let baseData: Record<string, any> = {
                        status,
                        payment_type: body.payment_type,
                        transaction_id: body.transaction_id,
                    }

                    if (body.payment_type == paymentMethodContant.BANK_TRANSFER) {
                        const va = body.va_numbers && body.va_numbers.length > 0 ? body.va_numbers[0] : null;
                        if (va) {
                            baseData.va_number = va.va_number;
                            baseData.bank = va.bank;
                        }
                    }

                    const isSettled = body.transaction_status == paymentStatusStringConstant.SETTLEMENT
                    if (isSettled) {
                        baseData.paid_at = moment().format("YYYY-MM-DD HH:mm:ss");
                    }

                    await this.paymentRepository.update(order, baseData, queryRunner);
                    if (isSettled) {
                        const author = await this.userRepository.findByUuid(order.product.author.uuid);
                        if (!author) {
                            throw new NotFoundException(generalConstant.USER_NOT_FOUND);
                        }

                        const priorBalance = author.balance ? +author.balance : 0;
                        const newBalance = priorBalance + +body.gross_amount
                        await this.userRepository.updateBalance(author.uuid, newBalance, queryRunner);

                        const product = await this.productRepository.findByUuid(order.product.uuid);
                        if (!product) {
                            throw new NotFoundException(generalConstant.PRODUCT_NOT_FOUND);
                        }
                        const amountSold = product.amount_sold + 1
                        await this.productRepository.updateWithTransaction(order.product.uuid, {
                            amount_sold: amountSold + 1
                        }, queryRunner)

                        await this.orderRepository.update(order.uuid, { status: orderContant.SUCCESS }, queryRunner)

                        await this.userProductRepository.create({
                            uuid: randomUUID(),
                            user: order.user,
                            product: order.product
                        }, queryRunner)
                    }
                }
            )

            if (result instanceof Error) {
                throw new BadRequestException(result.message);
            }

            return {
                message: "Webhook processed successfully"
            }
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
}
