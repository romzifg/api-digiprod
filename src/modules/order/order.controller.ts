import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { OrderDto } from 'src/dto/order.dto';
import { IQueryParams } from 'src/interfaces/database.interface';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator', 'admin')
  @Get()
  public async getAll(@Request() req: any, @Query() params: IQueryParams) {
    return this.orderService.getAll(req.user, params);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('user')
  @Get('by-user')
  public async getOrderByUser(@Request() req: any, @Query() params: IQueryParams) {
    return this.orderService.getOrderByUser(req.user.uuid, params);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':uuid')
  public async getOrderByUuid(@Param('uuid') uuid: string) {
    return this.orderService.getByUuid(uuid);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('user')
  @Post()
  public async create(@Body() data: OrderDto) {
    return this.orderService.create(data);
  }
}
