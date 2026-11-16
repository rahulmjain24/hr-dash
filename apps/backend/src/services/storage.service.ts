import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, CopyDestinationOptions, CopySourceOptions } from 'minio';
import type { Readable } from 'stream';
import type { EnvironmentVariables } from '../config/env.validation';

const TMP_EXPIRY_DAYS = 1;

export interface StoredObjectInfo {
  size: number;
  metadata: Record<string, string>;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: Client;
  readonly bucket: string;
  readonly tmpBucket: string;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    this.bucket = config.get('MINIO_BUCKET', { infer: true });
    this.tmpBucket = config.get('MINIO_TMP_BUCKET', { infer: true });
    this.client = new Client({
      endPoint: config.get('MINIO_ENDPOINT', { infer: true }),
      port: config.get('MINIO_PORT', { infer: true }),
      useSSL: config.get('MINIO_USE_SSL', { infer: true }),
      accessKey: config.get('MINIO_ROOT_USER', { infer: true }),
      secretKey: config.get('MINIO_ROOT_PASSWORD', { infer: true }),
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureBucket(this.bucket);
      await this.ensureBucket(this.tmpBucket);
      await this.client.setBucketLifecycle(this.tmpBucket, {
        Rule: [
          {
            ID: 'expire-staged-uploads',
            Status: 'Enabled',
            Filter: { Prefix: '' },
            Expiration: { Days: TMP_EXPIRY_DAYS },
          },
        ],
      });
    } catch (error) {
      this.logger.error(`Could not set up storage buckets: ${(error as Error).message}`);
    }
  }

  private async ensureBucket(bucket: string): Promise<void> {
    if (!(await this.client.bucketExists(bucket))) {
      await this.client.makeBucket(bucket);
      this.logger.log(`Created bucket "${bucket}"`);
    }
  }

  async upload(
    bucket: string,
    objectKey: string,
    data: Buffer,
    mimeType: string,
    metadata: Record<string, string> = {},
  ): Promise<void> {
    await this.client.putObject(bucket, objectKey, data, data.length, {
      ...metadata,
      'Content-Type': mimeType,
    });
  }

  async stat(bucket: string, objectKey: string): Promise<StoredObjectInfo | null> {
    try {
      const stat = await this.client.statObject(bucket, objectKey);
      const metadata: Record<string, string> = {};
      for (const [key, value] of Object.entries(stat.metaData ?? {})) {
        metadata[key.toLowerCase().replace(/^x-amz-meta-/, '')] = String(value);
      }
      return { size: stat.size, metadata };
    } catch (error) {
      if ((error as { code?: string }).code === 'NotFound') return null;
      throw error;
    }
  }

  async copy(
    sourceBucket: string,
    sourceKey: string,
    targetBucket: string,
    targetKey: string,
  ): Promise<void> {
    await this.client.copyObject(
      new CopySourceOptions({ Bucket: sourceBucket, Object: sourceKey }),
      new CopyDestinationOptions({ Bucket: targetBucket, Object: targetKey }),
    );
  }

  async download(bucket: string, objectKey: string): Promise<Readable> {
    return this.client.getObject(bucket, objectKey);
  }

  async remove(bucket: string, objectKey: string): Promise<void> {
    await this.client.removeObject(bucket, objectKey);
  }
}
