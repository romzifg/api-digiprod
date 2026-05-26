import { AwsUtil } from 'src/utils/aws.util';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';
import { WithdrawRepository } from 'src/repositories/withdraw.repository';
import { WithdrawApprovalRepository } from 'src/repositories/withdraw-approval.repository';
import { TransactionUtil } from 'src/utils/transaction.util';
import { PaginationUtil } from 'src/utils/pagination.util';
import { randomUUID } from 'crypto';
import * as path from 'path'
import { Withdraw } from 'src/entities/withdraw.entity';
import { User } from 'src/entities/user.entity';
import { ApproveRejectDto } from 'src/dto/approve-reject.dto';
import { WithdrawApproval } from 'src/entities/withdraw-approval.entity';
import { withdrawStatusConstant } from 'src/constants/withdraw-status.constant';
import { IQueryParams } from 'src/interfaces/database.interface';
import { roleConstant } from 'src/constants/role.constant';
import { generalConstant } from 'src/constants/general.constant';
import { WithdrawDto } from 'src/dto/withdraw.dto';
import { DeepPartial, QueryRunner } from 'typeorm';
import moment from "moment";

@Injectable()
export class WithdrawService {
    private logger: Logger = new Logger(WithdrawService.name);

    constructor(
        private readonly withdrawRepository: WithdrawRepository,
        private readonly withdrawApprovalRepository: WithdrawApprovalRepository,
        private readonly userRepository: UserRepository,
        private readonly transactionUtil: TransactionUtil,
        private readonly paginationUtil: PaginationUtil,
        private readonly awsUtil: AwsUtil,
    ) { }

