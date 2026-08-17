import type { AnyEntity, EntityData, FilterQuery } from '@mikro-orm/core';
import { EntityRepository, type QueryBuilder } from '@mikro-orm/postgresql';

interface RepositoryContract<T extends object & AnyEntity> {
    query(): QueryBuilder<T>;

    getAll(): Promise<T[]>;
    createOne(values: EntityData<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    updateById(id: string, values: EntityData<T>): Promise<T | null>;
    destroy(id: string): Promise<boolean>;

    findBy<K extends keyof T>(key: K, value: T[K]): Promise<T | null>;
    findByOrFail<K extends keyof T>(key: K, value: T[K]): Promise<T>;
    findMany(ids: string[]): Promise<T[]>;

    findOneByAttributes(values: FilterQuery<T>, attributes?: Array<keyof T>): Promise<T | null>;
    findManyByAttributes(values: FilterQuery<T>, attributes?: Array<keyof T>, limit?: number): Promise<T[]>;

    countAll(): Promise<number>;
    countByAttributes(values: FilterQuery<T>): Promise<number>;

    updateOneByAttributes(where: FilterQuery<T>, values: EntityData<T>): Promise<T | null>;
    deleteByAttributes(values: FilterQuery<T>): Promise<number>;
}

export abstract class BaseRepository<T extends object & AnyEntity>
    extends EntityRepository<T>
    implements RepositoryContract<T> {

    query(): QueryBuilder<T> {
        return this.createQueryBuilder();
    }

    async getAll(): Promise<T[]> {
        return this.findAll();
    }

    async createOne(values: EntityData<T>): Promise<T> {
        const entity = this.create(values as any);
        this.em.persist(entity);
        await this.em.flush();
        return entity;
    }

    async findById(id: string): Promise<T | null> {
        return this.findOne({ id } as FilterQuery<T>);
    }

    async updateById(id: string, values: Partial<T>): Promise<T | null> {
        const entity = await this.findById(id);
        if (!entity) return null;

        this.assign(entity, values as any);
        await this.em.flush();
        return entity;
    }

    async destroy(id: string): Promise<boolean> {
        const entity = await this.findById(id);
        if (!entity) return false;

        this.em.remove(entity);
        await this.em.flush();
        return true;
    }

    async findBy<K extends keyof T>(key: K, value: T[K]): Promise<T | null> {
        return this.findOne({ [key]: value } as FilterQuery<T>);
    }

    async findByOrFail<K extends keyof T>(key: K, value: T[K]): Promise<T> {
        return this.findOneOrFail({ [key]: value } as FilterQuery<T>);
    }

    async findMany(ids: string[]): Promise<T[]> {
        return this.find({ id: { $in: ids } } as FilterQuery<T>);
    }

    async findOneByAttributes(values: FilterQuery<T>, attributes?: Array<keyof T>): Promise<T | null> {
        return this.findOne(values, { fields: attributes as any });
    }

    async findManyByAttributes(values: FilterQuery<T>, attributes?: Array<keyof T>, limit?: number): Promise<T[]> {
        return this.find(values, { fields: attributes as any, limit });
    }

    async countAll(): Promise<number> {
        return this.count();
    }

    async countByAttributes(values: FilterQuery<T>): Promise<number> {
        return this.count(values);
    }

    async updateOneByAttributes(where: FilterQuery<T>, values: EntityData<T>): Promise<T | null> {
        const entity = await this.findOne(where);
        if (!entity) return null;

        this.assign(entity, values as any);
        await this.em.flush();
        return entity;
    }

    async deleteByAttributes(values: FilterQuery<T>): Promise<number> {
        return this.nativeDelete(values);
    }
}