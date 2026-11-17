import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from './base.service';
import { InterviewEntity } from '../entities/interview.entity';
import { InterviewRepository } from '../repositories/interview.repository';
import { ApplicationFormService } from './application-form.service';
import { UserService } from './user.service';
import type { CreateInterviewDto } from '../dtos/interview.dto';

@Injectable()
export class InterviewService extends BaseService<InterviewEntity> {
  constructor(
    protected readonly interviewRepo: InterviewRepository,
    private readonly applicationFormService: ApplicationFormService,
    private readonly userService: UserService,
  ) {
    super(interviewRepo);
  }

  async createInterview(dto: CreateInterviewDto): Promise<InterviewEntity> {
    const application = await this.applicationFormService.getById(dto.applicationId);

    const interviewer = await this.userService.findOneByAttributes({
      id: dto.interviewerUserId,
    });
    if (!interviewer) {
      throw new BadRequestException(
        `Interviewer with ID ${dto.interviewerUserId} does not exist`,
      );
    }

    return this.create({
      application,
      interviewer,
      scheduledAt: dto.scheduledAt,
      durationMinutes: dto.durationMinutes,
      meetingLink: dto.meetingLink,
    });
  }

  async findByApplicationId(applicationId: string): Promise<InterviewEntity[]> {
    await this.applicationFormService.getById(applicationId);
    return this.interviewRepo.findByApplicationId(applicationId);
  }
}
