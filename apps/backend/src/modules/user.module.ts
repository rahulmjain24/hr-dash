import { Module } from '@nestjs/common';
import { UserService } from 'src/services/user.service';
import { UserController } from 'src/controllers/user.controller';
import { UserRepository } from 'src/repositories/user.repository';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}