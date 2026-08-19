import { Injectable } from '@nestjs/common';
import { BaseService } from './base.service';
import { UserEntity } from 'src/entities/user.entity';
import { UserRepository } from 'src/repositories/user.repository';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(protected readonly userRepo: UserRepository) {
    super(userRepo);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findByEmail(email);
  }
}