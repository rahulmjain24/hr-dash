import { Entity, Property, ManyToOne, Index } from '@mikro-orm/decorators/legacy';
import { BaseUUIDEntity } from './base.entity';
import { ApplicationFormEntity, JobStatusEnum } from './application-form.entity';
import { UserEntity } from './user.entity';

@Entity({ tableName: 'tbl_application_status_history' })
@Index({ properties: ['application', 'changedAt'] })
export class ApplicationStatusHistoryEntity extends BaseUUIDEntity {
  @ManyToOne(() => ApplicationFormEntity, {
    joinColumn: 'application_id',
    deleteRule: 'cascade',
    updateRule: 'cascade',
  })
  application!: ApplicationFormEntity;

  @ManyToOne(() => UserEntity, {
    joinColumn: 'user_id',
    deleteRule: 'restrict',
    updateRule: 'cascade',
    index: true,
  })
  user!: UserEntity;

  @Property({ type: 'timestamptz', defaultRaw: 'now()' })
  changedAt!: Date;

  @Property({ type: 'string', length: 20, nullable: true })
  oldStatus?: JobStatusEnum;

  @Property({ type: 'string', length: 20 })
  newStatus!: JobStatusEnum;

  @Property({ type: 'text', nullable: true })
  remarks?: string;
}
