import { Controller, Get, UseGuards } from '@nestjs/common';
import { DepartmentEntity } from '../entities/department.entity';
import { DepartmentService } from '../services/department.service';
import { BaseController } from './base.controller';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

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
}