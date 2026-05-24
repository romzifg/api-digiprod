import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Withdraw } from "./withdraw.entity";

@Entity({ name: 'withdraw_approvals' })
export class WithdrawApproval {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'uuid',
    })
    uuid: string

    @Column({
        type: 'int',
    })
    status: number

    @Column({
        type: 'text',
        nullable: true
    })
    note: string | null

    @ManyToOne(() => User, (user) => user.withdrawApprovals, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'approval_id' })
    user: User

    @ManyToOne(() => Withdraw, (withdraw) => withdraw.withdrawApprovals, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'withdraw_id' })
    withdraw: Withdraw

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