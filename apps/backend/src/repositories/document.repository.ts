import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { BaseRepository } from './base.repository';
import { DocumentEntity } from '../entities/document.entity';

@Injectable()
export class DocumentRepository extends BaseRepository<DocumentEntity> {
  constructor(em: EntityManager) {
    super(em, DocumentEntity);
  }

  async findByApplicationId(applicationId: string): Promise<DocumentEntity[]> {
    return this.find(
      { application: applicationId } as FilterQuery<DocumentEntity>,
      { orderBy: { createdAt: 'ASC', id: 'ASC' } },
    );
  }

  async countByApplicationId(applicationId: string): Promise<number> {
    return this.count({ application: applicationId } as FilterQuery<DocumentEntity>);
  }
}
