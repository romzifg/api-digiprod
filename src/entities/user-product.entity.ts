import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./product.entity";
import { User } from "./user.entity";
import { ProductEcourseSubMaterial } from "./product-ecourse-sub-material.entity";
import { Type } from "./type.entity";

@Entity({ name: 'user_products' })
export class UserProduct {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'uuid'
    })
    uuid: string

    @ManyToOne(() => User, (user) => user.userProducts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User

    @ManyToOne(() => Product, (product) => product.userProducts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product

    @Column({
        type: 'boolean',
        default: false
    })
    is_done: boolean

    @CreateDateColumn({
        type: 'timestamp',
        name: 'created_at'
    })
    created_at: Date

    @UpdateDateColumn({
        type: 'timestamp',
        name: 'updated_at'
    })
    updated_at: Date
}