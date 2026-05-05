import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./product.entity";
import { ProductEcourseSubMaterial } from "./product-ecourse-sub-material.entity";

@Entity({ name: 'product_ecourse_materials' })
export class ProductEcourseMaterial {
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

    @ManyToOne(() => Product, (product) => product.productEcourseMaterials)
    @JoinColumn({ name: 'product_id' })
    product: Product


    @OneToMany(() => ProductEcourseSubMaterial, (product) => product.productEcourseMaterial, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    productEcourseSubMaterials: ProductEcourseSubMaterial

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