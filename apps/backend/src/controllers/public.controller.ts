import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobListingService } from '../services/job-listing.service';
import { DocumentService, MAX_DOCUMENT_SIZE_BYTES } from '../services/document.service';
import { SubmitApplicationDto } from '../dtos/public-application.dto';
import { UploadDocumentDto } from '../dtos/document.dto';

/** Unauthenticated endpoints for the applicant portal. Nothing here may expose HR-only data. */
@Controller('public')
export class PublicController {
  constructor(
    private readonly jobListingService: JobListingService,
    private readonly documentService: DocumentService,
  ) {}

  @Get('job-listings')
  async getOpenListings() {
    return this.jobListingService.getOpenListings();
  }

  @Get('job-listings/:id')
  async getOpenListing(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.jobListingService.getOpenListingById(id);
  }

  @Post('documents')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_DOCUMENT_SIZE_BYTES, files: 1 } }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.documentService.stage(file, dto.documentType);
  }

  @Post('applications')
  @HttpCode(HttpStatus.CREATED)
  async submitApplication(@Body() dto: SubmitApplicationDto) {
    const application = await this.documentService.submitApplication(dto);
    return { id: application.id };
  }
}
