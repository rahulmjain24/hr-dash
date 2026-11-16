import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from './base.service';
import { JobListing } from 'src/entities/job-listing.entity';
import { JobListingRepository } from 'src/repositories/job-listing.repository';
import { DepartmentService } from './department.service';
import type { DepartmentNameEnum } from 'src/entities/department.entity';
import type { CreateJobListingDto, UpdateJobListingDto } from 'src/dtos/job-listing.dto';

@Injectable()
export class JobListingService extends BaseService<JobListing> {
  constructor(
    protected readonly jobListingRepo: JobListingRepository,
    private readonly departmentService: DepartmentService,
  ) {
    super(jobListingRepo);
  }

  async createListing(dto: CreateJobListingDto): Promise<JobListing> {
    await this.assertDepartmentExists(dto.department);

    return this.create({ ...dto, isActive: true });
  }

  async updateListing(
    id: string,
    dto: UpdateJobListingDto,
  ): Promise<JobListing> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    const existing = await this.getById(id);

    if (existing.isActive === false) {
      throw new BadRequestException('Cannot update an inactive job listing');
    }

    await this.assertDepartmentExists(dto.department);

    const startDate =
      dto.startDate !== undefined ? dto.startDate : existing.startDate;
    const endDate = dto.endDate !== undefined ? dto.endDate : existing.endDate;
    if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
      throw new BadRequestException('endDate must be on or after startDate');
    }

    return this.update(id, dto as Partial<JobListing>);
  }

  async setInactive(id: string): Promise<JobListing> {
    const existing = await this.getById(id);

    if (existing.isActive === false) {
      throw new BadRequestException('Job listing is already inactive');
    }

    return this.update(id, { isActive: false });
  }

  async getOpenListings(): Promise<JobListing[]> {
    return this.jobListingRepo.findOpen();
  }

  async getOpenListingById(id: string): Promise<JobListing> {
    const listing = await this.jobListingRepo.findOpenById(id);
    if (!listing) {
      throw new NotFoundException(
        'This job listing is not open for applications',
      );
    }
    return listing;
  }

  private async assertDepartmentExists(
    name?: DepartmentNameEnum | null,
  ): Promise<void> {
    if (!name) return;

    const department = await this.departmentService.findOneByAttributes({
      name,
    });
    if (!department) {
      throw new BadRequestException(`Department ${name} does not exist`);
    }
  }
}