    public async finalizeObjectFromTemp(productUuid: string, imageKey: string): Promise<string> {
        try {
            let imageUrl: string | undefined
            if (imageKey) {
                if (!imageKey.startsWith('temp/')) {
                    throw new BadRequestException('Invalide temp image key')
                }

                const ext = path.extname(imageKey || '.png')
                let finalKey = `withdraw/images/${productUuid}/${randomUUID()}${ext}`
                imageUrl = await this.awsUtil.finalizeObjectFromTemp(imageKey, finalKey)
            }

            return imageUrl || ''
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    private buildApprovalPayload(withdraw: Withdraw, user: User, data: ApproveRejectDto) {
        const payload: Partial<WithdrawApproval> = {
            uuid: randomUUID(),
            status: data.status,
            withdraw,
            user,
            note: null
        }

        if (data.status == withdrawStatusConstant.REJECTED) {
            payload.note = data.note || ''
        }

        return payload
    }

    public async getAll(user: any, params: IQueryParams): Promise<any> {
        try {
            let userUuid: string | null = null

            if (user.role == roleConstant.CREATOR) {
                userUuid = user.uuid
            }

            const { data, total } = await this.withdrawRepository.findAllWithPagination(params, userUuid)
            const paginationParams = {
                count: total,
                page: +params.page,
                pageSize: +params.limit,
                data: data
            }

            return this.paginationUtil.generatePagination(paginationParams)
        } catch (error) {
            this.logger.error(error)
            throw error;
        }
    }

    public async getAuthorData(uuid: string): Promise<any> {
        try {
            const author = await this.userRepository.findByUuid(uuid)
            if (!author) {
                throw new BadRequestException(generalConstant.USER_NOT_FOUND)
            }

            return {
                balance: author.balance,
                bank: author.bank,
                bank_account_number: author.bank_account_number,
                bank_account_name: author.bank_account_name,
            }
        } catch (error) {
            this.logger.error(error)
            throw error;
        }
    }

    public async getByUuid(uuid: string): Promise<any> {
        try {
            const withdraw = await this.withdrawRepository.findOne({
                select: {
                    id: true,
                    uuid: true,
                    code: true,
                    status: true,
                    amount: true,
                    date: true,
                    proof_image: true,
                    user: {
                        name: true,
                        bank: true,
                        bank_account_number: true,
                        bank_account_name: true,
                    }
                },
                relations: {
                    user: true
                },
                where: { uuid: uuid }
            })
            if (!withdraw) {
                throw new BadRequestException(generalConstant.WITHDRAW_NOT_FOUND)
            }

            const approval = await this.withdrawApprovalRepository.findOne({
                where: {
                    status: withdrawStatusConstant.REJECTED,
                    withdraw: {
                        uuid: uuid
                    }
                },
                order: {
                    created_at: 'DESC'
                }
            })

            withdraw.user.balance = (withdraw.user.balance) ? withdraw.user.balance : 0

            return {
                ...withdraw,
                rejected_approval: approval || null
            }
        } catch (error) {
            this.logger.error(error)
            throw error;
        }
    }

    public async create(uuid: string, data: WithdrawDto): Promise<any> {
        try {
            const result = await this.transactionUtil.execetueTransaction(
                async (queryRunner: QueryRunner) => {
                    const user = await this.userRepository.findByUuid(uuid)
                    if (!user) {
                        throw new BadRequestException(generalConstant.USER_NOT_FOUND)
                    }

                    if (data.total_amount > user.balance) {
                        throw new BadRequestException(generalConstant.BALLANCE_NOT_ENOUGH)
                    }

                    return await this.withdrawRepository.create({
                        uuid: randomUUID(),
                        amount: data.total_amount,
                        user,
                        status: withdrawStatusConstant.PENDING,
                        date: moment().format('YYYY-MM-DD')
                    }, queryRunner)
                }
            )

            if (result instanceof Error) {
                throw new BadRequestException(result.message)
            }

            return result;
        } catch (error) {
            this.logger.error(error)
            throw error;
        }
    }

    public async reSubmitWithdraw(uuid: string, status: number): Promise<any> {
        try {
            const withdraw = await this.withdrawRepository.findOne({ where: { uuid: uuid } })
            if (!withdraw) {
                throw new NotFoundException(generalConstant.WITHDRAW_NOT_FOUND)
            }

            if (status !== withdrawStatusConstant.PENDING) {
                throw new BadRequestException(generalConstant.WITHDRAW_STATUS_INVALID)
            }

            return await this.withdrawRepository.update(uuid, { status: status })
        } catch (error) {
            this.logger.error(error)
            throw error;
        }
    }

    public async presignUpload(filename: string, contentType: string, uuid: string): Promise<{
        url: string,
        key: string
    }> {
        try {
            const tempKey = this.awsUtil.makeTempKey(uuid, filename);
            return await this.awsUtil.createPresignedPutUrl(tempKey, contentType);
        } catch (error) {
            throw error;
        }
    }

    public async approveOrRejectWithdraw(userUuid: string, withdradUuid: string, data: ApproveRejectDto): Promise<any> {
        try {
            const result = await this.transactionUtil.execetueTransaction(
                async (queryRunner: QueryRunner) => {
                    const withdraw = await this.withdrawRepository.findOne({
                        relations: {
                            user: true
                        },
                        where: {
                            uuid: withdradUuid
                        }
                    })

                    if (!withdraw) {
                        throw new NotFoundException(generalConstant.WITHDRAW_NOT_FOUND)
                    }

                    const approve = await this.userRepository.findByUuid(userUuid)
                    if (!approve) {
                        throw new NotFoundException(generalConstant.USER_NOT_FOUND)
                    }

                    const approvalPayload = this.buildApprovalPayload(withdraw, approve, data);
                    await this.withdrawApprovalRepository.create(approvalPayload, queryRunner)

                    const withdrawData: DeepPartial<Withdraw> = {
                        status: data.status,
                        proof_image: null
                    }
                    if (data.status == withdrawStatusConstant.APPROVED) {
                        withdrawData.proof_image = await this.finalizeObjectFromTemp(withdradUuid, data.proof_image_key)
                    }

                    await this.withdrawRepository.updateWithTransaction(withdradUuid, withdrawData, queryRunner)

                    if (data.status == withdrawStatusConstant.APPROVED) {
                        const author = await this.userRepository.findByUuid(withdraw.user.uuid)
                        if (!author) {
                            throw new NotFoundException(generalConstant.USER_NOT_FOUND)
                        }

                        const updateBalance = +author.balance - +withdraw.amount
                        if (updateBalance < 0) {
                            throw new BadRequestException(generalConstant.BALLANCE_NOT_ENOUGH)
                        }

                        await this.userRepository.updateBalance(author.uuid, updateBalance, queryRunner)
                    }

                    return true
                }
            )

            if (result instanceof Error) {
                throw new BadRequestException(result.message)
            }

            return result
        } catch (error) {
            this.logger.error(error)
            throw error;
        }
    }
}
