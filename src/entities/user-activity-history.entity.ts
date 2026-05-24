import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./product.entity";
import { User } from "./user.entity";
import { ProductEcourseSubMaterial } from "./product-ecourse-sub-material.entity";
import { Type } from "./type.entity";

@Entity({ name: 'user_activity_histories' })
export class UserActivityHistory {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, (user) => user.userActivityHistories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User

    @ManyToOne(() => Product, (product) => product.userActivityHistories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product

    @ManyToOne(() => ProductEcourseSubMaterial, (product) => product.userActivityHistories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ecourse_sub_material_id' })
    ecourseSubMaterial: ProductEcourseSubMaterial | null

    @ManyToOne(() => Type, (type) => type.userActivityHistory, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'type_id' })
    type: Type

    @Column({
        type: 'varchar',
        length: 100
    })
    activity: string

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