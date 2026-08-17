import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Department, type DepartmentName } from '../entities/department.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class DepartmentRepository extends BaseRepository<Department> {
    constructor(em: EntityManager) {
        super(em, Department);
    }

    async findByName(name: DepartmentName): Promise<Department | null> {
        return this.findOne({ name });
    }
}