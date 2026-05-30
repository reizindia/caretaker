import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

function requiredStorageEnv(name: string) {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`${name} must be set for production uploads`);
  }
  return value || '';
}

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.bucket = requiredStorageEnv('STORAGE_BUCKET_NAME') || 'caretaker-uploads';
    this.publicUrl = requiredStorageEnv('STORAGE_PUBLIC_URL');

    this.s3 = new S3Client({
      region: process.env.STORAGE_REGION || 'auto',
      endpoint: requiredStorageEnv('STORAGE_ENDPOINT') || undefined,
      forcePathStyle: true,
      credentials: {
        accessKeyId: requiredStorageEnv('STORAGE_ACCESS_KEY_ID'),
        secretAccessKey: requiredStorageEnv('STORAGE_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    if (
      !process.env.STORAGE_ENDPOINT ||
      !process.env.STORAGE_ACCESS_KEY_ID ||
      !process.env.STORAGE_SECRET_ACCESS_KEY ||
      !this.publicUrl
    ) {
      throw new ServiceUnavailableException('Image storage is not configured');
    }

    const ext = file.originalname.split('.').pop() || 'jpg';
    const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/^\/+|\/+$/g, '') || 'uploads';
    const key = `${safeFolder}/${uuidv4()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `${this.publicUrl.replace(/\/+$/g, '')}/${key}`;
  }
}
