import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { BaseService } from './base.service';
import { ApplicationFormEntity, JobStatusEnum } from '../entities/application-form.entity';
import { ApplicationFormRepository } from '../repositories/application-form.repository';
import { ApplicationStatusHistoryRepository } from '../repositories/application-status-history.repository';
import { JobListingService } from './job-listing.service';
import type { PaginatedResult } from '../utils/pagination.utils';
import type { CreateApplicationFormDto, QueryApplicationFormDto, UpdateApplicationFormDto } from '../dtos/application-form.dto';
import type { SubmitApplicationDto } from '../dtos/public-application.dto';

export const STATUS_TRANSITIONS: Record<JobStatusEnum, JobStatusEnum[]> = {
  [JobStatusEnum.APPLIED]: [JobStatusEnum.REVIEWING],
  [JobStatusEnum.REVIEWING]: [JobStatusEnum.HIRED, JobStatusEnum.REJECTED],
  [JobStatusEnum.HIRED]: [],
  [JobStatusEnum.REJECTED]: [],
};

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
    userId: string,
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
    if (dto.additionalProperties !== undefined) {
      updatePayload.additionalProperties = dto.additionalProperties;
    }
    if (submissonDate !== undefined) {
      updatePayload.submissonDate = submissonDate;
    }

    if (dto.status !== undefined) {
      this.changeStatus(existing, dto.status, userId);
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
    this.changeStatus(application, status, userId, remarks);
    await this.applicationFormRepo.getEntityManager().flush();
    return application;
  }

  private changeStatus(
    application: ApplicationFormEntity,
    status: JobStatusEnum,
    userId: string,
    remarks?: string,
  ): void {
    const oldStatus = application.status ?? JobStatusEnum.APPLIED;
    if (oldStatus === status) return;

    if (!STATUS_TRANSITIONS[oldStatus].includes(status)) {
      const allowed = STATUS_TRANSITIONS[oldStatus];
      throw new BadRequestException(
        allowed.length
          ? `Status cannot be changed from ${oldStatus} to ${status}. Allowed: ${allowed.join(', ')}`
          : `Status cannot be changed once an application is ${oldStatus}`,
      );
    }

    application.status = status;
    const em = this.statusHistoryRepo.getEntityManager();
    em.persist(
      this.statusHistoryRepo.create({
        application,
        user: userId,
        oldStatus,
        newStatus: status,
        remarks,
      } as any),
    );
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
