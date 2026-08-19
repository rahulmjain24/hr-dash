import { Entity, Property, Enum } from '@mikro-orm/decorators/legacy';
import { BaseUUIDEntity } from './base.entity';

export enum DepartmentNameEnum {
  ENGINEERING = 'ENGINEERING',
  HR = 'HR',
  SALES = 'SALES',
  FINANCE = 'FINANCE',
  IT = 'IT'
}

@Entity({ tableName: 'tbl_departments' })
export class DepartmentEntity extends BaseUUIDEntity {
  @Enum(() => DepartmentNameEnum)
  name!: DepartmentNameEnum;

  @Property({ type: 'string', nullable: true })
  description?: string;
}