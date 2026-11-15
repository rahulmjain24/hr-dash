import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from 'src/controllers/auth.controller';
import { AuthService } from 'src/services/auth.service';
import { UserModule } from '../user.module';
import { EnvironmentVariables } from 'src/config/env.validation';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables, true>) => ({
        secret: configService.get('JWT_SECRET', { infer: true }),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}