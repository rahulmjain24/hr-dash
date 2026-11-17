import { Migration } from '@mikro-orm/migrations';

export class Migration20261117083610 extends Migration {

  override name = 'Migration20261117083610';

  override up(): void | Promise<void> {
    this.addSql(`create table "tbl_interviews" (
      "id" uuid not null default gen_random_uuid(),
      "application_id" uuid not null,
      "interviewer_user_id" uuid not null,
      "scheduled_at" timestamptz not null,
      "duration_minutes" integer not null default 60,
      "meeting_link" varchar(2048) null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      constraint "tbl_interviews_pkey" primary key ("id")
    );`);

    this.addSql(`alter table "tbl_interviews" add constraint "tbl_interviews_application_id_foreign" foreign key ("application_id") references "tbl_application_forms" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "tbl_interviews" add constraint "tbl_interviews_interviewer_user_id_foreign" foreign key ("interviewer_user_id") references "tbl_users" ("id") on update cascade on delete restrict;`);

    this.addSql(`create index "tbl_interviews_application_id_index" on "tbl_interviews" ("application_id");`);
    this.addSql(`create index "tbl_interviews_interviewer_user_id_scheduled_at_index" on "tbl_interviews" ("interviewer_user_id", "scheduled_at");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "tbl_interviews" cascade;`);
  }
}
