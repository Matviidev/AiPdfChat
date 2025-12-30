import { PutObjectCommand } from '@aws-sdk/client-s3';
import { S3Service } from 'src/providers/s3.service';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentS3Repository {
  constructor(private readonly s3Service: S3Service) {}

  async getUploadUrl(filename: string) {
    const command = new PutObjectCommand({
      Bucket: this.s3Service.documentBucket,
      Key: filename,
      ContentType: 'application/pdf',
    });

    const url = await getSignedUrl(this.s3Service, command, {
      expiresIn: 30000,
    });
    return url;
  }
}
