import { Entity, Property, Enum } from '@mikro-orm/decorators/legacy';
import { BaseUUIDEntity } from './base.entity';
import { DepartmentNameEnum } from './department.entity';

@Entity({ tableName: 'tbl_job_listings' })
export class JobListing extends BaseUUIDEntity {
  @Property({ type: 'string' })
  title!: string;

  @Property({ nullable: true, type: 'string' })
  description?: string;

  @Enum({ items: () => DepartmentNameEnum, nullable: true })
  department?: DepartmentNameEnum;

  @Property({ nullable: true, type: 'timestamptz' })
  startDate?: Date;

  @Property({ nullable: true, type: 'timestamptz' })
  endDate?: Date;

  @Property({ nullable: true, type: 'boolean' })
  isActive?: boolean;
}
