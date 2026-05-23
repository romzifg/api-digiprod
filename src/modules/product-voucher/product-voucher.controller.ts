import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ProductVoucherService } from './product-voucher.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ProductVoucherDto, ValidateProductVoucherDto } from 'src/dto/voucher.dto';

@Controller('product-vouchers')
export class ProductVoucherController {
  constructor(private readonly productVoucherService: ProductVoucherService) { }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator')
  @Get()
  public async getAll(@Request() req: any) {
    return await this.productVoucherService.getAll(req.user.uuid);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator')
  @Get(':uuid')
  public async getOne(@Param('uuid') uuid: string,) {
    return await this.productVoucherService.getOne(uuid);
  }

  @Post('validation')
  public async checkVoucher(@Body() data: ValidateProductVoucherDto) {
    return await this.productVoucherService.checkVoucher(data);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator')
  @Post()
  public async create(@Request() req: any, @Body() data: ProductVoucherDto,) {
    return await this.productVoucherService.create(data, req.user.uuid);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator')
  @Put(':uuid')
  public async update(@Param('uuid') uuid: string, @Body() data: ProductVoucherDto,) {
    return await this.productVoucherService.update(uuid, data);
  }
}
