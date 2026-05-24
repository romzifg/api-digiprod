import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { UserActivityService } from './user-activity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserActivityDto } from 'src/dto/user-activity.dto';

@Controller('user-activities')
export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('user')
  @Post('complete')
  public async completeActivity(@Request() req: any, @Body() activity: UserActivityDto): Promise<any> {
    return await this.userActivityService.create(req.user.uuid, activity)
  }
}
