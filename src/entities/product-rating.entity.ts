import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./product.entity";
import { User } from "./user.entity";
import { IsOptional } from "class-validator";

@Entity({ name: 'product_ratings' })
export class ProductRating {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'int'
    })
    rating: number

    @Column({
        type: 'text',
        nullable: true
    })
    @IsOptional()
    review: string | null

    @ManyToOne(() => Product, (product) => product.productRatings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product

    @ManyToOne(() => User, (user) => user.productRatings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User

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