import { Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment';
import { roleConstant } from 'src/constants/role.constant';
import { typeConstant } from 'src/constants/type.constant';
import { OrderRepository } from 'src/repositories/order.repository';
import { ProductRepository } from 'src/repositories/product.repository';
import { UserActivityHistoryRepository } from 'src/repositories/user-activity-history.repository';
import { UserProductRepository } from 'src/repositories/user-product.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { MoreThanOrEqual } from 'typeorm';

@Injectable()
export class DashboardService {
    private logger: Logger = new Logger(DashboardService.name);

    constructor(
        private readonly productRepository: ProductRepository,
        private readonly orderRepository: OrderRepository,
        private readonly userActivityRepository: UserActivityHistoryRepository,
        private readonly userProductRepository: UserProductRepository,
        private readonly userRepository: UserRepository
    ) { }

    public async getStatistic(author: any): Promise<any> {
        try {
            let authorUuid: string = '';

            if (author.role == roleConstant.CREATOR) {
                authorUuid = author.uuid;
            }

            const countProduct = await this.productRepository.countProduct(authorUuid)
            const countOrder = await this.orderRepository.countOrder(authorUuid)
            const countMember = await this.orderRepository.countMemberFromOrder(authorUuid)
            const countEcourse = await this.orderRepository.countSalesPerType(typeConstant.ECOURSE, authorUuid)
            const countEbook = await this.orderRepository.countSalesPerType(typeConstant.EBOOK, authorUuid)
            const countWebinar = await this.orderRepository.countSalesPerType(typeConstant.WEBINAR, authorUuid)
            const countUser = await this.userRepository.countUser(roleConstant.USER)

            return {
                product: countProduct,
                order: countOrder,
                member: (author.role == roleConstant.ADMIN) ? countUser : countMember,
                e_course: countEcourse,
                e_book: countEbook,
                webinar: countWebinar,
            }
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    public async getLatestProduct(author: any): Promise<any> {
        try {
            let authorUuid: string = '';

            if (author.role == roleConstant.CREATOR) {
                authorUuid = author.uuid;
            }

            return await this.productRepository.findLatestProduct(authorUuid)
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    public async getLatestOrder(author: any): Promise<any> {
        try {
            let authorUuid: string = '';

            if (author.role == roleConstant.CREATOR) {
                authorUuid = author.uuid;
            }

            return await this.orderRepository.findLatestOrder(authorUuid)
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    public async getRevenuePerType(author: any): Promise<any> {
        try {
            let authorUuid: string = '';

            if (author.role == roleConstant.CREATOR) {
                authorUuid = author.uuid;
            }

            const eCourseRevenue = await this.orderRepository.getTotalRevenuePerType(typeConstant.ECOURSE, authorUuid)
            const ebookRevenue = await this.orderRepository.getTotalRevenuePerType(typeConstant.EBOOK, authorUuid)
            const webinarRevenue = await this.orderRepository.getTotalRevenuePerType(typeConstant.WEBINAR, authorUuid)

            let totalEcourseRevenue
            let totalEcourseSales

            let totalEbookRevenue
            let totalEbookSales

            let totalWebinarRevenue
            let totalWebinarSales

            for (const ecourse of eCourseRevenue) {
                totalEcourseRevenue += ecourse.amount
                totalEcourseSales += 1
            }

            for (const ebook of ebookRevenue) {
                totalEbookRevenue += ebook.amount
                totalEbookSales += 1
            }

            for (const webinar of webinarRevenue) {
                totalWebinarRevenue += webinar.amount
                totalWebinarSales += 1
            }

            return {
                e_course: {
                    revenue: totalEcourseRevenue,
                    sales: totalEcourseSales
                },
                e_book: {
                    revenue: totalEbookRevenue,
                    sales: totalEbookSales
                },
                webinar: {
                    revenue: totalWebinarRevenue,
                    sales: totalWebinarSales
                }
            }
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    public async getTotalRevenue(author: any): Promise<any> {
        try {
            let authorUuid: string = '';

            if (author.role == roleConstant.CREATOR) {
                authorUuid = author.uuid;
            }

            const revenue =  await this.orderRepository.getTotalRevenue(authorUuid)

            return {
                revenue: revenue
            }
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    public async getStatisticUser(userUuid: any): Promise<any> {
        try {
            const totalEcourse = await this.orderRepository.countMemberOrder(userUuid, typeConstant.ECOURSE)
            const totalEbook = await this.orderRepository.countMemberOrder(userUuid, typeConstant.EBOOK)
            const totalWebinar = await this.orderRepository.countMemberOrder(userUuid, typeConstant.WEBINAR)
            const totalOrder  = totalEcourse + totalEbook + totalWebinar
            const totalDone = await this.userProductRepository.findAll({
                where: {
                    user: {
                        uuid: userUuid
                    },
                    is_done: true
                }
            })

            const totalInProgress = await this.userProductRepository.findAll({
                where: {
                    user: {
                        uuid: userUuid
                    },
                    is_done: false
                }
            })

            const progress = (totalDone.length / (totalDone.length + totalInProgress.length)) * 100 || 0
            const upComingWebinar = await this.userProductRepository.findAll({
                select: {
                    id: true,
                    created_at: true,
                    product: {
                        name: true,
                        webinar_date: true,
                        webinar_time: true
                    }
                },
                relations: {
                    product: true
                },
                where: {
                    user: {
                        uuid: userUuid
                    },
                    product: {
                        type: {
                            code: typeConstant.WEBINAR
                        },
                        webinar_date: MoreThanOrEqual(moment().toDate())
                    },
                },
                take: 2,
                order: {
                    created_at: 'DESC'
                }
            })

            const activityHistory = await this.userActivityRepository.findRecentActivity({
                select: {
                    id: true,
                    activity: true,
                    created_at: true,
                    type: {
                        code: true,
                        name: true
                    }
                },
                relations: {
                    type: true
                },
                where: {
                    user: {
                        uuid: userUuid
                    }
                },
                take: 3,
                order: {
                    created_at: 'DESC'
                }
            })

            return {
                e_course: totalEcourse || 0,
                e_book: totalEbook || 0,
                webinar: totalWebinar || 0,
                order: totalOrder || 0,
                done: totalDone?.length || 0,
                in_progress: totalInProgress?.length || 0,
                progress: Math.round(progress),
                up_coming_webinar: upComingWebinar,
                activity_history: activityHistory,
            }
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
}
