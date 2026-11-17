import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { BaseRepository } from './base.repository';
import { ApplicationStatusHistoryEntity } from '../entities/application-status-history.entity';

@Injectable()
export class ApplicationStatusHistoryRepository extends BaseRepository<ApplicationStatusHistoryEntity> {
  constructor(em: EntityManager) {
    super(em, ApplicationStatusHistoryEntity);
  }

  async findByApplicationId(
    applicationId: string,
  ): Promise<ApplicationStatusHistoryEntity[]> {
    return this.find(
      { application: applicationId } as FilterQuery<ApplicationStatusHistoryEntity>,
      {
        populate: ['user'],
        orderBy: { createdAt: 'DESC', id: 'ASC' },
      },
    );
  }
}
