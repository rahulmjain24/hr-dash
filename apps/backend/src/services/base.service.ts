import { NotFoundException } from '@nestjs/common';
import type { AnyEntity, EntityData, FilterQuery } from '@mikro-orm/core';
import type { BaseRepository } from '../repositories/base.repository';

export interface ServiceContract<T extends object & AnyEntity> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T>;
  
  create(values: EntityData<T>): Promise<T>;
  update(id: string, values: Partial<T>): Promise<T>;
  
  delete(id: string): Promise<boolean>;
  
  findOneByAttributes(where: FilterQuery<T>): Promise<T | null>;
  findOneByAttributesOrFail(where: FilterQuery<T>): Promise<T>;
}

export abstract class BaseService<T extends object & AnyEntity> implements ServiceContract<T> {
  constructor(protected readonly repository: BaseRepository<T>) {}

  async getAll(): Promise<T[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<T> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    return entity;
  }

  async create(values: EntityData<T>): Promise<T> {
    return this.repository.createOne(values);
  }

  async update(id: string, values: Partial<T>): Promise<T> {
    const entity = await this.repository.updateById(id, values);
    if (!entity) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    return entity;
  }

  async delete(id: string): Promise<boolean> {
    const isDeleted = await this.repository.destroy(id);
    if (!isDeleted) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    return true;
  }

  async findOneByAttributes(where: FilterQuery<T>): Promise<T | null> {
    return this.repository.findOneByAttributes(where);
  }

  async findOneByAttributesOrFail(where: FilterQuery<T>): Promise<T> {
    const entity = await this.repository.findOneByAttributes(where);
    if (!entity) {
      throw new NotFoundException(`Resource not found with provided attributes`);
    }
    return entity;
  }
}