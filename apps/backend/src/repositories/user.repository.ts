import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { BaseRepository } from './base.repository';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
    constructor(em: EntityManager) {
        super(em, UserEntity);
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.findBy('email', email);
    }
}