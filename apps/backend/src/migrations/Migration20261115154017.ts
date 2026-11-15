import { Migration } from '@mikro-orm/migrations';

export class Migration20261115154017 extends Migration {
  override name = 'Migration20261115154017';

  override up(): void | Promise<void> {
    this.addSql(
      `create table "tbl_password_reset_tokens" (
        "id" uuid not null default gen_random_uuid(), 
        "created_at" timestamptz not null default current_timestamp, 
        "updated_at" timestamptz not null default current_timestamp, 
        "user_id" uuid not null, 
        "token_hash" varchar(255) not null, 
        "expires_at" timestamptz not null, 
        "used_at" timestamptz null, 
        primary key ("id")
      );`,
    );

    this.addSql(
      `alter table "tbl_password_reset_tokens" add constraint "tbl_password_reset_tokens_token_hash_unique" unique ("token_hash");`,
    );

    this.addSql(
      `alter table "tbl_password_reset_tokens" add constraint "tbl_password_reset_tokens_user_id_foreign" foreign key ("user_id") references "tbl_users" ("id") on update cascade on delete cascade;`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "tbl_password_reset_tokens" cascade;`);
  }
}
