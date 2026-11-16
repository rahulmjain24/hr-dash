import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { MailService } from './mail.service';
import { PasswordResetTokenRepository } from 'src/repositories/password-reset-token.repository';
import { PasswordResetToken } from 'src/entities/password-reset-token.entity';
import { EnvironmentVariables } from 'src/config/env.validation';

export const RESET_TOKEN_TTL_MINUTES = 30;

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly tokenRepo: PasswordResetTokenRepository,
    configService: ConfigService<EnvironmentVariables, true>,
  ) {
    this.frontendUrl = configService
      .get('FRONTEND_URL', { infer: true })
      .replace(/\/+$/, '');
  }

  async requestReset(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) return;

    // Only the most recent link stays valid
    await this.tokenRepo.invalidateForUser(user.id);

    const token = randomBytes(32).toString('hex');
    await this.tokenRepo.createOne({
      user,
      tokenHash: this.hash(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
    });

    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    try {
      await this.mailService.sendPasswordReset(user.email, resetUrl, RESET_TOKEN_TTL_MINUTES);
    } catch (err) {
      this.logger.error(
        `Failed to send password reset email to ${user.email}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  async getResetTarget(token: string): Promise<{ email: string }> {
    const resetToken = await this.findUsableOrFail(token);
    return { email: resetToken.user.email };
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const resetToken = await this.findUsableOrFail(token);
    const userId = resetToken.user.id;

    await this.userService.update(userId, {
      password: await bcrypt.hash(password, 10),
    });
    await this.tokenRepo.invalidateForUser(userId);
  }

  private async findUsableOrFail(token: string): Promise<PasswordResetToken> {
    const resetToken = await this.tokenRepo.findUsableByHash(this.hash(token));
    if (!resetToken) {
      throw new BadRequestException('This reset link has expired or was already used');
    }
    return resetToken;
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
