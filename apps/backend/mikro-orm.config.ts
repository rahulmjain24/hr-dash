import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DepartmentEntity } from './src/entities/department.entity';
import { BaseUUIDEntity } from './src/entities/base.entity';
import { UserEntity } from './src/entities/user.entity';
import { JobListingEntity } from './src/entities/job-listing.entity';
import { ApplicationFormEntity } from './src/entities/application-form.entity';
import { PasswordResetTokenEntity } from './src/entities/password-reset-token.entity';
import { DocumentEntity } from './src/entities/document.entity';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export default defineConfig({
  entities: [
    BaseUUIDEntity,
    DepartmentEntity,
    UserEntity,
    JobListingEntity,
    ApplicationFormEntity,
    PasswordResetTokenEntity,
    DocumentEntity,
  ],
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string, 10) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  extensions: [Migrator],
  migrations: {
    path: path.join(__dirname, 'src/migrations'),
    pathTs: path.join(__dirname, 'src/migrations'),
    glob: '!(*.d).{js,ts}',
    transactional: true,
  },
  debug: true,
});