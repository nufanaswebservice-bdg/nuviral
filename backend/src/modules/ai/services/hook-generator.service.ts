import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class HookGeneratorService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async generate(input: { niche: string; topic: string; style?: string }) {
    const style = input.style || 'curiosity-gap';

    const prompt = `You are a viral hook expert for short-form video. Generate 5 powerful hooks (first 3 seconds) that stop people from scrolling.

Niche: ${input.niche}
Topic: ${input.topic}
Style: ${style}

Hook styles to use:
- Curiosity gap: "You won't believe what happens when..."
- Controversial: "Everyone is wrong about..."
- Story: "I just discovered something that changed..."
- Question: "Did you know that...?"
- Shock: "This is the reason why..."

Return JSON:
{
  "hooks": [
    {
      "text": "The hook text",
      "style": "curiosity-gap|controversial|story|question|shock",
      "viralPotential": 0.0-1.0,
      "emotionalTrigger": "curiosity|fear|excitement|anger|surprise"
    }
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
      temperature: 0.9,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Failed to generate hooks');

    return JSON.parse(content);
  }
}
