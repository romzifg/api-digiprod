import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./product.entity";
import { UserActivityHistory } from "./user-activity-history.entity";

@Entity({ name: 'types' })
export class Type {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        unique: true,
        length: 50,
    })
    code: string;

    @Column()
    name: string;

    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @OneToMany(() => Product, (product) => product.type, { onDelete: 'CASCADE' })
    product: Product;

    @OneToMany(() => UserActivityHistory, (product) => product.type, { onDelete: 'CASCADE' })
    userActivityHistory: UserActivityHistory[];

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