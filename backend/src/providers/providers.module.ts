import { Module } from '@nestjs/common';
import { DynamoDbService } from './dynamodb.service';
import { S3Service } from './s3.service';
import { PineconeService } from './pinecone.service';

@Module({
  providers: [S3Service, DynamoDbService, PineconeService],
  exports: [S3Service, DynamoDbService, PineconeService],
})
export class ProvidersModule {}
