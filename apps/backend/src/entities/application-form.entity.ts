import { Entity, Property, Enum, Unique, ManyToOne } from '@mikro-orm/decorators/legacy';
import { BaseUUIDEntity } from './base.entity';
import { JobListing } from './job-listing.entity';

export enum JobStatusEnum {
  APPLIED = 'APPLIED',
  REVIEWING = 'REVIEWING',
  REJECTED = 'REJECTED',
  HIRED = 'HIRED',
}

@Entity({ tableName: 'tbl_application_forms' })
@Unique({ properties: ['email', 'job'] })
export class ApplicationForm extends BaseUUIDEntity {
  @Property({ type: 'string' })
  email!: string;

  @Property({ type: 'string' })
  firstName!: string;

  @Property({ type: 'string' })
  lastName!: string;

  @ManyToOne(() => JobListing, { joinColumn: 'job_id' })
  job!: JobListing;

  @Enum({ items: () => JobStatusEnum, nullable: true })
  status?: JobStatusEnum;

  @Property({ type: 'json', nullable: true })
  additionalProperties?: Record<string, any>;

  @Property({ type: 'timestamptz', nullable: true })
  submissonDate?: Date;
}