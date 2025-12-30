import { Injectable } from '@nestjs/common';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDbService } from 'src/providers/dynamodb.service';
import { DocumentStatus } from './enum/documentStatus.enum';
import { DocumentItem } from './interface/document.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentRepository {
  constructor(private readonly dynamoDbService: DynamoDbService) {}

  async create(params: {
    filename: string;
    email: string;
  }): Promise<DocumentItem> {
    const document: DocumentItem = {
      id: randomUUID(),
      status: DocumentStatus.PENDING,
      filename: params.filename,
      userEmail: params.email,
    };

    await this.dynamoDbService.send(
      new PutCommand({
        TableName: this.dynamoDbService.tableName,
        Item: document,
        ConditionExpression: 'attribute_not_exists(id)',
      }),
    );

    return document;
  }
}
