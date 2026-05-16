import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./product.entity";
import { IsOptional } from "class-validator";

@Entity({ name: 'product_approvals' })
export class ProductApproval {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'uuid'
    })
    uuid: string

    @Column({
        type: 'int'
    })
    status: number

    @Column({
        type: 'text',
        nullable: true
    })
    @IsOptional()
    note?: string | null

    @ManyToOne(() => Product, (product) => product.productApprovals)
    @JoinColumn({ name: 'product_id' })
    product: Product

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