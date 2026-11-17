import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { BaseRepository } from './base.repository';
import { InterviewEntity } from '../entities/interview.entity';
import {
  resolvePagination,
  toPaginatedResult,
  type PaginatedResult,
  type PaginationParams,
} from '../utils/pagination.utils';
import { endOfExclusive, startOf } from '../utils/query.utils';

export interface InterviewFilters {
  applicationId?: string;
  interviewerUserId?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class InterviewRepository extends BaseRepository<InterviewEntity> {
  constructor(em: EntityManager) {
    super(em, InterviewEntity);
  }

  override async findById(id: string): Promise<InterviewEntity | null> {
    return this.findOne({ id } as FilterQuery<InterviewEntity>, {
      populate: ['application', 'interviewer'],
    });
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

  async findByFilters(
    filters: InterviewFilters & PaginationParams,
  ): Promise<PaginatedResult<InterviewEntity>> {
    const conditions: Record<string, unknown>[] = [];

    if (filters.applicationId) {
      conditions.push({ application: filters.applicationId });
    }
    if (filters.interviewerUserId) {
      conditions.push({ interviewer: filters.interviewerUserId });
    }
    if (filters.from) {
      conditions.push({ scheduledAt: { $gte: startOf(filters.from) } });
    }
    if (filters.to) {
      conditions.push({ scheduledAt: { $lt: endOfExclusive(filters.to) } });
    }

    const where = (
      conditions.length ? { $and: conditions } : {}
    ) as FilterQuery<InterviewEntity>;

    const { page, limit, offset } = resolvePagination(filters);
    const [rows, total] = await this.findAndCount(where, {
      populate: ['application', 'interviewer'],
      // id breaks ties so rows don't shift between pages.
      orderBy: { scheduledAt: 'ASC', id: 'ASC' },
      limit,
      offset,
    });
    return toPaginatedResult(rows, total, page, limit);
  }
}
