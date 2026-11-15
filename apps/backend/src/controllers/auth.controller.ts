import { Controller, Post, Body, HttpCode, HttpStatus, Res, Get } from '@nestjs/common';
import { LoginDto } from 'src/dtos/auth.dto';
import { AuthService } from 'src/services/auth.service';
import { type CookieOptions, type Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, NodeEnv } from 'src/config/env.validation';

@Controller('auth')
export class AuthController {
  private readonly cookieName: string;
  private readonly cookieOptions: CookieOptions;

  constructor(
    private readonly authService: AuthService,
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

  // disabling register feature
  // @Post('register')
  // @HttpCode(HttpStatus.CREATED)
  // async register(@Body() registerDto: RegisterDto) {
  //   return this.authService.register(registerDto);
  // }
}