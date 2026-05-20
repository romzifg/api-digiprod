import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProductVoucherDetail } from "./product-voucher-detail.entity";
import { User } from "./user.entity";

@Entity({ name: 'product_vouchers' })
export class ProductVoucher {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'uuid'
    })
    uuid: string

    @Column({
        length: '100'
    })
    title: string

    @Column({
        length: '20',
        unique: true
    })
    code: string

    @Column({
        type: 'int',
        default: 0
    })
    percentage: number

    @Column({
        type: 'date',
    })
    end_date: Date

    @Column({
        type: 'boolean',
    })
    is_active: boolean

    @ManyToOne(() => User, (user) => user.productVouchers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    user: User

    @OneToMany(() => ProductVoucherDetail, (product) => product.productVoucher, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    productVoucherDetails: ProductVoucherDetail[]

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