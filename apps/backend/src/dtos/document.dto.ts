import { IsEnum, IsNotEmpty } from 'class-validator';
import { DocumentTypeEnum } from 'src/entities/document.entity';

export enum DocumentStatusEnum {
  UPLOADED = 'UPLOADED',
}

export class UploadDocumentDto {
  @IsNotEmpty({ message: 'documentType is required' })
  @IsEnum(DocumentTypeEnum, {
    message: `documentType must be one of: ${Object.values(DocumentTypeEnum).join(', ')}`,
  })
  documentType!: DocumentTypeEnum;
}
