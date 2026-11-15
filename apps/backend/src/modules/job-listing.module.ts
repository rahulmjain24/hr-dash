import { Module } from '@nestjs/common';
import { JobListingController } from '../controllers/job-listing.controller';
import { JobListingService } from '../services/job-listing.service';
import { JobListingRepository } from '../repositories/job-listing.repository';
import { DepartmentModule } from './department.module';

@Module({
  imports: [DepartmentModule],
  controllers: [JobListingController],
  providers: [JobListingService, JobListingRepository],
  exports: [JobListingService],
})
export class JobListingModule {}
