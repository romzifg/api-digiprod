import { Injectable, Logger } from '@nestjs/common';
import { CategoryDto } from 'src/dto/category.dto';
import { Category } from 'src/entities/category.entity';
import { CategoryRepository } from 'src/repositories/category.repository';

@Injectable()
export class CategoryService {
    private logger: Logger = new Logger(CategoryService.name)

    constructor(private readonly categoryRepo: CategoryRepository) { }

    public async getAll(): Promise<Category[]> {
        try {
            return await this.categoryRepo.findAll();
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async getOne(id: number): Promise<Category | null> {
        try {
            return await this.categoryRepo.findOne(id);
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async create(payload: CategoryDto): Promise<Category | null> {
        try {
            return await this.categoryRepo.create(payload);
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async update(id: number, payload: CategoryDto): Promise<Category | null> {
        try {
            return await this.categoryRepo.update(id, payload);
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }
}
