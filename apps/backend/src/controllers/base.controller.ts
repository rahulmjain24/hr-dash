import { Get, Post, Patch, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import type { AnyEntity, EntityData } from '@mikro-orm/core';
import type { BaseService } from '../services/base.service';

interface ControllerContract<T extends object & AnyEntity> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T>;
  create(dto: EntityData<T>): Promise<T>;
  update(id: string, dto: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

export abstract class BaseController<T extends object & AnyEntity> implements ControllerContract<T> {
  constructor(protected readonly service: BaseService<T>) {}

  @Get()
  async getAll(): Promise<T[]> {
    return this.service.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<T> {
    return this.service.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: EntityData<T>): Promise<T> {
    return this.service.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<T>
  ): Promise<T> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<boolean> {
    return this.service.delete(id);
  }
}
