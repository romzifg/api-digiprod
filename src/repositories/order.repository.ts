import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import  moment from "moment";
import { orderContant } from "src/constants/order.contant";
import { Order } from "src/entities/order.entity";
import { IQueryParams } from "src/interfaces/database.interface";
import { DeepPartial, FindManyOptions, FindOneOptions, FindOptionsWhere, IsNull, Not, QueryRunner, Repository, UpdateResult } from "typeorm";

@Injectable()
export class OrderRepository {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>
    ) { }

    public async findAllWithPagination(params: IQueryParams, authorUuid?: string): Promise<{ data: Order[], total: number }> {
        const offset: number = (params.page - 1) * params.limit
        let whereClause: FindOptionsWhere<Order>[] = []

        if (authorUuid) {
            const authorFilter: FindOptionsWhere<Order> = {
                product: {
                    author: {
                        uuid: authorUuid
                    }
                }
            }

            whereClause = [authorFilter]
        }

        const [data, total] = await this.orderRepository.findAndCount({
            select: {
                id: true,
                uuid: true,
                code: true,
                status: true,
                date: true,
                user: {
                    name: true
                },
                product: {
                    name: true,
                    image: true,
                    type: {
                        name: true
                    }
                }
            },
            relations: {
                user: true,
                product: {
                    type: true
                }
            },
            where: whereClause,
            order: {
                id: 'DESC'
            },
            skip: offset,
            take: params.limit,
        })

        return { data, total }
    }

    public async findAllWithPaginationForUser(params: IQueryParams, userUuid?: string): Promise<{ data: Order[], total: number }> {
        const offset: number = (params.page - 1) * params.limit

        const [data, total] = await this.orderRepository.findAndCount({
            select: {
                id: true,
                uuid: true,
                code: true,
                status: true,
                date: true,
                amount: true,
                product: {
                    name: true
                }
            },
            relations: {
                product: true
            },
            where: {
                user: {
                    uuid: userUuid
                }
            },
            order: {
                id: 'DESC'
            },
            skip: offset,
            take: params.limit,
        })

        return { data, total }
    }

    public async findOne(params: FindOneOptions<Order>): Promise<Order | null> {
        return await this.orderRepository.findOne(params)
    }

    public async countOrder(authorUuid?: string): Promise<number> {
        let whereClause: FindManyOptions<Order> = {};

        if (authorUuid) {
            whereClause = {
                where: {
                    product: {
                        author: {
                            uuid: authorUuid
                        }
                    }
                }
            }
        }

        return await this.orderRepository.count(whereClause)
    }

    public async countMemberOrder(userUuid: string, type: string): Promise<number> {
        return await this.orderRepository.count({
            where: {
                user: {
                    uuid: userUuid
                },
                product: {
                    type: {
                        code: type
                    }
                },
                status: orderContant.SUCCESS
            }
        })
    }

    public async countMemberFromOrder(authorUuid?: string): Promise<number> {
        const query = this.orderRepository.createQueryBuilder('o')
            .innerJoin('o.product', 'p')
            .innerJoin('p.author', 'a')
            .innerJoin('o.user', 'u')
            .where('o.status = :status', { status: orderContant.SUCCESS })

        if (authorUuid) {
            query.andWhere('a.uuid = :authorUuid', { authorUuid })
        }

        const result = await query.select('COUNT(DISTINCT u.id)', 'cnt').getRawOne()
        return parseInt(result?.cnt ?? 0)
    }

    public async findLatestOrder(authorUuid?: string): Promise<Order[]> {
        const options: FindManyOptions<Order> = {
            select: {
                id: true,
                date: true,
                user: {
                    name: true,
                    photo: true,
                },
                status: true
            },
            relations: {
                user: true
            },
            order: {
                id: 'DESC'
            },
            take: 3
        }

        if (authorUuid) {
            options.where = {
                product: {
                    author: {
                        uuid: authorUuid
                    }
                }
            }
        }

        return await this.orderRepository.find(options)
    }

    public async countSalesPerType(typeCode: string, authorUuid?: string): Promise<number> {
        const whereClause: FindManyOptions<Order> = {
            where: {
                status: orderContant.SUCCESS,
                product: {
                    type: {
                        code: typeCode
                    },
                    ...(authorUuid && {
                        author: {
                            uuid: authorUuid
                        }
                    })
                }
            }
        }

        return await this.orderRepository.count(whereClause)
    }

    public async getTotalRevenue(authorUuid?: string): Promise<number> {
        const query = this.orderRepository.createQueryBuilder('o')
            .innerJoin('o.product', 'p')
            .innerJoin('p.author', 'a')
            .where('EXTRACT(YEAR FROM o.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)')

        if (authorUuid) {
            query.andWhere('a.uuid = :authorUuid', { authorUuid })
        }

        const result = await query
            .select('SUM(o.amount)', 'total_revenue')
            .getRawOne()
        return parseInt(result?.total_revenue ?? 0)
    }

    public async getTotalRevenuePerType(typeCode: string, authorUuid?: string): Promise<Order[]> {
        const whereClause: FindManyOptions<Order> = {
            where: {
                status: orderContant.SUCCESS,
                product: {
                    type: {
                        code: typeCode
                    },
                    ...(authorUuid && {
                        author: {
                            uuid: authorUuid
                        }
                    })
                }
            }
        }

        return await this.orderRepository.find(whereClause)
    }

    public async create(order: DeepPartial<Order>, queryRunner: QueryRunner): Promise<Order> {
        order.code = await this.generateOrderCode()
        const newOrder = queryRunner.manager.create(Order, order);
        return await queryRunner.manager.save(newOrder)
    }

    public async update(uuid: string, data: DeepPartial<Order>, queryRunner: QueryRunner): Promise<UpdateResult> {
        return await queryRunner.manager.update(Order, { uuid: uuid }, data);
    }

    private async generateOrderCode(): Promise<string> {
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
            const regex = /^ORD-(\d{6})-(\d{4})$/
            const match = lastOrder.code.match(regex)

            if (match) {
                const lastDatePart = match[1]
                const lastNumber = parseInt(match[2], 10)

                if (lastDatePart === datePart) {
                    newNumber = lastNumber + 1
                }
            }
        }

        return `ORD-${datePart}-${String(newNumber).padStart(4, '0')}`
    }
}