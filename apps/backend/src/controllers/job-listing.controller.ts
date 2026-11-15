import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { BaseController } from './base.controller';
import { JobListing } from 'src/entities/job-listing.entity';
import { JobListingService } from 'src/services/job-listing.service';
import { CreateJobListingDto, UpdateJobListingDto } from 'src/dtos/job-listing.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role, Roles } from 'src/decorators/roles.decorator';

@Controller('job-listings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobListingController extends BaseController<JobListing> {
  constructor(private readonly jobListingService: JobListingService) {
    super(jobListingService);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateJobListingDto) {
    return this.jobListingService.createListing(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateJobListingDto,
  ) {
    return this.jobListingService.updateListing(id, dto);
  }

  @Patch(':id/set-inactive')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  async setInactive(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.jobListingService.setInactive(id);
  }
}
