import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { BaseRepository } from './base.repository';
import { PasswordResetToken } from 'src/entities/password-reset-token.entity';

@Injectable()
export class PasswordResetTokenRepository extends BaseRepository<PasswordResetToken> {
  constructor(em: EntityManager) {
    super(em, PasswordResetToken);
  }

  async findUsableByHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return this.findOne(
      { tokenHash, usedAt: null, expiresAt: { $gt: new Date() } },
      { populate: ['user'] },
    );
  }

  async invalidateForUser(userId: string): Promise<number> {
    return this.nativeUpdate(
      { user: userId, usedAt: null } as FilterQuery<PasswordResetToken>,
      { usedAt: new Date() },
    );
  }
}
