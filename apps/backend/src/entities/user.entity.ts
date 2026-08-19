import { Entity, Property, Enum } from '@mikro-orm/decorators/legacy';
import { BaseUUIDEntity } from './base.entity';

export enum UserRoleEnum {
    ADMIN = "ADMIN",
    MEMBER = "MEMBER"
}

@Entity({ tableName: 'tbl_users' })
export class UserEntity extends BaseUUIDEntity {
  @Property({ type: 'string', unique: true, index: true })
  email!: string;

  @Property({ type: 'string' })
  password!: string;

  @Property({ type: 'string' })
  name!: string;

  @Enum({ items: () => UserRoleEnum, default: UserRoleEnum.MEMBER })
  role!: UserRoleEnum;
}