import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Category } from "./category.entity";
import { Order } from "./order.entity";
import { ProductApproval } from "./product-approval.entity";
import { ProductAudience } from "./product-audience.entity";
import { ProductEcourseMaterial } from "./product-ecourse-material.entity";
import { ProductLearnPoint } from "./product-learn-point.entity";
import { ProductRating } from "./product-rating.entity";
import { ProductVoucherDetail } from "./product-voucher-detail.entity";
import { Type } from "./type.entity";
import { User } from "./user.entity";
import { UserActivityHistory } from "./user-activity-history.entity";
import { UserProduct } from "./user-product.entity";

const LEVEL: string[] = ['beginer', 'intermediate', 'advanced']

@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'uuid'
    })
    uuid: string;

    @Column({
        length: 20,
        nullable: true
    })
    code: string;

    @Column({
        length: 100
    })
    name: string;

    @Column({
        type: 'text'
    })
    description: string

    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'category_id' })
    category: Category

    @ManyToOne(() => Type, (type) => type.product)
    @JoinColumn({ name: 'type_id' })
    type: Type

    @ManyToOne(() => User, (author) => author.products)
    @JoinColumn({ name: 'author_id' })
    author: User

    @Column({
        type: 'enum',
        enum: LEVEL
    })
    level: string

    @Column({
        type: 'int'
    })
    status: number

    @Column({
        nullable: true,
        length: 255,
    })
    image: string

    @Column({
        type: 'numeric'
    })
    price: number

    @Column({
        type: 'int',
        default: 0
    })
    amount_sold: number;

    @Column({
        type: 'int',
        default: 0
    })
    ebook_page_count: number;

    @Column({
        type: 'text',
        nullable: true
    })
    ebook_link: string;

    @Column({
        type: 'int',
        default: 0,
    })
    webinar_duration: number;

    @Column({
        type: 'time',
        nullable: true
    })
    webinar_time: string;

    @Column({
        type: 'date',
        nullable: true
    })
    webinar_date: Date;

    @Column({
        length: 255,
        nullable: true
    })
    webinar_link: string;

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

    @OneToMany(() => ProductAudience, (product) => product.product)
    productAudiences: ProductAudience[];

    @OneToMany(() => ProductLearnPoint, (product) => product.product)
    productLearnPoints: ProductLearnPoint[];

    @OneToMany(() => ProductApproval, (product) => product.product)
    productApprovals: ProductApproval[];

    @OneToMany(() => ProductRating, (product) => product.product)
    productRatings: ProductRating[];

    @OneToMany(() => ProductEcourseMaterial, (product) => product.product)
    productEcourseMaterials: ProductEcourseMaterial[];

    @OneToMany(() => ProductVoucherDetail, (product) => product.product)
    productVoucherDetails: ProductVoucherDetail[];

    @OneToMany(() => UserProduct, (product) => product.product)
    userProducts: UserProduct[];

    @OneToMany(() => UserActivityHistory, (product) => product.product)
    userActivityHistories: UserActivityHistory[];

    @OneToMany(() => Order, (product) => product.product)
    orders: Order[];
}