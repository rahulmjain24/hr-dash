import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinDate,
} from 'class-validator';
import { trimToUndefined } from '../utils/transform.utils';
import { HTTP_URL_OPTIONS } from '../utils/validation.utils';

export const MAX_INTERVIEW_DURATION_MINUTES = 480;

export class CreateInterviewDto {
  @IsUUID('all', { message: 'applicationId must be a valid UUID' })
  @IsNotEmpty({ message: 'applicationId is required' })
  applicationId!: string;

  @IsUUID('all', { message: 'interviewerUserId must be a valid UUID' })
  @IsNotEmpty({ message: 'interviewerUserId is required' })
  interviewerUserId!: string;

  @Type(() => Date)
  @IsDate({ message: 'scheduledAt must be a valid ISO 8601 date' })
  @MinDate(() => new Date(), { message: 'scheduledAt must be in the future' })
  @IsNotEmpty({ message: 'scheduledAt is required' })
  scheduledAt!: Date;

  @IsOptional()
  @IsInt({ message: 'durationMinutes must be an integer' })
  @Min(1, { message: 'durationMinutes must be at least 1' })
  @Max(MAX_INTERVIEW_DURATION_MINUTES, {
    message: `durationMinutes must not exceed ${MAX_INTERVIEW_DURATION_MINUTES}`,
  })
  durationMinutes?: number;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsUrl(HTTP_URL_OPTIONS, { message: 'meetingLink must be a valid http(s) URL' })
  @MaxLength(2048, { message: 'meetingLink must not exceed 2048 characters' })
  meetingLink?: string;
}
