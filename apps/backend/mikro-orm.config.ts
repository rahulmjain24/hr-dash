import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DepartmentEntity } from './src/entities/department.entity';
import { BaseUUIDEntity } from './src/entities/base.entity';
import { UserEntity } from './src/entities/user.entity';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export default defineConfig({
  entities: [
    BaseUUIDEntity,
    DepartmentEntity,
    UserEntity,
  ],
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string, 10) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  extensions: [Migrator],
  migrations: {
    path: './src/migrations',
    pathTs: './src/migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
  },
  debug: true,
});