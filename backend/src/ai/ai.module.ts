import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ProvidersModule } from 'src/providers/providers.module';
import { OpenAiService } from './openAi.service';

@Module({
  providers: [AiService, OpenAiService],
  controllers: [AiController],
  imports: [ProvidersModule],
})
export class AiModule {}
