import { Module } from '@nestjs/common';
import { ProductVoucherService } from './product-voucher.service';
import { ProductVoucherController } from './product-voucher.controller';
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
  imports: [RepositoryModule],
  controllers: [ProductVoucherController],
  providers: [ProductVoucherService],
})
export class ProductVoucherModule {}
