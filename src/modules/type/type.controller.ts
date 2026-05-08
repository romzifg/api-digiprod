import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { TypeService } from './type.service';
import { TypeDto } from 'src/dto/type.dto';
import { RoleGuard } from 'src/modules/auth/guards/role.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('types')
export class TypeController {
  constructor(private readonly typeService: TypeService) { }

  @Get()
  async getAll() {
    return this.typeService.getAll()
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.typeService.getOne(id)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @Post()
  async create(@Body() payload: TypeDto) {
    return this.typeService.create(payload)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: number, @Body() payload: TypeDto) {
    return this.typeService.update(id, payload)
  }
}
