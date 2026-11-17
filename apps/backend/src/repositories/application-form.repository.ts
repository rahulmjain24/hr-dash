import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { BaseRepository } from './base.repository';
import { ApplicationFormEntity, JobStatusEnum } from '../entities/application-form.entity';
import { DepartmentNameEnum } from '../entities/department.entity';
import { endOfExclusive, escapeLike, isActiveFilter, startOf } from '../utils/query.utils';
import { splitWords } from '../utils/string.utils';
import {
  type PaginatedResult,
  type PaginationParams,
  resolvePagination,
  toPaginatedResult,
} from '../utils/pagination.utils';

export interface ApplicationFormFilters {
  search?: string;
  status?: JobStatusEnum;
  jobId?: string;
  department?: DepartmentNameEnum;
  jobState?: 'active' | 'closed';
  from?: string;
  to?: string;
}

@Injectable()
export class ApplicationFormRepository extends BaseRepository<ApplicationFormEntity> {
  constructor(em: EntityManager) {
    super(em, ApplicationFormEntity);
  }

  override async getAll(): Promise<ApplicationFormEntity[]> {
    return this.find({}, { populate: ['job'] });
  }

  override async findById(id: string): Promise<ApplicationFormEntity | null> {
    return this.findOne({ id } as FilterQuery<ApplicationFormEntity>, {
      populate: ['job'],
    });
  }

  async findByEmailAndJobId(
    email: string,
    jobId: string,
  ): Promise<ApplicationFormEntity | null> {
    return this.findOne({ email, job: jobId } as FilterQuery<ApplicationFormEntity>);
  }

  async findByFilters(
    filters: ApplicationFormFilters & PaginationParams,
  ): Promise<PaginatedResult<ApplicationFormEntity>> {
    const conditions: Record<string, unknown>[] = [];

    if (filters.search) {
      // Every word must match a name or the email, so "jane doe" finds Jane Doe.
      for (const term of splitWords(filters.search)) {
        const pattern = `%${escapeLike(term)}%`;
        conditions.push({
          $or: [
            { firstName: { $ilike: pattern } },
            { lastName: { $ilike: pattern } },
            { email: { $ilike: pattern } },
          ],
        });
      }
    }
    if (filters.status) {
      conditions.push({ status: filters.status });
    }
    if (filters.jobId) {
      conditions.push({ job: filters.jobId });
    }
    if (filters.department) {
      conditions.push({ job: { department: filters.department } });
    }
    if (filters.jobState === 'active') {
      conditions.push({ job: isActiveFilter() });
    } else if (filters.jobState === 'closed') {
      conditions.push({ job: { isActive: false } });
    }
    if (filters.from) {
      conditions.push({ submissonDate: { $gte: startOf(filters.from) } });
    }
    if (filters.to) {
      conditions.push({ submissonDate: { $lt: endOfExclusive(filters.to) } });
    }

    const where = (
      conditions.length ? { $and: conditions } : {}
    ) as FilterQuery<ApplicationFormEntity>;

    const { page, limit, offset } = resolvePagination(filters);
    const [rows, total] = await this.findAndCount(where, {
      populate: ['job'],
      // id breaks ties so rows don't shift between pages.
      orderBy: { createdAt: 'DESC', id: 'ASC' },
      limit,
      offset,
    });
    return toPaginatedResult(rows, total, page, limit);
  }
}
