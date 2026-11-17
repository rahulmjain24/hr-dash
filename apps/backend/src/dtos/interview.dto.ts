import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsDateString,
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
import { PaginationQueryDto } from './pagination.dto';

const trimToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

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
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'meetingLink must be a valid http(s) URL' },
  )
  @MaxLength(2048, { message: 'meetingLink must not exceed 2048 characters' })
  meetingLink?: string;
}

export class QueryInterviewDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(trimToUndefined)
  @IsUUID('all', { message: 'applicationId must be a valid UUID' })
  applicationId?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsUUID('all', { message: 'interviewerUserId must be a valid UUID' })
  interviewerUserId?: string;

  /** Scheduled on or after this date (YYYY-MM-DD or ISO 8601). */
  @IsOptional()
  @Transform(trimToUndefined)
  @IsDateString({}, { message: 'from must be a valid ISO 8601 date' })
  from?: string;

  /** Scheduled on or before this date (YYYY-MM-DD is inclusive of the whole day). */
  @IsOptional()
  @Transform(trimToUndefined)
  @IsDateString({}, { message: 'to must be a valid ISO 8601 date' })
  to?: string;
}
