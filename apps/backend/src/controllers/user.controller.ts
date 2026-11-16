import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { BaseController } from './base.controller';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserEntity } from 'src/entities/user.entity';
import { UserService } from 'src/services/user.service';
import { Role, Roles } from 'src/decorators/roles.decorator';
import { CreateUserDto, UpdateUserDto } from 'src/dtos/user.dto';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController extends BaseController<UserEntity> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Get()
  @Roles(Role.ADMIN)
  async getAll() {
    return this.userService.getAll();
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.getById(id);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.delete(id);
  }
}
