import { Module } from '@nestjs/common';
import { TypeService } from './type.service';
import { TypeController } from './type.controller';
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
  imports: [RepositoryModule],
  controllers: [TypeController],
  providers: [TypeService],
})
export class TypeModule { }
