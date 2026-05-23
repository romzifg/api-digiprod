import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { RepositoryModule } from 'src/repositories/repository.module';
import { UtilModule } from 'src/utils/util.module';

@Module({
  imports: [RepositoryModule, UtilModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule { }
