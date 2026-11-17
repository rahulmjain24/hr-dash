import { Injectable } from '@nestjs/common';
import { DepartmentEntity } from '../entities/department.entity';
import { DepartmentRepository } from '../repositories/department.repository';
import { BaseService } from './base.service';

@Injectable()
export class DepartmentService extends BaseService<DepartmentEntity> {
  constructor(protected readonly departmentRepo: DepartmentRepository) {
    super(departmentRepo);
  }
}
