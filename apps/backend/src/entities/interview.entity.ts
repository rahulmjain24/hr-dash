import { Entity, Property, ManyToOne, Index } from '@mikro-orm/decorators/legacy';
import { BaseUUIDEntity } from './base.entity';
import { ApplicationFormEntity } from './application-form.entity';
import { UserEntity } from './user.entity';

export const DEFAULT_INTERVIEW_DURATION_MINUTES = 60;

@Entity({ tableName: 'tbl_interviews' })
@Index({ properties: ['interviewer', 'scheduledAt'] })
export class InterviewEntity extends BaseUUIDEntity {
  @ManyToOne(() => ApplicationFormEntity, {
    joinColumn: 'application_id',
    deleteRule: 'cascade',
    updateRule: 'cascade',
    index: true,
  })
  application!: ApplicationFormEntity;

  @ManyToOne(() => UserEntity, {
    joinColumn: 'interviewer_user_id',
    deleteRule: 'restrict',
    updateRule: 'cascade',
  })
  interviewer!: UserEntity;

  @Property({ type: 'timestamptz' })
  scheduledAt!: Date;

  @Property({ type: 'integer', default: DEFAULT_INTERVIEW_DURATION_MINUTES })
  durationMinutes: number = DEFAULT_INTERVIEW_DURATION_MINUTES;

  @Property({ type: 'string', length: 2048, nullable: true })
  meetingLink?: string;
}
