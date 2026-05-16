import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.bucket = process.env.STORAGE_BUCKET_NAME || 'caretaker-uploads';
    this.publicUrl = process.env.STORAGE_PUBLIC_URL || '';

    this.s3 = new S3Client({
      region: process.env.STORAGE_REGION || 'auto',
      endpoint: process.env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const key = `${folder}/${uuidv4()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `${this.publicUrl}/${key}`;
  }
}
