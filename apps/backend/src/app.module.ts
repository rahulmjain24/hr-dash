import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DepartmentModule } from './modules/department.module';
import config from '../mikro-orm.config';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(config),
    DepartmentModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
