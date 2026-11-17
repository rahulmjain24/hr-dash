import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { BaseController } from './base.controller';
import { ApplicationStatusHistoryEntity } from '../entities/application-status-history.entity';
import { ApplicationStatusHistoryService } from '../services/application-status-history.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Controller('application-status-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationStatusHistoryController extends BaseController<ApplicationStatusHistoryEntity> {
  constructor(private readonly historyService: ApplicationStatusHistoryService) {
    super(historyService);
  }

  @Get('application/:applicationId')
  async getByApplicationId(
    @Param('applicationId', new ParseUUIDPipe()) applicationId: string,
  ) {
    return this.historyService.findByApplicationId(applicationId);
  }
}
