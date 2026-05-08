import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
  imports: [RepositoryModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule { }
