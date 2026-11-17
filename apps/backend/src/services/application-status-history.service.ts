import { Injectable } from '@nestjs/common';
import { BaseService } from './base.service';
import { ApplicationStatusHistoryEntity } from '../entities/application-status-history.entity';
import { ApplicationStatusHistoryRepository } from '../repositories/application-status-history.repository';
import { ApplicationFormService } from './application-form.service';

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
}
