import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, IsUrl, Length, MaxLength } from 'class-validator';
import { trim, trimToUndefined } from '../utils/transform.utils';
import { HTTP_URL_OPTIONS } from '../utils/validation.utils';

export class SubmitApplicationDto {
  @IsUUID('all', { message: 'jobId must be a valid UUID' })
  @IsNotEmpty({ message: 'jobId is required' })
  jobId!: string;

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

  @Transform(trim)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(255, { message: 'Email must be at most 255 characters' })
  email!: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  @MaxLength(30, { message: 'Phone number must be at most 30 characters' })
  phone?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsUrl(HTTP_URL_OPTIONS, {
    message: 'LinkedIn profile must be a valid URL starting with http:// or https://',
  })
  @MaxLength(255, { message: 'LinkedIn profile must be at most 255 characters' })
  linkedinUrl?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsUrl(HTTP_URL_OPTIONS, {
    message: 'Portfolio must be a valid URL starting with http:// or https://',
  })
  @MaxLength(255, { message: 'Portfolio must be at most 255 characters' })
  portfolioUrl?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  @MaxLength(5000, { message: 'Cover letter must be at most 5000 characters' })
  coverLetter?: string;

  @IsArray({ message: 'documentIds is required' })
  @ArrayMinSize(1, { message: 'At least one document must be attached' })
  @ArrayMaxSize(5, { message: 'At most 5 documents can be attached' })
  @IsUUID('all', { each: true, message: 'Each document id must be a valid UUID' })
  documentIds!: string[];
}
