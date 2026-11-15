import { Module } from '@nestjs/common';
import { ApplicationFormController } from '../controllers/application-form.controller';
import { ApplicationFormService } from '../services/application-form.service';
import { ApplicationFormRepository } from '../repositories/application-form.repository';
import { JobListingModule } from './job-listing.module';

@Module({
  imports: [JobListingModule],
  controllers: [ApplicationFormController],
  providers: [ApplicationFormService, ApplicationFormRepository],
  exports: [ApplicationFormService, ApplicationFormRepository],
})
export class ApplicationFormModule {}
