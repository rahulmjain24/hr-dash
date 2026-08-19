import { Injectable, NotFoundException } from '@nestjs/common';
import { DepartmentEntity, type DepartmentNameEnum } from '../entities/department.entity';
import { DepartmentRepository } from '../repositories/department.repository';
import { BaseService } from './base.service';

@Injectable()
export class DepartmentService extends BaseService<DepartmentEntity> {
  constructor(protected readonly departmentRepo: DepartmentRepository) {
    super(departmentRepo);
  }

  async getByName(name: DepartmentNameEnum): Promise<DepartmentEntity> {
    const department = await this.departmentRepo.findByName(name);
    
    if (!department) {
      throw new NotFoundException(`Department ${name} not found`);
    }
    
    return department;
  }
}