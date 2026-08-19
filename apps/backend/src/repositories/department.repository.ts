import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { DepartmentEntity, type DepartmentNameEnum } from '../entities/department.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class DepartmentRepository extends BaseRepository<DepartmentEntity> {
    constructor(em: EntityManager) {
        super(em, DepartmentEntity);
    }

    async findByName(name: DepartmentNameEnum): Promise<DepartmentEntity | null> {
        return this.findOne({ name });
    }
}