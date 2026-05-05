import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Job } from 'src/entities/job.entity';
import { Order } from 'src/entities/order.entity';
import { Payment } from 'src/entities/payment.entity';
import { ProductApproval } from 'src/entities/product-approval.entity';
import { ProductAudience } from 'src/entities/product-audience.entity';
import { ProductEcourseMaterial } from 'src/entities/product-ecourse-material.entity';
import { ProductEcourseSubMaterial } from 'src/entities/product-ecourse-sub-material.entity';
import { ProductLearnPoint } from 'src/entities/product-learn-point.entity';
import { ProductRating } from 'src/entities/product-rating.entity';
import { ProductVoucherDetail } from 'src/entities/product-voucher-detail.entity';
import { ProductVoucher } from 'src/entities/product-voucher.entity';
import { Product } from 'src/entities/product.entity';
import { Type } from 'src/entities/type.entity';
import { UserActivityHistory } from 'src/entities/user-activity-history.entity';
import { UserProduct } from 'src/entities/user-product.entity';
import { User } from 'src/entities/user.entity';
import { WithdrawApproval } from 'src/entities/withdraw-approval.entity';
import { Withdraw } from 'src/entities/withdraw.entity';

import { CategoryRepository } from './category.repository';
import { JobRepository } from './job.reporitory';
import { OrderRepository } from './order.repository';
import { PaymentRepository } from './payment.repository';
import { ProductApprovalRepository } from './product-approval.repository';
import { ProductAudienceRepository } from './product-audience.repository';
import { ProductEcourseMaterialRepository } from './product-ecourse-material.repository';
import { ProductEcourseSubMaterialRepository } from './product-ecourse-sub-material.repository';
import { ProductLearnPointRepository } from './product-learn-point.repository';
import { ProductRatingRepository } from './product-rating.repository';
import { ProductVoucherRepository } from './product-voucher.repository';
import { ProductVoucherDetailRepository } from './product-voucher-detail.repository';
import { ProductRepository } from './product.repository';
import { TypeRepository } from './type.repository';
import { UserActivityHistoryRepository } from './user-activity-history.repository';
import { UserProductRepository } from './user-product.repository';
import { UserRepository } from './user.repository';
import { WithdrawRepository } from './withdraw.repository';
import { WithdrawApprovalRepository } from './withdraw-approval.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Category,
            Type,
            User,
            Job,
            Product,
            ProductApproval,
            ProductAudience,
            ProductLearnPoint,
            ProductEcourseMaterial,
            ProductEcourseSubMaterial,
            ProductVoucher,
            ProductVoucherDetail,
            ProductRating,
            Order,
            Payment,
            UserProduct,
            UserActivityHistory,
            Withdraw,
            WithdrawApproval
        ])
    ],
    providers: [
        CategoryRepository,
        JobRepository,
        OrderRepository,
        PaymentRepository,
        ProductApprovalRepository,
        ProductAudienceRepository,
        ProductEcourseMaterialRepository,
        ProductEcourseSubMaterialRepository,
        ProductLearnPointRepository,
        ProductRatingRepository,
        ProductVoucherDetailRepository,
        ProductVoucherRepository,
        ProductRepository,
        TypeRepository,
        UserActivityHistoryRepository,
        UserProductRepository,
        UserRepository,
        WithdrawApprovalRepository,
        WithdrawRepository,
    ],
    exports: [
        CategoryRepository,
        JobRepository,
        OrderRepository,
        PaymentRepository,
        ProductApprovalRepository,
        ProductAudienceRepository,
        ProductEcourseMaterialRepository,
        ProductEcourseSubMaterialRepository,
        ProductLearnPointRepository,
        ProductRatingRepository,
        ProductVoucherDetailRepository,
        ProductVoucherRepository,
        ProductRepository,
        TypeRepository,
        UserActivityHistoryRepository,
        UserProductRepository,
        UserRepository,
        WithdrawApprovalRepository,
        WithdrawRepository,
    ]
})
export class RepositoryModule { }
