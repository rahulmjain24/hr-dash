import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { JobListingService } from '../services/job-listing.service';
import { ApplicationFormService } from '../services/application-form.service';
import { SubmitApplicationDto } from '../dtos/public-application.dto';

/** Unauthenticated endpoints for the applicant portal. Nothing here may expose HR-only data. */
@Controller('public')
export class PublicController {
  constructor(
    private readonly jobListingService: JobListingService,
    private readonly applicationFormService: ApplicationFormService,
  ) {}

  @Get('job-listings')
  async getOpenListings() {
    return this.jobListingService.getOpenListings();
  }

  @Get('job-listings/:id')
  async getOpenListing(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.jobListingService.getOpenListingById(id);
  }

  @Post('applications')
  @HttpCode(HttpStatus.CREATED)
  async submitApplication(@Body() dto: SubmitApplicationDto) {
    const application = await this.applicationFormService.submitApplication(dto);
    return { id: application.id };
  }
}
