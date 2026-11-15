import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { BaseRepository } from './base.repository';
import { ApplicationForm, JobStatusEnum } from '../entities/application-form.entity';

@Injectable()
export class ApplicationFormRepository extends BaseRepository<ApplicationForm> {
  constructor(em: EntityManager) {
    super(em, ApplicationForm);
  }

  override async getAll(): Promise<ApplicationForm[]> {
    return this.find({}, { populate: ['job'] });
  }

  override async findById(id: string): Promise<ApplicationForm | null> {
    return this.findOne({ id } as FilterQuery<ApplicationForm>, {
      populate: ['job'],
    });
  }

  async findByJobId(jobId: string): Promise<ApplicationForm[]> {
    return this.find(
      { job: jobId } as FilterQuery<ApplicationForm>,
      { populate: ['job'] },
    );
  }

  async findByEmailAndJobId(
    email: string,
    jobId: string,
  ): Promise<ApplicationForm | null> {
    return this.findOne({ email, job: jobId } as FilterQuery<ApplicationForm>);
  }

  async findByStatus(status: JobStatusEnum): Promise<ApplicationForm[]> {
    return this.find({ status }, { populate: ['job'] });
  }

  async findByFilters(filters: {
    jobId?: string;
    status?: JobStatusEnum;
  }): Promise<ApplicationForm[]> {
    const where: FilterQuery<ApplicationForm> = {};
    if (filters.jobId) {
      (where as Record<string, unknown>).job = filters.jobId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    return this.find(where, { populate: ['job'] });
  }
}
