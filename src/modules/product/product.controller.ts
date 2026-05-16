import { Body, Controller, Get, Param, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { IQueryParams } from 'src/interfaces/database.interface';
import { CreateProductDto } from 'src/dto/create-product.dto';
import { UpdateProductDto } from 'src/dto/update-product.dto';
import { ApproveRejectDto } from 'src/dto/approve-reject.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator', 'admin')
  @Post('presign-upload')
  public async presignUpload(
    @Request() req: any,
    @Body() dto: { fileName: string, contentType: string }
  ) {
    return this.productService.presignUpload(dto.fileName, dto.contentType, req.user.uuid);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator', 'admin')
  @Get()
  public async getProductPaginationForCreator(
    @Request() req: any,
    @Query() params: IQueryParams,
  ) {
    return this.productService.getProductWithPaginationForCreator(params, req.user.uuid);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('user')
  @Get('lists')
  public async getProductPaginationForUser(
    @Request() req: any,
    @Query() params: IQueryParams,
  ) {
    return this.productService.getProductWithPaginationForUser(params, req.user.uuid);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator')
  @Get('all')
  public async getAllForVoucher(
    @Request() req: any,
  ) {
    return this.productService.getAllForVoucher(req.user.uuid);
  }

  @Get(':uuid')
  public async getByUuidForUser(
    @Param('uuid') uuid: string,
  ) {
    return this.productService.getByUuidForProductDetail(uuid);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator')
  @Get('detail/:uuid')
  public async getByUuidForCreatorOrAdmin(
    @Param('uuid') uuid: string,
  ) {
    return this.productService.getByUuidForCreatorOrAdmin(uuid);
  }

  @Get('by-type')
  public async getForLandingPage(
    @Query() params: any,
  ) {
    return this.productService.getProductLandingPage(params);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator')
  @Post()
  public async create(
    @Request() req: any,
    @Body() data: CreateProductDto
  ) {
    return this.productService.create(data, req.user.uuid);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator')
  @Put(':uuid')
  public async update(
    @Param('uuid') uuid: string,
    @Body() data: UpdateProductDto,
  ) {
    return this.productService.update(data, uuid);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @Patch('approval/:uuid')
  public async approveOrRejectProduct(
    @Param('uuid') uuid: string,
    @Body() data: ApproveRejectDto,
  ) {
    return this.productService.approveOrRejectProduct(uuid, data);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator')
  @Patch('resubmission/:uuid')
  public async resubmit(
    @Param('uuid') uuid: string,
    @Body() data: any,
  ) {
    return this.productService.reSubmitProduct(uuid, data);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('user')
  @Patch('user/:user_id/product/:product_id')
  public async getUserProduct(
    @Param('user_id') userUuid: string,
    @Param('product_id') productUuid: string,
  ) {
    return this.productService.getUserProduct(userUuid, productUuid);
  }
}
