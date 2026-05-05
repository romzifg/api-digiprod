import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserActivityHistory } from "src/entities/user-activity-history.entity";
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from "typeorm";

@Injectable()
export class UserActivityHistoryRepository {
    constructor(
        @InjectRepository(UserActivityHistory)
        private readonly userActivityHistoryRepository: Repository<UserActivityHistory>
    ) { }

    public async findAll(params: FindManyOptions<UserActivityHistory>): Promise<UserActivityHistory[]> {
        return await this.userActivityHistoryRepository.find(params);
    }

    public async findOneBySubMaterial(params: FindOneOptions<UserActivityHistory>): Promise<UserActivityHistory | null> {
        return await this.userActivityHistoryRepository.findOne(params)
    }

    public async findRecentActivity(params: FindManyOptions<UserActivityHistory>): Promise<UserActivityHistory[]> {
        return await this.userActivityHistoryRepository.find(params)
    }

    public async create(userActivityHistory: DeepPartial<UserActivityHistory>): Promise<UserActivityHistory> {
        const newUserActivityHistory = this.userActivityHistoryRepository.create(userActivityHistory);
        return await this.userActivityHistoryRepository.save(newUserActivityHistory)
    }
}