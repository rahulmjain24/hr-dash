import { Module } from '@nestjs/common';
import { ApplicationStatusHistoryController } from '../controllers/application-status-history.controller';
import { ApplicationStatusHistoryService } from '../services/application-status-history.service';
import { ApplicationFormModule } from './application-form.module';

@Module({
  imports: [ApplicationFormModule],
  controllers: [ApplicationStatusHistoryController],
  providers: [ApplicationStatusHistoryService],
  exports: [ApplicationStatusHistoryService],
})
export class ApplicationStatusHistoryModule {}
