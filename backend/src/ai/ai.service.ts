import { Injectable } from '@nestjs/common';
import { PineconeService } from 'src/providers/pinecone.service';
import { OpenAiService } from './openAi.service';

@Injectable()
export class AiService {
  constructor(
    private readonly pineconeService: PineconeService,
    private readonly openAiService: OpenAiService,
  ) {}

  async askChat(documentId: string, message: string) {
    const index = this.pineconeService.getDefaultIndex();

    const searchResponse = await index.searchRecords({
      query: {
        inputs: { text: message },
        topK: 5,
        filter: {
          source_key: { $eq: documentId },
        },
      },
      rerank: {
        model: 'bge-reranker-v2-m3',
        topN: 5,
        rankFields: ['chunk_text'],
      },
    });

    const context = searchResponse.result.hits
      .map(
        (hit, i) =>
          `[#${i + 1}] ${(hit.fields as Record<string, string>).chunk_text}`,
      )
      .join('\n\n');

    return this.openAiService.askWithContext(context, message);
  }
}
