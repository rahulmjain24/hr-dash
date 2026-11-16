import { Module } from '@nestjs/common';
import { PublicController } from '../controllers/public.controller';
import { JobListingModule } from './job-listing.module';
import { ApplicationFormModule } from './application-form.module';
import { DocumentModule } from './document.module';

@Module({
  imports: [JobListingModule, ApplicationFormModule, DocumentModule],
  controllers: [PublicController],
})
export class PublicModule {}
