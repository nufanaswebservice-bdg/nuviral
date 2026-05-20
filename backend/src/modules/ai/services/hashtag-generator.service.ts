import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class HashtagGeneratorService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async generate(input: { topic: string; platform: string; niche?: string }) {
    const prompt = `Generate optimized hashtags for ${input.platform} content.

Topic: ${input.topic}
Niche: ${input.niche || 'general'}

Strategy:
- Mix of high-volume and niche hashtags
- Include trending hashtags
- Platform-specific optimization
- 20-30 hashtags total

Return JSON:
{
  "hashtags": {
    "trending": ["#hashtag1", "#hashtag2"],
    "niche": ["#hashtag3", "#hashtag4"],
    "medium": ["#hashtag5", "#hashtag6"],
    "long_tail": ["#hashtag7", "#hashtag8"]
  },
  "recommended": ["top", "15", "hashtags", "to", "use"],
  "strategy": "Brief explanation of hashtag strategy"
}`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 800,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Failed to generate hashtags');

    return JSON.parse(content);
  }
}
