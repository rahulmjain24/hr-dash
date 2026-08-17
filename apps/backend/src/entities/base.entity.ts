import { PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { type Opt, BaseEntity } from '@mikro-orm/core';

export abstract class BaseUUIDEntity extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ type: 'datetime' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}