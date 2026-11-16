import { Transform, Type } from 'class-transformer';
import { IsDate, IsDateString, IsEmail, IsEnum, IsIn, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, Length, MaxLength, ValidateIf } from 'class-validator';
import { JobStatusEnum } from '../entities/application-form.entity';
import { DepartmentNameEnum } from '../entities/department.entity';
import { PaginationQueryDto } from './pagination.dto';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const trimToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export const JOB_STATES = ['active', 'closed'] as const;
export type JobState = (typeof JOB_STATES)[number];

export class CreateApplicationFormDto {
  @Transform(trim)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @Length(1, 255, {
    message: 'First name must be between 1 and 255 characters',
  })
  firstName!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @Length(1, 255, { message: 'Last name must be between 1 and 255 characters' })
  lastName!: string;

  @ValidateIf((o: CreateApplicationFormDto) => !o.job)
  @IsUUID('all', { message: 'jobId must be a valid UUID' })
  @IsNotEmpty({ message: 'jobId is required' })
  jobId?: string;

  @ValidateIf((o: CreateApplicationFormDto) => !o.jobId)
  @IsUUID('all', { message: 'job must be a valid UUID' })
  @IsNotEmpty({ message: 'job is required' })
  job?: string;

  @IsOptional()
  @IsEnum(JobStatusEnum, {
    message: 'status must be a valid JobStatusEnum value',
  })
  status?: JobStatusEnum;

  @IsOptional()
  @IsObject({ message: 'additionalProperties must be an object' })
  additionalProperties?: Record<string, any>;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'submissonDate must be a valid ISO 8601 date' })
  submissonDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'submissionDate must be a valid ISO 8601 date' })
  submissionDate?: Date;
}

export class UpdateApplicationFormDto {
  @IsOptional()
  @Transform(trim)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'First name cannot be empty' })
  @Length(1, 255, {
    message: 'First name must be between 1 and 255 characters',
  })
  firstName?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  @Length(1, 255, { message: 'Last name must be between 1 and 255 characters' })
  lastName?: string;

  @IsOptional()
  @IsEnum(JobStatusEnum, {
    message: 'status must be a valid JobStatusEnum value',
  })
  status?: JobStatusEnum;

  @IsOptional()
  @IsObject({ message: 'additionalProperties must be an object' })
  additionalProperties?: Record<string, any>;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'submissonDate must be a valid ISO 8601 date' })
  submissonDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'submissionDate must be a valid ISO 8601 date' })
  submissionDate?: Date;
}

export class UpdateApplicationStatusDto {
  @IsEnum(JobStatusEnum, {
    message: 'status must be a valid JobStatusEnum value',
  })
  @IsNotEmpty({ message: 'status is required' })
  status!: JobStatusEnum;
}

export class QueryApplicationFormDto extends PaginationQueryDto {
  /** Matches first name, last name or email (case-insensitive). */
  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  @MaxLength(255)
  search?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsEnum(JobStatusEnum, {
    message: 'status must be a valid JobStatusEnum value',
  })
  status?: JobStatusEnum;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsUUID('all', { message: 'jobId must be a valid UUID' })
  jobId?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsEnum(DepartmentNameEnum, {
    message: 'department must be a valid DepartmentNameEnum value',
  })
  department?: DepartmentNameEnum;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsIn(JOB_STATES, { message: `jobState must be one of: ${JOB_STATES.join(', ')}` })
  jobState?: JobState;

  /** Submitted on or after this date (YYYY-MM-DD or ISO 8601). */
  @IsOptional()
  @Transform(trimToUndefined)
  @IsDateString({}, { message: 'from must be a valid ISO 8601 date' })
  from?: string;

  /** Submitted on or before this date (YYYY-MM-DD is inclusive of the whole day). */
  @IsOptional()
  @Transform(trimToUndefined)
  @IsDateString({}, { message: 'to must be a valid ISO 8601 date' })
  to?: string;
}
