import { Body, Controller, Param, Post } from '@nestjs/common';
import { AskChatDto } from './dto/askChat.dto';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('/documents/:id')
  askChat(@Param('id') documentId: string, @Body() dto: AskChatDto) {
    return this.aiService.askChat(documentId, dto.message);
  }
}
