import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { RepositoryModule } from 'src/repositories/repository.module';
import { UtilModule } from 'src/utils/util.module';
import { ClientModule } from 'src/clients/client.module';

@Module({
  imports: [RepositoryModule, UtilModule, ClientModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule { }
