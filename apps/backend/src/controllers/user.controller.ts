import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { BaseController } from './base.controller';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserEntity } from 'src/entities/user.entity';
import { UserService } from 'src/services/user.service';
import { Role, Roles } from 'src/decorators/roles.decorator';
import { CreateUserDto } from 'src/dtos/user.dto';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController extends BaseController<UserEntity> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }
}