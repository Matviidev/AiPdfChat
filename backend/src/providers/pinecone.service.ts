import { Pinecone } from '@pinecone-database/pinecone';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface PineconeConfig {
  apiKey: string;
  index: string;
}

@Injectable()
export class PineconeService extends Pinecone {
  readonly indexName: string;

  constructor(private readonly configService: ConfigService) {
    const config = configService.get<PineconeConfig>('pinecone');

    if (!config) {
      throw new Error('Pinecone configuration is missing');
    }

    super({
      apiKey: config.apiKey,
    });

    this.indexName = config.index;
  }

  getDefaultIndex() {
    return this.index(this.indexName);
  }
}
