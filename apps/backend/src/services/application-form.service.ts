import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { BaseService } from './base.service';
import { ApplicationForm, JobStatusEnum } from '../entities/application-form.entity';
import { ApplicationFormRepository } from '../repositories/application-form.repository';
import { JobListingService } from './job-listing.service';
import type { PaginatedResult } from '../utils/pagination.utils';
import type { CreateApplicationFormDto, QueryApplicationFormDto, UpdateApplicationFormDto } from '../dtos/application-form.dto';

@Injectable()
export class ApplicationFormService extends BaseService<ApplicationForm> {
  constructor(
    protected readonly applicationFormRepo: ApplicationFormRepository,
    private readonly jobListingService: JobListingService,
  ) {
    super(applicationFormRepo);
  }

  async createApplication(
    dto: CreateApplicationFormDto,
  ): Promise<ApplicationForm> {
    const targetJobId = dto.jobId || dto.job;
    if (!targetJobId) {
      throw new BadRequestException('jobId is required');
    }

    const job = await this.jobListingService.getById(targetJobId);
    if (job.isActive === false) {
      throw new BadRequestException('Cannot apply to an inactive job listing');
    }

    const existing = await this.applicationFormRepo.findByEmailAndJobId(
      dto.email,
      targetJobId,
    );
    if (existing) {
      throw new ConflictException(
        `An application with email "${dto.email}" already exists for this job listing`,
      );
    }

    const submissonDate = dto.submissonDate ?? dto.submissionDate ?? new Date();

    return this.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      job,
      status: dto.status ?? JobStatusEnum.APPLIED,
      additionalProperties: dto.additionalProperties,
      submissonDate,
    });
  }

  async updateApplication(
    id: string,
    dto: UpdateApplicationFormDto,
  ): Promise<ApplicationForm> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    const existing = await this.getById(id);

    if (dto.email && dto.email !== existing.email) {
      const targetJobId = existing.job?.id;
      if (targetJobId) {
        const duplicate = await this.applicationFormRepo.findByEmailAndJobId(
          dto.email,
          targetJobId,
        );
        if (duplicate && duplicate.id !== id) {
          throw new ConflictException(
            `An application with email "${dto.email}" already exists for this job listing`,
          );
        }
      }
    }

    const submissonDate = dto.submissonDate ?? dto.submissionDate;

    const updatePayload: Partial<ApplicationForm> = {};
    if (dto.email !== undefined) updatePayload.email = dto.email;
    if (dto.firstName !== undefined) updatePayload.firstName = dto.firstName;
    if (dto.lastName !== undefined) updatePayload.lastName = dto.lastName;
    if (dto.status !== undefined) updatePayload.status = dto.status;
    if (dto.additionalProperties !== undefined) {
      updatePayload.additionalProperties = dto.additionalProperties;
    }
    if (submissonDate !== undefined) {
      updatePayload.submissonDate = submissonDate;
    }

    return this.update(id, updatePayload);
  }

  async updateStatus(
    id: string,
    status: JobStatusEnum,
  ): Promise<ApplicationForm> {
    await this.getById(id);
    return this.update(id, { status });
  }

  async findByJobId(jobId: string): Promise<ApplicationForm[]> {
    await this.jobListingService.getById(jobId);
    return this.applicationFormRepo.findByJobId(jobId);
  }

  async findByStatus(status: JobStatusEnum): Promise<ApplicationForm[]> {
    return this.applicationFormRepo.findByStatus(status);
  }

  async findWithFilters(
    filters?: QueryApplicationFormDto,
  ): Promise<PaginatedResult<ApplicationForm>> {
    if (filters?.jobId) {
      await this.jobListingService.getById(filters.jobId);
    }
    return this.applicationFormRepo.findByFilters(filters ?? {});
  }
}
