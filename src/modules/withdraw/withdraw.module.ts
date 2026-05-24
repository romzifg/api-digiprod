import { Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { RepositoryModule } from 'src/repositories/repository.module';
import { UtilModule } from 'src/utils/util.module';

@Module({
  imports: [RepositoryModule, UtilModule],
  controllers: [WithdrawController],
  providers: [WithdrawService],
})
export class WithdrawModule {}
