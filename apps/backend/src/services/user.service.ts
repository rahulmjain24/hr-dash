import { ConflictException, Injectable } from '@nestjs/common';
import { BaseService } from './base.service';
import { UserEntity } from 'src/entities/user.entity';
import { UserRepository } from 'src/repositories/user.repository';
import { CreateUserDto } from 'src/dtos/user.dto';
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
}