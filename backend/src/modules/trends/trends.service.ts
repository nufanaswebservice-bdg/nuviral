import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrendsService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async analyzeTrends(platform: string, niche?: string) {
    const prompt = `Analyze current trending topics and content patterns on ${platform}${niche ? ` in the ${niche} niche` : ''}.

Return JSON:
{
  "trends": [
    {
      "keyword": "trending topic",
      "volume": "estimated search/view volume",
      "growth": "percentage growth",
      "viralScore": 0.0-1.0,
      "relatedHashtags": ["#hashtag1", "#hashtag2"],
      "contentIdeas": ["idea 1", "idea 2"]
    }
  ],
  "trendingHashtags": ["#top", "#hashtags"],
  "trendingSounds": ["sound descriptions"],
  "recommendations": ["actionable recommendations"]
}`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Failed to analyze trends');

    return JSON.parse(content);
  }

  async getViralHashtags(platform: string, category?: string) {
    return this.prisma.hashtag.findMany({
      where: {
        platform: platform as any,
        ...(category ? { category } : {}),
        isViral: true,
      },
      orderBy: { trendScore: 'desc' },
      take: 50,
    });
  }

  async analyzeCompetitor(username: string, platform: string) {
    const prompt = `Analyze the content strategy of @${username} on ${platform}.

Provide insights on:
- Content themes and patterns
- Posting frequency
- Engagement patterns
- Hook styles used
- Hashtag strategy
- Growth tactics

Return JSON:
{
  "username": "${username}",
  "platform": "${platform}",
  "contentThemes": ["theme1", "theme2"],
  "postingFrequency": "description",
  "avgEngagement": "estimate",
  "hookStyles": ["style1", "style2"],
  "hashtagStrategy": "description",
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "recommendations": ["what you can learn"]
}`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Failed to analyze competitor');

    return JSON.parse(content);
  }
}
