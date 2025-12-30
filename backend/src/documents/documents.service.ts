import { Injectable } from '@nestjs/common';
import { DocumentRepository } from './document.repository';
import { DocumentS3Repository } from './documentS3.repository';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentS3Repository: DocumentS3Repository,
  ) {}

  async getUploadUrl(filename: string, email: string) {
    const document = await this.documentRepository.create({ filename, email });
    const url = await this.documentS3Repository.getUploadUrl(document.id);
    return { url, document };
  }
}
