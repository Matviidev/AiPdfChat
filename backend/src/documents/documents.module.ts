import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentRepository } from './document.repository';
import { ProvidersModule } from 'src/providers/providers.module';
import { DocumentS3Repository } from './documentS3.repository';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentRepository, DocumentS3Repository],
  imports: [ProvidersModule],
})
export class DocumentsModule {}
