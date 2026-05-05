import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'jobs' })
export class Job {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        length: 30,
        unique: true
    })
    name: string

    @Column({
        type: 'text',
        nullable: true
    })
    description: string

    @OneToMany(() => User, (user) => user.job)
    users: User[]

    @CreateDateColumn({
        name: 'created_at'
    })
    created_at: Date

    @UpdateDateColumn({
        name: 'updated_at'
    })
    updated_at: Date
}