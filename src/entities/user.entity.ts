import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Job } from "./job.entity";
import { Product } from "./product.entity";
import { ProductRating } from "./product-rating.entity";
import { ProductVoucher } from "./product-voucher.entity";
import { Order } from "./order.entity";
import { UserActivityHistory } from "./user-activity-history.entity";
import { UserProduct } from "./user-product.entity";
import { Withdraw } from "./withdraw.entity";
import { WithdrawApproval } from "./withdraw-approval.entity";

const ROLES: string[] = ['admin', 'creator', 'user']

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'uuid'
    })
    uuid: string;

    @Column()
    name: string;

    @Column({
        length: 100,
        unique: true
    })
    email: string;

    @Column({
        length: 15,
    })
    phone_number: string;

    @Column({
        nullable: true,
        type: 'date'
    })
    birth_date: Date;

    @Column({
        length: 16,
        nullable: true
    })
    identity_number: string;

    @Column({
        type: 'text',
        nullable: true
    })
    address: string;

    @Column()
    password: string;

    @ManyToOne(() => Job, (job) => job.users)
    @JoinColumn({ name: 'job_id' })
    job: Job;

    @Column({
        type: 'enum',
        enum: ROLES
    })
    role: string;


    @Column({
        type: 'text',
        nullable: true
    })
    bio: string;

    @Column({
        length: 255,
        nullable: true
    })
    photo: string;

    @Column({
        length: 50,
        nullable: true
    })
    bank: string;

    @Column({
        length: 100,
        nullable: true
    })
    bank_account_name: string;

    @Column({
        length: 50,
        nullable: true
    })
    bank_account_number: string;

    @Column({
        type: 'float8',
        nullable: true
    })
    balance: number;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP()',
        name: 'created_at'
    })
    created_at: Date

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP()',
        name: 'updated_at'
    })
    updated_at: Date

    @OneToMany(() => Product, (product) => product.author)
    products: Product[];

    @OneToMany(() => ProductRating, (product) => product.user)
    productRatings: ProductRating[];

    @OneToMany(() => ProductVoucher, (product) => product.user)
    productVouchers: ProductVoucher[];

    @OneToMany(() => UserProduct, (product) => product.user)
    userProducts: UserProduct[];

    @OneToMany(() => UserActivityHistory, (product) => product.user)
    userActivityHistories: UserActivityHistory[];

    @OneToMany(() => Order, (product) => product.user)
    orders: Order[];

    @OneToMany(() => Withdraw, (product) => product.user)
    withdraws: Withdraw[];

    @OneToMany(() => WithdrawApproval, (product) => product.user)
    withdrawApprovals: WithdrawApproval[];
}