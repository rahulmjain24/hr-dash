import { Migration } from '@mikro-orm/migrations';

export class Migration20261117062432_create_tbl_application_status_history extends Migration {

  override name = 'Migration20261117062432_create_tbl_application_status_history';

  override up(): void | Promise<void> {
    this.addSql(`create table "tbl_application_status_history" (
      "id" uuid not null default gen_random_uuid(),
      "application_id" uuid not null,
      "user_id" uuid not null,
      "changed_at" timestamptz not null default now(),
      "old_status" varchar(20) null,
      "new_status" varchar(20) not null,
      "remarks" text null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      constraint "tbl_application_status_history_pkey" primary key ("id")
    );`);

    this.addSql(`alter table "tbl_application_status_history" add constraint "tbl_application_status_history_application_id_foreign" foreign key ("application_id") references "tbl_application_forms" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "tbl_application_status_history" add constraint "tbl_application_status_history_user_id_foreign" foreign key ("user_id") references "tbl_users" ("id") on update cascade on delete restrict;`);

    this.addSql(`create index "tbl_application_status_history_application_id_changed_at_index" on "tbl_application_status_history" ("application_id", "changed_at");`);
    this.addSql(`create index "tbl_application_status_history_user_id_index" on "tbl_application_status_history" ("user_id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "tbl_application_status_history" cascade;`);
  }
}
