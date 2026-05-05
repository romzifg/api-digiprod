import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "src/entities/product.entity";
import { UserProduct } from "src/entities/user-product.entity";
import { User } from "src/entities/user.entity";
import { DeepPartial, FindManyOptions, FindOneOptions, Repository, UpdateResult } from "typeorm";

@Injectable()
export class UserProductRepository {
    constructor(
        @InjectRepository(UserProduct)
        private readonly userProductRepository: Repository<UserProduct>
    ) { }

    public async findAll(params: FindManyOptions<UserProduct>): Promise<UserProduct[]> {
        return await this.userProductRepository.find(params);
    }

    public async findOne(params: FindOneOptions<UserProduct>): Promise<UserProduct | null> {
        return await this.userProductRepository.findOne(params)
    }

    public async create(userProduct: DeepPartial<UserProduct>): Promise<UserProduct> {
        const newUserProduct = this.userProductRepository.create(userProduct);
        return await this.userProductRepository.save(newUserProduct)
    }

    public async update(product: Product, user: User, data: DeepPartial<UserProduct>): Promise<UpdateResult> {
        return await this.userProductRepository.update({ product: product, user: user }, data);
    }
}