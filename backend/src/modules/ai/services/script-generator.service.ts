import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class ScriptGeneratorService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async generate(input: {
    niche: string;
    topic?: string;
    tone?: string;
    duration?: number;
    platform?: string;
    language?: string;
  }) {
    const duration = input.duration || 30;
    const language = input.language || 'English';
    const tone = input.tone || 'engaging';
    const platform = input.platform || 'TikTok';

    const prompt = `You are a viral short-form video script expert. Generate a complete video script for ${platform}.

REQUIREMENTS:
- Niche: ${input.niche}
- Topic: ${input.topic || `trending topic in ${input.niche}`}
- Duration: ${duration} seconds
- Tone: ${tone}
- Language: ${language}

Generate the following in JSON format:
{
  "title": "Catchy video title (max 100 chars)",
  "hook": "Attention-grabbing first 3 seconds that stops scrolling",
  "script": "Full video script with timing markers [0s], [3s], [10s], etc.",
  "caption": "Engaging caption for the post (max 300 chars)",
  "cta": "Call to action at the end",
  "hashtags": ["array", "of", "relevant", "hashtags"],
  "viralScore": 0.0-1.0 (predicted virality),
  "estimatedDuration": duration in seconds
}

RULES:
- Hook MUST grab attention in first 3 seconds
- Script must be natural and conversational
- Include emotional triggers
- Use pattern interrupts
- End with strong CTA
- Hashtags should mix trending + niche specific
- Viral score based on hook strength, emotional appeal, and shareability`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to generate script');
    }

    return JSON.parse(content);
  }

  async generateMultipleVariations(input: {
    niche: string;
    topic?: string;
    count?: number;
  }) {
    const count = input.count || 3;
    const prompt = `Generate ${count} different viral script variations for ${input.niche} about "${input.topic || 'trending topic'}".

Each variation should have a different angle/approach.
Return as JSON array with objects containing: title, hook, script, caption, cta, hashtags, viralScore, estimatedDuration.`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
      temperature: 0.9,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to generate variations');
    }

    return JSON.parse(content);
  }
}
