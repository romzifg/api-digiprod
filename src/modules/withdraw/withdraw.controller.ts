import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { IQueryParams } from 'src/interfaces/database.interface';
import { WithdrawDto } from 'src/dto/withdraw.dto';

@Controller('withdraws')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) { }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin', 'creator')
  @Get()
  public async getAll(@Request() req: any, @Query() params: IQueryParams): Promise<any> {
    return this.withdrawService.getAll(req.user, params)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin', 'creator')
  @Get(':uuid')
  public async getByUuid(@Param('uuid') uuid: string): Promise<any> {
    return this.withdrawService.getByUuid(uuid)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator')
  @Get('author/:uuid')
  public async getAuthorData(@Param('uuid') uuid: string): Promise<any> {
    return this.withdrawService.getAuthorData(uuid)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator')
  @Post()
  public async create(@Request() req: any, @Body() data: WithdrawDto): Promise<any> {
    return this.withdrawService.create(req.user.uuid, data)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator')
  @Patch('resubmission/:uuid')
  public async reSubmitWithdraw(@Param('uuid') uuid: string, @Body() data: any): Promise<any> {
    return this.withdrawService.reSubmitWithdraw(uuid, data)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @Patch('approval/:uuid')
  public async approveRejectWithdraw(@Request() req: any, @Param('uuid') uuid: string, @Body() data: any): Promise<any> {
    return this.withdrawService.approveOrRejectWithdraw(req.user.uuid, uuid, data)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator', 'admin')
  @Post('presign-upload')
  public async presignUpload(
    @Request() req: any,
    @Body() dto: { fileName: string, contentType: string }
  ) {
    return this.withdrawService.presignUpload(dto.fileName, dto.contentType, req.user.uuid);
  }
}
