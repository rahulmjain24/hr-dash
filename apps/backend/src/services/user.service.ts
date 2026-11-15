import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { BaseService } from './base.service';
import { UserEntity } from 'src/entities/user.entity';
import { UserRepository } from 'src/repositories/user.repository';
import { CreateUserDto, UpdateUserDto } from 'src/dtos/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(protected readonly userRepo: UserRepository) {
    super(userRepo);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findByEmail(email);
  }

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const newUser = await this.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      }
    };
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const values: Partial<UserEntity> = {};
    if (dto.name !== undefined) values.name = dto.name;
    if (dto.role !== undefined) values.role = dto.role;

    if (dto.email !== undefined) {
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already in use');
      }
      values.email = dto.email;
    }

    if (dto.password !== undefined) {
      values.password = await bcrypt.hash(dto.password, 10);
    }

    if (Object.keys(values).length === 0) {
      throw new BadRequestException('At least one field must be provided for update');
    }

    return this.update(id, values);
  }
}
