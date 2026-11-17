import { Transform, Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, Length, MaxLength, ValidateIf } from 'class-validator';
import { DepartmentNameEnum } from 'src/entities/department.entity';
import { trim } from 'src/utils/transform.utils';
import { IsOnOrAfter } from 'src/utils/validation.utils';

export class CreateJobListingDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @Length(3, 255, { message: 'Title must be between 3 and 255 characters' })
  title!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(10_000, { message: 'Description must be at most 10,000 characters' })
  description?: string;

  @IsOptional()
  @IsEnum(DepartmentNameEnum, { message: 'Must be a valid department name' })
  department?: DepartmentNameEnum;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'startDate must be a valid ISO 8601 date' })
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'endDate must be a valid ISO 8601 date' })
  @IsOnOrAfter('startDate')
  endDate?: Date;
}

export class UpdateJobListingDto {
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @Length(3, 255, { message: 'Title must be between 3 and 255 characters' })
  title?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(10_000, { message: 'Description must be at most 10,000 characters' })
  description?: string | null;

  @IsOptional()
  @IsEnum(DepartmentNameEnum, { message: 'Must be a valid department name' })
  department?: DepartmentNameEnum | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'startDate must be a valid ISO 8601 date' })
  startDate?: Date | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'endDate must be a valid ISO 8601 date' })
  @IsOnOrAfter('startDate')
  endDate?: Date | null;
}
