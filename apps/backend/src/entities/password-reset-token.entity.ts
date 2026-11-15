import { Entity, Property, ManyToOne } from '@mikro-orm/decorators/legacy';
import { BaseUUIDEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity({ tableName: 'tbl_password_reset_tokens' })
export class PasswordResetToken extends BaseUUIDEntity {
  @ManyToOne(() => UserEntity, { joinColumn: 'user_id', deleteRule: 'cascade' })
  user!: UserEntity;

  @Property({ type: 'string', unique: true, hidden: true })
  tokenHash!: string;

  @Property({ type: 'timestamptz' })
  expiresAt!: Date;

  @Property({ type: 'timestamptz', nullable: true })
  usedAt?: Date;
}
