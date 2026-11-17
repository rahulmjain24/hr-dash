import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { DepartmentEntity } from '../entities/department.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class DepartmentRepository extends BaseRepository<DepartmentEntity> {
    constructor(em: EntityManager) {
        super(em, DepartmentEntity);
    }
}
