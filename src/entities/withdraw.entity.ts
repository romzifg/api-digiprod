import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { WithdrawApproval } from "./withdraw-approval.entity";

@Entity({ name: 'withdraws' })
export class Withdraw {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'uuid',
    })
    uuid: string

    @Column({
        length: 30,
        unique: true
    })
    code: string

    @ManyToOne(() => User, (user) => user.withdraws, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User

    @Column({
        type: 'float8',
    })
    amount: number

    @Column({
        type: 'int',
    })
    status: number

    @Column({
        type: 'timestamp without time zone',
    })
    date: Date

    @Column({
        type: 'text',
        nullable: true
    })
    proof_image: string | null

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

    @OneToMany(() => WithdrawApproval, (withdraw) => withdraw.withdraw)
    withdrawApprovals: WithdrawApproval[];
}