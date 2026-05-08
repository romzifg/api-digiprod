import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { DeepPartial, Not, QueryRunner, Repository, UpdateResult } from "typeorm";

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

    public async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: {
                email: email
            }
        })
    }

    public async findByUuid(uuid: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: {
                uuid: uuid
            },
            relations: {
                job: true
            }
        })
    }

    public async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: {
                phone_number: phoneNumber
            }
        })
    }

    public async countUser(role: string): Promise<number> {
        return await this.userRepository.count({
            where: {
                role: role
            }
        })
    }

    public async create(user: DeepPartial<User>): Promise<User> {
        const newUser = this.userRepository.create(user);
        return await this.userRepository.save(newUser)
    }

    public async update(uuid: string, data: DeepPartial<User>): Promise<User | null> {
        await this.userRepository.update({ uuid }, data);
        return await this.userRepository.findOne({
            where: {
                uuid: uuid
            }
        })
    }

    public async updateBalance(uuid: string, balance: number, queryRunner: QueryRunner): Promise<UpdateResult> {
        return await queryRunner.manager.update(User, { uuid: uuid }, { balance })
    }

    public async existEmailFromOtherUser(email: string, uuid: string): Promise<boolean> {
        const count = await this.userRepository.count({
            where: {
                email: email,
                uuid: Not(uuid)
            }
        })

        return count > 0
    }

    public async existPhoneFromOtherUser(phone: string, uuid: string): Promise<boolean> {
        const count = await this.userRepository.count({
            where: {
                phone_number: phone,
                uuid: Not(uuid)
            }
        })

        return count > 0
    }
}