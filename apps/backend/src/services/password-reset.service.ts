import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { MailService } from './mail.service';
import { PasswordResetTokenRepository } from 'src/repositories/password-reset-token.repository';
import { PasswordResetTokenEntity } from 'src/entities/password-reset-token.entity';
import { EnvironmentVariables } from 'src/config/env.validation';
import { generateToken, hashPassword, sha256Hex } from 'src/utils/crypto.utils';
import { minutesFromNow } from 'src/utils/date.utils';
import { getErrorStack } from 'src/utils/error.utils';
import { stripTrailingSlashes } from 'src/utils/string.utils';

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
    this.frontendUrl = stripTrailingSlashes(
      configService.get('FRONTEND_URL', { infer: true }),
    );
  }

  async requestReset(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) return;

    // Only the most recent link stays valid
    await this.tokenRepo.invalidateForUser(user.id);

    const token = generateToken();
    await this.tokenRepo.createOne({
      user,
      tokenHash: sha256Hex(token),
      expiresAt: minutesFromNow(RESET_TOKEN_TTL_MINUTES),
    });

    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    try {
      await this.mailService.sendPasswordReset(user.email, resetUrl, RESET_TOKEN_TTL_MINUTES);
    } catch (err) {
      this.logger.error(
        `Failed to send password reset email to ${user.email}`,
        getErrorStack(err),
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
      password: await hashPassword(password),
    });
    await this.tokenRepo.invalidateForUser(userId);
  }

  private async findUsableOrFail(token: string): Promise<PasswordResetTokenEntity> {
    const resetToken = await this.tokenRepo.findUsableByHash(sha256Hex(token));
    if (!resetToken) {
      throw new BadRequestException('This reset link has expired or was already used');
    }
    return resetToken;
  }
}
