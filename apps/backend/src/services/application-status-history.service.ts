import { Injectable } from '@nestjs/common';
import { BaseService } from './base.service';
import { ApplicationStatusHistoryEntity } from '../entities/application-status-history.entity';
import type { JobStatusEnum } from '../entities/application-form.entity';
import { ApplicationStatusHistoryRepository } from '../repositories/application-status-history.repository';
import { ApplicationFormService } from './application-form.service';

export interface RecordStatusChangeInput {
  applicationId: string;
  userId: string;
  oldStatus?: JobStatusEnum | null;
  newStatus: JobStatusEnum;
  remarks?: string;
}

@Injectable()
export class ApplicationStatusHistoryService extends BaseService<ApplicationStatusHistoryEntity> {
  constructor(
    protected readonly historyRepo: ApplicationStatusHistoryRepository,
    private readonly applicationFormService: ApplicationFormService,
  ) {
    super(historyRepo);
  }

  async findByApplicationId(
    applicationId: string,
  ): Promise<ApplicationStatusHistoryEntity[]> {
    await this.applicationFormService.getById(applicationId);
    return this.historyRepo.findByApplicationId(applicationId);
  }

  async record(
    input: RecordStatusChangeInput,
  ): Promise<ApplicationStatusHistoryEntity> {
    return this.create({
      application: input.applicationId,
      user: input.userId,
      oldStatus: input.oldStatus ?? undefined,
      newStatus: input.newStatus,
      remarks: input.remarks,
    });
  }
}
