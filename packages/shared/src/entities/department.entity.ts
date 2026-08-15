import { Entity, Property, Enum } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from './base.entity.js';

// Export this so your frontend and backend can both use it!
export enum DepartmentName {
  ENGINEERING = 'ENGINEERING',
  HR = 'HR',
  SALES = 'SALES',
  FINANCE = 'FINANCE',
  IT = 'IT'
}

@Entity({ tableName: 'tbl_departments' })
export class Department extends BaseEntity {
  @Enum(() => DepartmentName)
  name: DepartmentName;

  @Property({ type: 'string', nullable: true })
  description?: string;
}