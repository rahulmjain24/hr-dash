import { Migration } from '@mikro-orm/migrations';

export class Migration20260819085709 extends Migration {

  override name = 'Migration20260819085709';

  override up(): void | Promise<void> {
    this.addSql(`create table "tbl_users" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default current_timestamp, "updated_at" timestamptz not null default current_timestamp, "email" varchar(255) not null, "password" varchar(255) not null, "name" varchar(255) not null, "role" text not null default 'MEMBER', primary key ("id"));`);
    this.addSql(`create index "tbl_users_email_index" on "tbl_users" ("email");`);
    this.addSql(`alter table "tbl_users" add constraint "tbl_users_email_unique" unique ("email");`);

    this.addSql(`alter table "tbl_users" add constraint "tbl_users_role_check" check ("role" in ('ADMIN', 'MEMBER'));`);

    this.addSql(`alter table "tbl_departments" alter column "created_at" set default current_timestamp;`);
    this.addSql(`alter table "tbl_departments" alter column "updated_at" set default current_timestamp;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "tbl_users" cascade;`);

    this.addSql(`alter table "tbl_departments" alter column "created_at" drop default;`);
    this.addSql(`alter table "tbl_departments" alter column "updated_at" drop default;`);
  }

}
