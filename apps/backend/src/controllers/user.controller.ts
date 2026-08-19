import { Controller, UseGuards } from '@nestjs/common';
import { BaseController } from './base.controller';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserEntity } from 'src/entities/user.entity';
import { UserService } from 'src/services/user.service';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController extends BaseController<UserEntity> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }
}