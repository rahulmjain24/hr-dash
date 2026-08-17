import { Controller, Get, Param } from '@nestjs/common';
import { Department, type DepartmentName } from '../entities/department.entity';
import { DepartmentService } from '../services/department.service';
import { BaseController } from './base.controller';

@Controller('departments')
export class DepartmentController extends BaseController<Department> {
  constructor(private readonly departmentService: DepartmentService) {
    super(departmentService);
  }

  @Get('name/:name')
  async getByName(@Param('name') name: DepartmentName): Promise<Department> {
    return this.departmentService.getByName(name);
  }
}