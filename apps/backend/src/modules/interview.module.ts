import { Module } from '@nestjs/common';
import { InterviewController } from '../controllers/interview.controller';
import { InterviewService } from '../services/interview.service';
import { InterviewRepository } from '../repositories/interview.repository';
import { ApplicationFormModule } from './application-form.module';
import { UserModule } from './user.module';

@Module({
  imports: [ApplicationFormModule, UserModule],
  controllers: [InterviewController],
  providers: [InterviewService, InterviewRepository],
  exports: [InterviewService],
})
export class InterviewModule {}
