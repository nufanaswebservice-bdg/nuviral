import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class ViralPredictionService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async predict(input: { script: string; platform: string; niche: string }) {
    const prompt = `Analyze this short-form video script and predict its viral potential on ${input.platform}.

Script: ${input.script}
Niche: ${input.niche}

Analyze based on:
1. Hook strength (first 3 seconds)
2. Emotional triggers
3. Shareability factor
4. Watch-time retention potential
5. Comment-bait potential
6. Trend alignment
7. Audience relatability
8. CTA effectiveness

Return JSON:
{
  "viralScore": 0.0-1.0,
  "breakdown": {
    "hookStrength": 0.0-1.0,
    "emotionalAppeal": 0.0-1.0,
    "shareability": 0.0-1.0,
    "retentionPotential": 0.0-1.0,
    "commentPotential": 0.0-1.0,
    "trendAlignment": 0.0-1.0,
    "relatability": 0.0-1.0,
    "ctaEffectiveness": 0.0-1.0
  },
  "strengths": ["list of strengths"],
  "weaknesses": ["list of weaknesses"],
  "improvements": ["specific improvement suggestions"],
  "estimatedViews": "range estimate like 10K-50K",
  "bestPostingTime": "recommended posting time",
  "targetAudience": "description of ideal audience"
}`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.6,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Failed to predict viral score');

    return JSON.parse(content);
  }
}
