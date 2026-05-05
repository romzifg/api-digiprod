import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Order } from "./order.entity";
import { User } from "./user.entity";
import { Product } from "./product.entity";

@Entity({ name: 'payments' })
export class Payment {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({ name: 'user_id' })
    users: User[]

    @ManyToOne(() => Product, (product) => product.orders)
    @JoinColumn({ name: 'products' })
    products: Product[]

    @OneToOne(() => Order, (order) => order.payment)
    @JoinColumn({ name: 'order_id' })
    order: Order

    @Column({
        type: 'uuid'
    })
    uuid: string

    @Column({
        type: 'int'
    })
    status: number

    @Column({
        type: 'float8'
    })
    amount: number

    @Column({
        nullable: true
    })
    payment_link: string

    @Column({
        nullable: true,
        length: 50
    })
    payment_type: string

    @Column({
        nullable: true,
        length: 50
    })
    va_number: string

    @Column({
        nullable: true,
        length: 50
    })
    bank: string

    @Column({
        nullable: true,
        length: 50
    })
    acquirer: string

    @Column({
        nullable: true,
    })
    transaction_id: string

    @Column({
        nullable: true,
        length: 15
    })
    biller_code: string

    @Column({
        nullable: true,
        type: 'text'
    })
    description: string

    @Column({
        nullable: true,
        type: 'timestamp without time zone'
    })
    expired_at: Date

    @Column({
        nullable: true,
        type: 'timestamp without time zone'
    })
    paid_at: Date

    @CreateDateColumn({
        name: 'created_at'
    })
    created_at: Date

    @UpdateDateColumn({
        name: 'updated_at'
    })
    updated_at: Date
}