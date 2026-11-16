import { Transform, Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, Length, MaxLength, ValidateIf, registerDecorator, type ValidationArguments, type ValidationOptions } from 'class-validator';
import { DepartmentNameEnum } from 'src/entities/department.entity';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

function IsOnOrAfter(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isOnOrAfter',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const related = (args.object as Record<string, unknown>)[
            args.constraints[0]
          ];
          if (!(value instanceof Date) || !(related instanceof Date))
            return true;
          return value.getTime() >= related.getTime();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be on or after ${args.constraints[0]}`;
        },
      },
    });
  };
}

export class CreateJobListingDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @Length(3, 255, { message: 'Title must be between 3 and 255 characters' })
  title!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(255, { message: 'Description must be at most 255 characters' })
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
  @MaxLength(255, { message: 'Description must be at most 255 characters' })
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
