import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProductEcourseMaterial } from "./product-ecourse-material.entity";
import { UserActivityHistory } from "./user-activity-history.entity";

@Entity({ name: 'product_ecourse_sub_materials' })
export class ProductEcourseSubMaterial {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'uuid'
    })
    uuid: string

    @Column({
        length: 100
    })
    title: string

    @Column()
    video_url: string

    @Column({
        type: 'int'
    })
    duration: number

    @ManyToOne(() => ProductEcourseMaterial, (product) => product.productEcourseSubMaterials, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_ecourse_material_id' })
    productEcourseMaterial: ProductEcourseMaterial

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

    @OneToMany(() => UserActivityHistory, (userActivityHistory) => userActivityHistory.ecourseSubMaterial)
    userActivityHistories: UserActivityHistory[]
}