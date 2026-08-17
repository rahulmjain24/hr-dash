import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { DepartmentModule } from './modules/department.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Department } from './entities/department.entity';
import { BaseUUIDEntity } from './entities/base.entity';
import config from '../mikro-orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    MikroOrmModule.forRoot(config),
    DepartmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
