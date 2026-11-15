import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRoleEnum } from 'src/entities/user.entity';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(UserRoleEnum, { message: 'Must be a valid role ' })
  @IsNotEmpty()
  role!: UserRoleEnum;
}