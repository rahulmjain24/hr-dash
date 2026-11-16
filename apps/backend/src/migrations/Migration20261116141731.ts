import { Migration } from '@mikro-orm/migrations';

export class Migration20261116141731 extends Migration {

  override name = 'Migration20261116141731';

  override up(): void | Promise<void> {
    this.addSql(`create table "tbl_documents" (
      "id" uuid not null default gen_random_uuid(),
      "application_id" uuid not null,
      "document_type" varchar(50) not null,
      "status" varchar(20) not null,
      "bucket" varchar(63) not null,
      "object_key" varchar(1024) not null,
      "original_filename" varchar(255) not null,
      "mime_type" varchar(127) not null,
      "size_bytes" bigint not null,
      "checksum" varchar(128) null,
      "meta" jsonb null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      constraint "tbl_documents_pkey" primary key ("id")
    );`);

    this.addSql(`alter table "tbl_documents" add constraint "tbl_documents_application_id_foreign" foreign key ("application_id") references "tbl_application_forms" ("id") on update cascade on delete cascade;`);

    this.addSql(`create index "tbl_documents_application_id_index" on "tbl_documents" ("application_id");`);
    this.addSql(`create unique index "tbl_documents_bucket_object_key_unique" on "tbl_documents" ("bucket", "object_key");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "tbl_documents" cascade;`);
  }
}
