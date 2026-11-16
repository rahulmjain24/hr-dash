import { Module } from '@nestjs/common';
import { PublicController } from '../controllers/public.controller';
import { JobListingModule } from './job-listing.module';
import { ApplicationFormModule } from './application-form.module';

@Module({
  imports: [JobListingModule, ApplicationFormModule],
  controllers: [PublicController],
})
export class PublicModule {}
