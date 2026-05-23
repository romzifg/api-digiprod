import { Test, TestingModule } from '@nestjs/testing';
import { ProductVoucherService } from './product-voucher.service';

describe('ProductVoucherService', () => {
  let service: ProductVoucherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductVoucherService],
    }).compile();

    service = module.get<ProductVoucherService>(ProductVoucherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
