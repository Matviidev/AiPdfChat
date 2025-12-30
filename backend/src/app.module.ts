import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { validationSchema } from './config/config.schema';
import { DocumentsModule } from './documents/documents.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema,
    }),
    DocumentsModule,
    AiModule,
  ],
})
export class AppModule {}
