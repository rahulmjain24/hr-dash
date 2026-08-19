import { IsEnum, IsString, IsOptional, Length } from 'class-validator';
import { DepartmentNameEnum } from 'src/entities/department.entity';

export class CreateDepartmentDto {
  @IsEnum(DepartmentNameEnum, { message: 'Must be a valid department name' })
  name!: DepartmentNameEnum;

  @IsString()
  @IsOptional()
  @Length(10, 255, { message: 'Description must be between 10 and 255 characters' })
  description?: string;
}

export class UpdateDescriptionDepartmentDto {
  @IsString()
  @Length(10, 255, { message: 'Description must be between 10 and 255 characters' })
  description!: string;
}