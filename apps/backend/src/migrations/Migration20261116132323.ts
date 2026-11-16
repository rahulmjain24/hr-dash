import { Migration } from '@mikro-orm/migrations';

export class Migration20261116132323 extends Migration {

  override name = 'Migration20261116132323';

  override up(): void | Promise<void> {
    this.addSql(`alter table "tbl_job_listings" alter column "description" type text;`);
    this.addSql(`alter table "tbl_job_listings" add constraint "chk_tbl_job_listings_description_length" check (char_length("description") <= 10000);`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "tbl_job_listings" drop constraint if exists "chk_tbl_job_listings_description_length";`);
    this.addSql(`alter table "tbl_job_listings" alter column "description" type varchar(255) using left("description", 255);`);
  }
}
