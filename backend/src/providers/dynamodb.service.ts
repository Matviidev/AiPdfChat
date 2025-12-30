import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

@Injectable()
export class DynamoDbService extends DynamoDBClient {
  public readonly tableName = process.env.AWS_DYNAMODB_DOCUMENT_TABLE!;

  constructor() {
    super({
      region: process.env.AWS_REGION || 'eu-north-1',
    });
  }
}
