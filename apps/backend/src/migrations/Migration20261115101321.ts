import { Migration } from '@mikro-orm/migrations';

export class Migration20261115101321 extends Migration {
  override name = 'Migration20261115101321';

  override up(): void | Promise<void> {
    this.addSql(
      `create table "tbl_application_forms" (
        "id" uuid not null default gen_random_uuid(), 
        "created_at" timestamptz not null default current_timestamp, 
        "updated_at" timestamptz not null default current_timestamp, 
        "email" varchar(255) not null, 
        "first_name" varchar(255) not null, 
        "last_name" varchar(255) not null, 
        "status" varchar(255) null, 
        "additional_properties" jsonb null, 
        "submisson_date" timestamptz null, 
        "job_id" uuid not null, 
        primary key ("id")
      );`,
    );

    this.addSql(
      `alter table "tbl_application_forms" add constraint "tbl_application_forms_job_id_foreign" foreign key ("job_id") references "tbl_job_listings" ("id") on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table "tbl_application_forms" add constraint "tbl_application_forms_email_job_id_unique" unique ("email", "job_id");`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "tbl_application_forms" cascade;`);
  }
}
