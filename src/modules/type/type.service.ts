import { Injectable, Logger } from '@nestjs/common';
import { TypeDto } from 'src/dto/type.dto';
import { Type } from 'src/entities/type.entity';
import { TypeRepository } from 'src/repositories/type.repository';

@Injectable()
export class TypeService {
    private logger: Logger = new Logger(TypeService.name)

    constructor(private readonly typeRepo: TypeRepository) { }

    public async getAll(): Promise<Type[]> {
        try {
            return await this.typeRepo.findAll();
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async getOne(id: number): Promise<Type | null> {
        try {
            return await this.typeRepo.findOne(id);
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async create(payload: TypeDto): Promise<Type | null> {
        try {
            return await this.typeRepo.create(payload);
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async update(id: number, payload: TypeDto): Promise<Type | null> {
        try {
            return await this.typeRepo.update(id, payload);
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }
}
