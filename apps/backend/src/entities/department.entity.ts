import { Entity, Property, Enum } from '@mikro-orm/decorators/legacy';
import { BaseUUIDEntity } from './base.entity.js';

export enum DepartmentName {
  ENGINEERING = 'ENGINEERING',
  HR = 'HR',
  SALES = 'SALES',
  FINANCE = 'FINANCE',
  IT = 'IT'
}

@Entity({ tableName: 'tbl_departments' })
export class Department extends BaseUUIDEntity {
  @Enum(() => DepartmentName)
  name!: DepartmentName;

  @Property({ type: 'string', nullable: true })
  description?: string;
}