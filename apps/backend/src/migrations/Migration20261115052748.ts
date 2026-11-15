import { Migration } from '@mikro-orm/migrations';

export class Migration20261115052748 extends Migration {

  override name = 'Migration20261115052748';

  override up(): void | Promise<void> {
    this.addSql(`select 1`);
  }

  override down(): void | Promise<void> {
    this.addSql(`select 1`);
  }

}
