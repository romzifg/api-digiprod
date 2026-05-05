import { Module } from '@nestjs/common';
import { AwsUtil } from './aws.util';
import { PaginationUtil } from './pagination.util';
import { TransactionUtil } from './transaction.util';

@Module({
    providers: [AwsUtil, PaginationUtil, TransactionUtil],
    exports: [AwsUtil, PaginationUtil, TransactionUtil],
})
export class UtilModule { }
