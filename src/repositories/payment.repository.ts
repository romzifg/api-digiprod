import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "src/entities/order.entity";
import { Payment } from "src/entities/payment.entity";
import { DeepPartial, QueryRunner, Repository, UpdateResult } from "typeorm";

@Injectable()
export class PaymentRepository {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>
    ) { }

    public async findAll(): Promise<Payment[]> {
        return this.paymentRepository.find({
            order: {
                id: 'ASC'
            }
        });
    }

    public async findOne(id: number): Promise<Payment | null> {
        return this.paymentRepository.findOneBy({
            id
        })
    }

    public async create(order: DeepPartial<Payment>, queryRunner: QueryRunner): Promise<Payment> {
        const newPayment = queryRunner.manager.create(Payment, order);
        return queryRunner.manager.save(newPayment)
    }

    public async update(order: Order, data: DeepPartial<Payment>, queryRunner: QueryRunner): Promise<UpdateResult> {
        return await queryRunner.manager.update(Payment, { order: order }, data);
    }
}