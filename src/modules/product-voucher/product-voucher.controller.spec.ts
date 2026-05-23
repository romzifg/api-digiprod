import { Test, TestingModule } from '@nestjs/testing';
import { ProductVoucherController } from './product-voucher.controller';
import { ProductVoucherService } from './product-voucher.service';

describe('ProductVoucherController', () => {
  let controller: ProductVoucherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductVoucherController],
      providers: [ProductVoucherService],
    }).compile();

    controller = module.get<ProductVoucherController>(ProductVoucherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
