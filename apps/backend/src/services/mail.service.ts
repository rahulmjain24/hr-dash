import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import { EnvironmentVariables } from 'src/config/env.validation';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter?: Transporter;
  private readonly from: string;

  constructor(configService: ConfigService<EnvironmentVariables, true>) {
    this.from = configService.get('MAIL_FROM', { infer: true });

    const host = configService.get('SMTP_HOST', { infer: true });
    if (host) {
      const port = configService.get('SMTP_PORT', { infer: true });
      const user = configService.get('SMTP_USER', { infer: true });
      const pass = configService.get('SMTP_PASSWORD', { infer: true });

      this.transporter = createTransport({
        host,
        port,
        secure: port === 465,
        auth: user ? { user, pass } : undefined,
      });
    } else {
      this.logger.warn('SMTP_HOST is not set: emails are written to this log instead of being sent');
    }
  }

  async sendPasswordReset(to: string, resetUrl: string, expiresInMinutes: number): Promise<void> {
    const text = [
      'We received a request to reset your HR Portal password.',
      '',
      `Open this link to choose a new password (it expires in ${expiresInMinutes} minutes):`,
      resetUrl,
      '',
      'If you did not ask for this, you can ignore this email.',
    ].join('\n');

    if (!this.transporter) {
      this.logger.log(`Password reset email for ${to}:\n${text}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Reset your HR Portal password',
      text,
    });
  }
}
