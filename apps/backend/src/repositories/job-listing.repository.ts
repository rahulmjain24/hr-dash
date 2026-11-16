import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { BaseRepository } from './base.repository';
import { JobListingEntity } from 'src/entities/job-listing.entity';

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
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    return {
      $and: [
        { $or: [{ isActive: true }, { isActive: null }] },
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: today } }] },
      ],
    };
  }
}
