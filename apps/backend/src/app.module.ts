import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DepartmentModule } from './modules/department.module';
import config from '../mikro-orm.config';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { UserModule } from './modules/user.module';
import { JobListingModule } from './modules/job-listing.module';
import { ApplicationFormModule } from './modules/application-form.module';
import { PublicModule } from './modules/public.module';
import { DocumentModule } from './modules/document.module';
import { ApplicationStatusHistoryModule } from './modules/application-status-history.module';
import { InterviewModule } from './modules/interview.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      validate: validateEnv,
    }),
    MikroOrmModule.forRoot(config),
    DepartmentModule,
    AuthModule,
    UserModule,
    JobListingModule,
    ApplicationFormModule,
    DocumentModule,
    ApplicationStatusHistoryModule,
    InterviewModule,
    PublicModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
