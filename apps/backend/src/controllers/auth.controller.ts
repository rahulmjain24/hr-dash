import { Controller, Post, Body, HttpCode, HttpStatus, Res, Get, Param } from '@nestjs/common';
import { ForgotPasswordDto, LoginDto, ResetPasswordDto } from 'src/dtos/auth.dto';
import { AuthService } from 'src/services/auth.service';
import { PasswordResetService } from 'src/services/password-reset.service';
import { type CookieOptions, type Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, NodeEnv } from 'src/config/env.validation';

@Controller('auth')
export class AuthController {
  private readonly cookieName: string;
  private readonly cookieOptions: CookieOptions;

  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
    configService: ConfigService<EnvironmentVariables, true>,
  ) {
    this.cookieName = configService.get('AUTH_COOKIE_NAME', { infer: true });
    this.cookieOptions = {
      httpOnly: true,
      secure: configService.get('NODE_ENV', { infer: true }) === NodeEnv.Production,
      sameSite: 'lax',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken } = await this.authService.login(loginDto);

    res.cookie(this.cookieName, accessToken, {
      ...this.cookieOptions,
      maxAge: 1000 * 60 * 60 * 24,
    });

    return { message: 'Logged in successfully' };
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(this.cookieName, this.cookieOptions);

    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.passwordResetService.requestReset(dto.email);
    return { message: 'If an account exists for that email, a reset link has been sent' };
  }

  @Get('reset-password/:token')
  async getResetTarget(@Param('token') token: string) {
    return this.passwordResetService.getResetTarget(token);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.passwordResetService.resetPassword(dto.token, dto.password);
    return { message: 'Password reset successfully' };
  }

  // disabling register feature
  // @Post('register')
  // @HttpCode(HttpStatus.CREATED)
  // async register(@Body() registerDto: RegisterDto) {
  //   return this.authService.register(registerDto);
  // }
}