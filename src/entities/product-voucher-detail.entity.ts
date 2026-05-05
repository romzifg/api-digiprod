import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./product.entity";
import { ProductVoucher } from "./product-voucher.entity";

@Entity({ name: 'product_voucher_details' })
export class ProductVoucherDetail {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => ProductVoucher, (productVoucher) => productVoucher.productVoucherDetails, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_voucher_id' })
    productVoucher: ProductVoucher

    @ManyToOne(() => Product, (product) => product.productVoucherDetails, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product

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