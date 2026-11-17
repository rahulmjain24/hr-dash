import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { extname } from 'path';
import type { Readable } from 'stream';
import { BaseService } from './base.service';
import { DocumentEntity, DocumentTypeEnum } from '../entities/document.entity';
import type { ApplicationFormEntity } from '../entities/application-form.entity';
import { DocumentRepository } from '../repositories/document.repository';
import { ApplicationFormService } from './application-form.service';
import { StorageService } from './storage.service';
import { DocumentStatusEnum } from '../dtos/document.dto';
import type { SubmitApplicationDto } from '../dtos/public-application.dto';

export const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;

const PDF_MAGIC = Buffer.from('%PDF-');
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const OLE_MAGIC = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);

const ALLOWED_FORMATS: Record<string, { mimeType: string; magic: Buffer }> = {
  '.pdf': { mimeType: 'application/pdf', magic: PDF_MAGIC },
  '.doc': { mimeType: 'application/msword', magic: OLE_MAGIC },
  '.docx': {
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    magic: ZIP_MAGIC,
  },
};

export interface UploadedDocumentFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface StagedDocument {
  uploadId: string;
  documentType: DocumentTypeEnum;
  originalFilename: string;
  sizeBytes: number;
}

@Injectable()
export class DocumentService extends BaseService<DocumentEntity> {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    protected readonly documentRepo: DocumentRepository,
    private readonly applicationFormService: ApplicationFormService,
    private readonly storageService: StorageService,
  ) {
    super(documentRepo);
  }

  async findByApplicationId(applicationId: string): Promise<DocumentEntity[]> {
    await this.applicationFormService.getById(applicationId);
    return this.documentRepo.findByApplicationId(applicationId);
  }

  async stage(
    file: UploadedDocumentFile | undefined,
    documentType: DocumentTypeEnum,
  ): Promise<StagedDocument> {
    const validated = this.validateFile(file);
    const uploadId = randomUUID();

    await this.storageService.upload(
      this.storageService.tmpBucket,
      uploadId,
      validated.buffer,
      validated.mimeType,
      {
        'original-filename': encodeURIComponent(validated.originalFilename),
        'document-type': documentType,
        sha256: validated.checksum,
      },
    );

    return {
      uploadId,
      documentType,
      originalFilename: validated.originalFilename,
      sizeBytes: validated.buffer.length,
    };
  }

  async submitApplication(dto: SubmitApplicationDto): Promise<ApplicationFormEntity> {
    const uploadIds = [...new Set(dto.documentIds)];
    const { tmpBucket, bucket } = this.storageService;

    const staged = await Promise.all(
      uploadIds.map(async (uploadId) => {
        const info = await this.storageService.stat(tmpBucket, uploadId);
        const originalFilename = decodeURIComponent(
          info?.metadata['original-filename'] ?? '',
        );
        const extension = extname(originalFilename).toLowerCase();
        const documentType = info?.metadata['document-type'] as DocumentTypeEnum;
        if (
          !info ||
          !ALLOWED_FORMATS[extension] ||
          !Object.values(DocumentTypeEnum).includes(documentType)
        ) {
          throw new BadRequestException(
            'An uploaded document has expired or does not exist. Please upload it again.',
          );
        }
        return { uploadId, info, originalFilename, extension, documentType };
      }),
    );

    if (!staged.some((item) => item.documentType === DocumentTypeEnum.RESUME)) {
      throw new BadRequestException('A resume is required to submit an application');
    }

    const application = await this.applicationFormService.submitApplication(dto);

    const movedKeys: string[] = [];
    try {
      for (const item of staged) {
        const objectKey = `applications/${application.id}/${item.uploadId}${item.extension}`;
        await this.storageService.copy(tmpBucket, item.uploadId, bucket, objectKey);
        movedKeys.push(objectKey);
        await this.create({
          application,
          documentType: item.documentType,
          status: DocumentStatusEnum.UPLOADED,
          bucket,
          objectKey,
          originalFilename: item.originalFilename,
          mimeType: ALLOWED_FORMATS[item.extension].mimeType,
          sizeBytes: item.info.size,
          checksum: item.info.metadata.sha256,
        });
      }
    } catch (error) {
      this.logger.error(
        `Attaching documents to application ${application.id} failed: ${(error as Error).message}`,
      );
      await Promise.all(movedKeys.map((key) => this.removeQuietly(bucket, key)));
      await this.applicationFormService.delete(application.id);
      throw new InternalServerErrorException(
        'Could not save your documents. Please try submitting again.',
      );
    }

    await Promise.all(
      staged.map((item) => this.removeQuietly(tmpBucket, item.uploadId)),
    );
    return application;
  }

  private validateFile(file: UploadedDocumentFile | undefined) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('A non-empty file is required');
    }
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      throw new BadRequestException('File must be at most 5 MB');
    }

    const originalFilename = Buffer.from(file.originalname, 'latin1')
      .toString('utf8')
      .slice(0, 255);
    const extension = extname(originalFilename).toLowerCase();
    const format = ALLOWED_FORMATS[extension];
    if (
      !format ||
      !file.buffer.subarray(0, format.magic.length).equals(format.magic)
    ) {
      throw new BadRequestException('Only PDF, DOC and DOCX files are accepted');
    }

    return {
      buffer: file.buffer,
      originalFilename,
      mimeType: format.mimeType,
      checksum: createHash('sha256').update(file.buffer).digest('hex'),
    };
  }

  private async removeQuietly(bucket: string, objectKey: string): Promise<void> {
    await this.storageService
      .remove(bucket, objectKey)
      .catch((error: Error) =>
        this.logger.error(`Failed to remove ${bucket}/${objectKey}: ${error.message}`),
      );
  }

  async download(
    id: string,
  ): Promise<{ document: DocumentEntity; stream: Readable }> {
    const document = await this.getById(id);
    const stream = await this.storageService.download(
      document.bucket,
      document.objectKey,
    );
    return { document, stream };
  }
}
