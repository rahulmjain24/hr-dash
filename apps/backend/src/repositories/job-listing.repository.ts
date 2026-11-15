import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { BaseRepository } from './base.repository';
import { JobListing } from 'src/entities/job-listing.entity';

@Injectable()
export class JobListingRepository extends BaseRepository<JobListing> {
  constructor(em: EntityManager) {
    super(em, JobListing);
  }
}
