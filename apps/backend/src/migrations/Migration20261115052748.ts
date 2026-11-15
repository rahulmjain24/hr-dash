import { Migration } from '@mikro-orm/migrations';

export class Migration20261115052748 extends Migration {

  override name = 'Migration20261115052748';

  override up(): void | Promise<void> {
    this.addSql(`create table "tbl_job_listings" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default current_timestamp, "updated_at" timestamptz not null default current_timestamp, "title" varchar(255) not null, "description" varchar(255) null, "department" text null, "start_date" timestamptz null, "end_date" timestamptz null, "is_active" boolean null, primary key ("id"));`);

    this.addSql(`alter table "tbl_job_listings" add constraint "tbl_job_listings_department_foreign" foreign key ("department") references "tbl_departments" ("name") on update cascade on delete set null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "tbl_job_listings" cascade;`);
  }

}
