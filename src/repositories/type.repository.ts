import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Type } from "src/entities/type.entity";
import { DeepPartial, Repository } from "typeorm";

@Injectable()
export class TypeRepository {
    constructor(
        @InjectRepository(Type)
        private readonly typeRepository: Repository<Type>
    ) { }

    public async findAll(): Promise<Type[]> {
        return await this.typeRepository.find({
            order: {
                id: 'ASC'
            }
        });
    }

    public async findOne(id: number): Promise<Type | null> {
        return await this.typeRepository.findOneBy({
            id
        })
    }

    public async findByCode(code: string): Promise<Type | null> {
        return await this.typeRepository.findOne({
            where: {
                code: code
            }
        })
    }

    public async create(type: DeepPartial<Type>): Promise<Type> {
        const newType = this.typeRepository.create(type);
        return await this.typeRepository.save(newType)
    }

    public async update(id: number, type: DeepPartial<Type>): Promise<Type | null> {
        await this.typeRepository.update(id, type);
        return this.findOne(id)
    }
}