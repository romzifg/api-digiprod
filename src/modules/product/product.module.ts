import { UtilModule } from './../../utils/util.module';
import { RepositoryModule } from './../../repositories/repository.module';
import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [RepositoryModule, UtilModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
