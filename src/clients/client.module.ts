import { Module } from '@nestjs/common';
import { MidtransClient } from './midtrans.client';

@Module({
    providers: [MidtransClient],
    exports: [MidtransClient]
})
export class ClientModule { }
