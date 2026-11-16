import { Entity, Property, Unique, ManyToOne, Enum } from '@mikro-orm/decorators/legacy';
import { BigIntType } from '@mikro-orm/core';
import { BaseUUIDEntity } from './base.entity';
import { ApplicationFormEntity } from './application-form.entity';

export enum DocumentTypeEnum {
  RESUME = 'RESUME',
  COVER_LETTER = 'COVER_LETTER',
  REFERENCES = 'REFERENCES',
  OTHER = 'OTHER'
}

@Entity({ tableName: 'tbl_documents' })
@Unique({ properties: ['bucket', 'objectKey'] })
export class DocumentEntity extends BaseUUIDEntity {
  @ManyToOne(() => ApplicationFormEntity, {
    joinColumn: 'application_id',
    deleteRule: 'cascade',
    updateRule: 'cascade',
    index: true,
  })
  application!: ApplicationFormEntity;

  @Enum({ items: () => DocumentTypeEnum })
  documentType!: DocumentTypeEnum;

  @Property({ type: 'string', length: 20 })
  status!: string;

  @Property({ type: 'string', length: 63 })
  bucket!: string;

  @Property({ type: 'string', length: 1024 })
  objectKey!: string;

  @Property({ type: 'string', length: 255 })
  originalFilename!: string;

  @Property({ type: 'string', length: 127 })
  mimeType!: string;

  @Property({ type: new BigIntType('number') })
  sizeBytes!: number;

  @Property({ type: 'string', length: 128, nullable: true })
  checksum?: string;

  @Property({ type: 'json', nullable: true })
  meta?: Record<string, any>;
}
