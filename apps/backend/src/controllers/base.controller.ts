import type { AnyEntity } from '@mikro-orm/core';
import type { BaseService } from '../services/base.service';

export abstract class BaseController<T extends object & AnyEntity> {
  constructor(protected readonly service: BaseService<T>) {}
}
