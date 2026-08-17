import { Injectable, NotFoundException } from '@nestjs/common';
import { Department, type DepartmentName } from '../entities/department.entity';
import { DepartmentRepository } from '../repositories/department.repository';
import { BaseService } from './base.service';

@Injectable()
export class DepartmentService extends BaseService<Department> {
  constructor(protected readonly departmentRepo: DepartmentRepository) {
    super(departmentRepo);
  }

  async getByName(name: DepartmentName): Promise<Department> {
    const department = await this.departmentRepo.findByName(name);
    
    if (!department) {
      throw new NotFoundException(`Department ${name} not found`);
    }
    
    return department;
  }
}