import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { UserProductService } from './user-product.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ProductRatingDto } from 'src/dto/product-rating.dto';

@Controller('user-products')
export class UserProductController {
  constructor(private readonly userProductService: UserProductService) { }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('user')
  @Get()
  public async getAllUser(@Request() req: any) {
    return this.userProductService.getAllByUser(req.user.uuid)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('user')
  @Get('material/:product_id')
  public async getMaterialByUser(
    @Request() req: any,
    @Param('product_id') productId: string,
  ) {
    return this.userProductService.getMaterialByUser(req.user.uuid, productId)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('user')
  @Get('ebook-link/:product_id')
  public async getEbookLink(
    @Request() req: any,
    @Param('product_id') productId: string,
  ) {
    return this.userProductService.getEbookLink(req.user.uuid, productId)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('user')
  @Post('rating')
  public async createRating(
    @Request() req: any,
    @Body() data: ProductRatingDto
  ) {
    return this.userProductService.createRating(req.user.uuid, data)
  }
}
