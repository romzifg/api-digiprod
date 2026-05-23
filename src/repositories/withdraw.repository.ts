import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "src/entities/product.entity";
import { Withdraw } from "src/entities/withdraw.entity";
import { User } from "src/entities/user.entity";
import { DeepPartial, FindManyOptions, FindOneOptions, FindOptionsWhere, IsNull, Not, QueryRunner, Repository, UpdateResult } from "typeorm";
import { IQueryParams } from "src/interfaces/database.interface";
import * as moment from "moment";

@Injectable()
export class WithdrawRepository {
    constructor(
        @InjectRepository(Withdraw)
        private readonly withdrawRepository: Repository<Withdraw>
    ) { }

    public async findAllWithPagination(params: IQueryParams, authorUuid: string): Promise<{ data: Withdraw[], total: number }> {
        const offset: number = params.page * params.limit;
        let whereClause: FindOptionsWhere<Withdraw>[] = []
        if (authorUuid) {
            const authorFilter: FindOptionsWhere<Withdraw> = {
                user: {
                    uuid: authorUuid
                }
            }
            whereClause.push(authorFilter)
        }

        const [data, total] = await this.withdrawRepository.findAndCount({
            select: {
                id: true,
                uuid: true,
                code: true,
                status: true,
                amount: true,
                date: true,
                updated_at: true
            },
            where: whereClause,
            order: {
                updated_at: 'DESC'
            },
            skip: offset,
            take: params.limit
        })

        return { data, total }
    }

    public async findOne(params: FindOneOptions<Withdraw>): Promise<Withdraw | null> {
        return await this.withdrawRepository.findOne(params)
    }

    public async create(data: DeepPartial<Withdraw>, queryRunner: QueryRunner): Promise<Withdraw> {
        data.code = await this.generateWithdrawCode()
        const newWithdraw = queryRunner.manager.create(Withdraw, data);
        return await queryRunner.manager.save(newWithdraw)
    }

    public async update(uuid: string, data: DeepPartial<Withdraw>): Promise<UpdateResult> {
        return await this.withdrawRepository.update({ uuid }, data);
    }

    public async updateWithTransaction(uuid: string, data: DeepPartial<Withdraw>, queryRunner: QueryRunner): Promise<UpdateResult> {
        return await queryRunner.manager.update(Withdraw, { uuid }, data)
    }

    private async generateWithdrawCode(): Promise<string> {
        const datePart = moment().format('DDMMYY')
        const lastOrder = await this.findOne({
            select: { code: true },
            where: {
                code: Not(IsNull())
            },
            order: {
                code: 'DESC'
            }
        })

        let newNumber = 1
        if (lastOrder?.code) {
            const regex = /^WD-(\d{6})-(\d{4})$/
            const match = lastOrder.code.match(regex)

            if (match) {
                const lastDatePart = match[1]
                const lastNumber = parseInt(match[2], 10)

                if (lastDatePart === datePart) {
                    newNumber = lastNumber + 1
                }
            }
        }

        return `WD-${datePart}-${String(newNumber).padStart(4, '0')}`
    }
}