import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator', 'admin')
  @Get('statistic')
  public async getStatistic(@Request() req: any): Promise<any> {
    return this.dashboardService.getStatistic(req.user);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator', 'admin')
  @Get('revenue-per-type')
  public async getRevenuePerType(@Request() req: any): Promise<any> {
    return this.dashboardService.getRevenuePerType(req.user);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator', 'admin')
  @Get('latest-product')
  public async getLatestProduct(@Request() req: any): Promise<any> {
    return this.dashboardService.getLatestProduct(req.user);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator', 'admin')
  @Get('latest-order')
  public async getLatestOrder(@Request() req: any): Promise<any> {
    return this.dashboardService.getLatestOrder(req.user);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator', 'admin')
  @Get('revenue')
  public async getTotalRevenue(@Request() req: any): Promise<any> {
    return this.dashboardService.getTotalRevenue(req.user);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('user')
  @Get('member-statistic')
  public async getMemberStatistic(@Request() req: any): Promise<any> {
    return this.dashboardService.getStatisticUser(req.user.uuid);
  }
}
