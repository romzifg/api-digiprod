import { Body, Controller, Get, HttpStatus, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseOptions } from 'src/common/decorators/response.decorator';
import { LoginDto } from 'src/dto/login.dto';
import { RegisterCreatorDto, RegisterUserDto } from 'src/dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdateCreatorProfileDto, UpdateUserProfileDto } from 'src/dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateBankAccountDto } from 'src/dto/update-bank-account.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ResponseOptions({
    code: HttpStatus.OK,
    liftToken: true,
  })
  public async login(@Body() data: LoginDto): Promise<{ access_token: string }> {
    return await this.authService.login(data)
  }

  @Post('register/creator')
  @ResponseOptions({
    code: HttpStatus.OK,
  })
  public async registerCreator(@Body() data: RegisterCreatorDto): Promise<any> {
    return await this.authService.register(data, true)
  }

  @Post('register/user')
  @ResponseOptions({
    code: HttpStatus.OK,
  })
  public async registerUser(@Body() data: RegisterUserDto): Promise<any> {
    return await this.authService.register(data, false)
  }

  @UseGuards(JwtAuthGuard)
  @Roles('user', 'creator')
  @Get('profile')
  public async getProfile(@Request() req: any): Promise<any> {
    const user = req.user
    return await this.authService.getProfile(user)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('user')
  @Patch('profile/creator')
  @UseInterceptors(FileInterceptor('photo'))
  public async updateUserProfile(@Request() req: any, @Body() dto: UpdateUserProfileDto, @UploadedFile() file: Express.Multer.File): Promise<any> {
    const user = req.user
    return await this.authService.updateProfileUser(user.uuid, dto, file)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator')
  @Patch('profile/creator')
  @UseInterceptors(FileInterceptor('photo'))
  public async updateUserProfileCreator(@Request() req: any, @Body() dto: UpdateCreatorProfileDto, @UploadedFile() file: Express.Multer.File): Promise<any> {
    const user = req.user
    return await this.authService.updateProfileCreator(user.uuid, dto, file)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator')
  @Patch('profile/bank-account')
  public async updateBankAccount(@Request() req: any, @Body() dto: UpdateBankAccountDto): Promise<any> {
    const user = req.user
    return await this.authService.updateBankAccount(user.uuid, dto)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('creator')
  @Patch('profile/password')
  public async updatePasswordCreator(@Request() req: any, @Body() dto: UpdateCreatorProfileDto): Promise<any> {
    const user = req.user
    return await this.authService.updatePasswordCreator(user.uuid, dto)
  }
}
