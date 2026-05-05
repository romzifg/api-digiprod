import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WithdrawApproval } from "src/entities/withdraw-approval.entity";
import { DeepPartial, FindOneOptions, Repository } from "typeorm";

@Injectable()
export class WithdrawApprovalRepository {
    constructor(
        @InjectRepository(WithdrawApproval)
        private readonly withdrawApprovalRepository: Repository<WithdrawApproval>
    ) { }

    public async findOne(params: FindOneOptions<WithdrawApproval>): Promise<WithdrawApproval | null> {
        return await this.withdrawApprovalRepository.findOne(params)
    }

    public async create(data: DeepPartial<WithdrawApproval>): Promise<WithdrawApproval> {
        const newWithdrawApproval = this.withdrawApprovalRepository.create(data);
        return await this.withdrawApprovalRepository.save(newWithdrawApproval)
    }
}