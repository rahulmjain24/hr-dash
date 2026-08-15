import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { Department } from './src/entities/department.entity.js';
import { BaseEntity } from './src/entities/base.entity.js';

export default defineConfig({
  entities: [Department, BaseEntity],
  dbName: 'hr_database',
  user: 'hr_admin',
  password: 'supersecretpassword',
  host: 'localhost',
  port: 5432,
  extensions: [Migrator],
  migrations: {
    path: './src/migrations', // where migrations are saved
    transactional: true,      // wrap migrations in a single transaction
  },
});