import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class ContentRewriteService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async rewrite(input: { content: string; style: string; tone?: string }) {
    const tone = input.tone || 'engaging';

    const prompt = `Rewrite and optimize this content for viral short-form video.

Original Content: ${input.content}
Style: ${input.style}
Tone: ${tone}

Requirements:
- Make it more engaging and viral
- Optimize for short attention spans
- Add emotional triggers
- Improve hook
- Make it more shareable

Return JSON:
{
  "rewritten": "The rewritten content",
  "variations": [
    "Variation 1 with different angle",
    "Variation 2 with different angle",
    "Variation 3 with different angle"
  ],
  "improvements": ["list of improvements made"],
  "viralScoreBefore": 0.0-1.0,
  "viralScoreAfter": 0.0-1.0
}`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Failed to rewrite content');

    return JSON.parse(content);
  }
}
