import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { GetUploadUrlDto } from './dto/getUploadUrl.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentService: DocumentsService) {}

  @Post('/upload-url')
  getUploadUrl(@Body() dto: GetUploadUrlDto) {
    return this.documentService.getUploadUrl(dto.filename, dto.email);
  }

  @Get('/:id')
  getDocument(@Param('id') id: string) {
    return this.documentService.getDocument(id);
  }
}
