import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  public async getMidtransWebhook(@Body() data: any ): Promise<any> {
    return this.paymentService.getMidtransWebhook(data);
  }
}
