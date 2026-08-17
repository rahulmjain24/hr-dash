import { Migration } from '@mikro-orm/migrations';

export class Migration20260815164339 extends Migration {

  override name = 'Migration20260815164339';

  override up(): void | Promise<void> {
    this.addSql(`create table "tbl_departments" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" text not null, "description" varchar(255) null, primary key ("id"));`);

    this.addSql(`alter table "tbl_departments" add constraint "tbl_departments_name_check" check ("name" in ('ENGINEERING', 'HR', 'SALES', 'FINANCE', 'IT'));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "tbl_departments" cascade;`);
  }

}
