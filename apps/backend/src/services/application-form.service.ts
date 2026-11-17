import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { BaseService } from './base.service';
import { ApplicationFormEntity, JobStatusEnum } from '../entities/application-form.entity';
import { ApplicationFormRepository } from '../repositories/application-form.repository';
import { ApplicationStatusHistoryRepository } from '../repositories/application-status-history.repository';
import { JobListingService } from './job-listing.service';
import type { PaginatedResult } from '../utils/pagination.utils';
import type { CreateApplicationFormDto, QueryApplicationFormDto, UpdateApplicationFormDto } from '../dtos/application-form.dto';
import type { SubmitApplicationDto } from '../dtos/public-application.dto';

@Injectable()
export class ApplicationFormService extends BaseService<ApplicationFormEntity> {
  constructor(
    protected readonly applicationFormRepo: ApplicationFormRepository,
    private readonly jobListingService: JobListingService,
    private readonly statusHistoryRepo: ApplicationStatusHistoryRepository,
  ) {
    super(applicationFormRepo);
  }

  async createApplication(
    dto: CreateApplicationFormDto,
  ): Promise<ApplicationFormEntity> {
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

  async submitApplication(dto: SubmitApplicationDto): Promise<ApplicationFormEntity> {
    await this.jobListingService.getOpenListingById(dto.jobId);

    const { jobId, firstName, lastName, email, documentIds, ...extra } = dto;
    const additionalProperties = Object.fromEntries(
      Object.entries(extra).filter(([, value]) => value !== undefined),
    );

    return this.createApplication({
      jobId,
      firstName,
      lastName,
      email,
      additionalProperties: Object.keys(additionalProperties).length
        ? additionalProperties
        : undefined,
    });
  }

  async updateApplication(
    id: string,
    dto: UpdateApplicationFormDto,
  ): Promise<ApplicationFormEntity> {
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

    const updatePayload: Partial<ApplicationFormEntity> = {};
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
    userId: string,
    remarks?: string,
  ): Promise<ApplicationFormEntity> {
    const application = await this.getById(id);
    const oldStatus = application.status;
    if (oldStatus === status) {
      return application;
    }

    // createOne flushes the whole unit of work, so the status change and its
    // history row are written in a single transaction.
    application.status = status;
    await this.statusHistoryRepo.createOne({
      application,
      user: userId,
      oldStatus,
      newStatus: status,
      remarks,
    });
    return application;
  }

  async findByJobId(jobId: string): Promise<ApplicationFormEntity[]> {
    await this.jobListingService.getById(jobId);
    return this.applicationFormRepo.findByJobId(jobId);
  }

  async findByStatus(status: JobStatusEnum): Promise<ApplicationFormEntity[]> {
    return this.applicationFormRepo.findByStatus(status);
  }

  async findWithFilters(
    filters?: QueryApplicationFormDto,
  ): Promise<PaginatedResult<ApplicationFormEntity>> {
    if (filters?.jobId) {
      await this.jobListingService.getById(filters.jobId);
    }
    return this.applicationFormRepo.findByFilters(filters ?? {});
  }
}
