import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDto } from 'src/dto/category.dto';
import { RoleGuard } from 'src/modules/auth/guards/role.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Get()
  async getAll() {
    return this.categoryService.getAll()
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.categoryService.getOne(id)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @Post()
  async create(@Body() payload: CategoryDto) {
    return this.categoryService.create(payload)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: number, @Body() payload: CategoryDto) {
    return this.categoryService.update(id, payload)
  }
}
