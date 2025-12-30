import OpenAI from 'openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface OpenAiConfig {
  apiKey: string;
  model: string;
}

@Injectable()
export class OpenAiService extends OpenAI {
  readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const config = configService.get<OpenAiConfig>('openAi');

    if (!config) {
      throw new Error('OpenAI configuration is missing');
    }

    super({
      apiKey: config.apiKey,
    });

    this.model = config.model;
  }

  async askWithContext(context: string, message: string) {
    const completion = await this.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `
You are a helpful AI assistant.
Answer the user's question ONLY using the provided document.
If the answer is not present in the context, say:
"I don't know based on the provided document."

Do not use prior knowledge.
Do not guess.
`,
        },
        {
          role: 'system',
          content: `
Context:
${context}
`.trim(),
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    return {
      answer: completion.choices[0].message.content,
    };
  }
}
