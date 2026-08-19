import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DepartmentEntity } from '../entities/department.entity';
import { DepartmentService } from '../services/department.service';
import { BaseController } from './base.controller';
import { CreateDepartmentDto, UpdateDescriptionDepartmentDto } from 'src/dtos/department.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role, Roles } from 'src/decorators/roles.decorator';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentController extends BaseController<DepartmentEntity> {
  constructor(private readonly departmentService: DepartmentService) {
    super(departmentService);
  }

  @Get()
  async getAll() {
    return this.service.getAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateDepartmentDto) {
    return this.service.create(dto);
  }

  @Patch('/update-description/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  async updateDescription(
    @Param('id') id: string,
    @Body() dto: UpdateDescriptionDepartmentDto
  ) {
    return this.service.update(id, dto);
  }
}