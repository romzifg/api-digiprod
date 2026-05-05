import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Payment } from "./payment.entity";
import { Product } from "./product.entity";
import { User } from "./user.entity";

@Entity({ name: 'orders' })
export class Order {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({ name: 'user_id' })
    user: User[]

    @ManyToOne(() => Product, (product) => product.orders)
    @JoinColumn({ name: 'product_id' })
    product: Product[]

    @OneToOne(() => Payment, (payment) => payment.order)
    payment: Payment

    @Column({
        type: 'uuid'
    })
    uuid: string

    @Column({
        length: 20
    })
    code: string

    @Column({
        type: 'timestamp without time zone'
    })
    date: Date

    @Column({
        type: 'int'
    })
    status: number

    @Column({
        type: 'float8'
    })
    amount: number

    @Column({
        type: 'boolean',
        default: false
    })
    use_voucher: boolean

    @CreateDateColumn({
        name: 'created_at'
    })
    created_at: Date

    @UpdateDateColumn({
        name: 'updated_at'
    })
    updated_at: Date
}