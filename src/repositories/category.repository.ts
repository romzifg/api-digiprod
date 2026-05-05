import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "src/entities/category.entity";
import { DeepPartial, Repository } from "typeorm";

@Injectable()
export class CategoryRepository {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>
    ) { }

    public async findAll(): Promise<Category[]> {
        return await this.categoryRepository.find({
            order: {
                id: 'ASC'
            }
        });
    }

    public async findOne(id: number): Promise<Category | null> {
        return await this.categoryRepository.findOneBy({
            id
        })
    }

    public async create(category: DeepPartial<Category>): Promise<Category> {
        const newCategory = this.categoryRepository.create(category);
        return await this.categoryRepository.save(newCategory)
    }

    public async update(id: number, category: DeepPartial<Category>): Promise<Category | null> {
        await this.categoryRepository.update(id, category);
        return this.findOne(id)
    }

    public async delete(id: number): Promise<void> {
        await this.categoryRepository.delete(id);
    }
}