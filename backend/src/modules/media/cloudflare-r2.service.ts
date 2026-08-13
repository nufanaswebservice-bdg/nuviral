import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class CloudflareR2Service {
  private readonly logger = new Logger(CloudflareR2Service.name);
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');

    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME', 'nuviral-assets');
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL', '');

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });

    this.logger.log('Cloudflare R2 service initialized');
  }

  /**
   * Upload file to R2 bucket
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<{ key: string; url: string }> {
    const ext = path.extname(file.originalname);
    const key = `${folder}/${randomUUID()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    });

    await this.s3Client.send(command);

    const url = this.publicUrl ? `${this.publicUrl}/${key}` : key;

    this.logger.log(`File uploaded: ${key}`);
    return { key, url };
  }

  /**
   * Upload buffer directly (for generated content like thumbnails, videos)
   */
  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    contentType: string,
    folder: string = 'generated',
  ): Promise<{ key: string; url: string }> {
    const ext = path.extname(filename);
    const key = `${folder}/${randomUUID()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ContentLength: buffer.length,
    });

    await this.s3Client.send(command);

    const url = this.publicUrl ? `${this.publicUrl}/${key}` : key;

    this.logger.log(`Buffer uploaded: ${key}`);
    return { key, url };
  }

  /**
   * Delete file from R2 bucket
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
    this.logger.log(`File deleted: ${key}`);
  }

  /**
   * Generate presigned URL for direct upload (client-side upload)
   */
  async getPresignedUploadUrl(
    filename: string,
    contentType: string,
    folder: string = 'uploads',
    expiresIn: number = 3600,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    const ext = path.extname(filename);
    const key = `${folder}/${randomUUID()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    const publicFileUrl = this.publicUrl ? `${this.publicUrl}/${key}` : key;

    return { uploadUrl, key, publicUrl: publicFileUrl };
  }

  /**
   * Generate presigned URL for private download
   */
  async getPresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key: string): string {
    return this.publicUrl ? `${this.publicUrl}/${key}` : key;
  }
}
