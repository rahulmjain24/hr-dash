import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { BaseRepository } from './base.repository';
import { InterviewEntity } from '../entities/interview.entity';

@Injectable()
export class InterviewRepository extends BaseRepository<InterviewEntity> {
  constructor(em: EntityManager) {
    super(em, InterviewEntity);
  }

  async findByApplicationId(applicationId: string): Promise<InterviewEntity[]> {
    return this.find(
      { application: applicationId } as FilterQuery<InterviewEntity>,
      {
        populate: ['interviewer'],
        orderBy: { scheduledAt: 'ASC', id: 'ASC' },
      },
    );
  }
}
