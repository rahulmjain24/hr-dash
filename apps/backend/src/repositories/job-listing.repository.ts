import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { BaseRepository } from './base.repository';
import { JobListingEntity } from 'src/entities/job-listing.entity';
import { startOfUtcDay } from 'src/utils/date.utils';
import { isActiveFilter } from 'src/utils/query.utils';

@Injectable()
export class JobListingRepository extends BaseRepository<JobListingEntity> {
  constructor(em: EntityManager) {
    super(em, JobListingEntity);
  }

  async findOpen(): Promise<JobListingEntity[]> {
    return this.find(this.openFilter(), {
      orderBy: { createdAt: 'DESC', id: 'ASC' },
    });
  }

  async findOpenById(id: string): Promise<JobListingEntity | null> {
    return this.findOne({ $and: [{ id }, this.openFilter()] });
  }

  private openFilter(): FilterQuery<JobListingEntity> {
    const now = new Date();
    const today = startOfUtcDay(now);

    return {
      $and: [
        isActiveFilter(),
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: today } }] },
      ],
    };
  }
}
