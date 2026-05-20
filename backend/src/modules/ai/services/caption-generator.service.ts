import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class CaptionGeneratorService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async generate(input: { script: string; platform: string; tone?: string }) {
    const tone = input.tone || 'engaging';

    const prompt = `Generate an optimized social media caption for ${input.platform}.

Script/Content: ${input.script}
Tone: ${tone}

Requirements:
- Platform-optimized length
- Include emoji strategically
- Include CTA
- SEO optimized
- Engagement-driving

Return JSON:
{
  "caption": "The main caption text",
  "shortCaption": "Shorter version for platforms with limits",
  "seoCaption": "SEO-optimized version",
  "emojis": ["relevant", "emojis"],
  "cta": "Call to action suggestion"
}`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 800,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Failed to generate caption');

    return JSON.parse(content);
  }
}
