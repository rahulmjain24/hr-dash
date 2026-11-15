import { Transform, Type } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, Length, ValidateIf } from 'class-validator';
import { JobStatusEnum } from '../entities/application-form.entity';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

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

export class QueryApplicationFormDto {
  @IsOptional()
  @IsUUID('all', { message: 'jobId must be a valid UUID' })
  jobId?: string;

  @IsOptional()
  @IsEnum(JobStatusEnum, {
    message: 'status must be a valid JobStatusEnum value',
  })
  status?: JobStatusEnum;
}
