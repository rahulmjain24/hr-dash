import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { EnvironmentVariables } from 'src/config/env.validation';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService<EnvironmentVariables, true>) {
    const cookieName = configService.get('AUTH_COOKIE_NAME', { infer: true });

    super({
      jwtFromRequest: (req: Request) => req?.cookies?.[cookieName] ?? null,
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', { infer: true }),
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, role: payload.role };
  }
}
