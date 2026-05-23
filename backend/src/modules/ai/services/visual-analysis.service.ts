import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

const MAX_IMAGES_PER_REQUEST = 20;
const MAX_FRAMES_PER_REQUEST = 4;

@Injectable()
export class VisualAnalysisService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  /**
   * Validate the number of images before sending to OpenAI API
   * OpenAI has a limit of 100 images+documents per request
   */
  private validateImageCount(images: string[], maxAllowed: number = MAX_IMAGES_PER_REQUEST): string[] {
    if (images.length > maxAllowed) {
      throw new BadRequestException(
        `Too many images: ${images.length} exceeds maximum of ${maxAllowed} per request`,
      );
    }
    return images;
  }

  /**
   * Analyze an image using OpenAI Vision
   */
  async analyzeImage(imageUrl: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image for video creation. Return JSON:
{
  "objects": ["detected objects"],
  "style": "visual style (cinematic/modern/vintage/etc)",
  "mood": "emotional mood",
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  "suggestedMotion": "camera motion suggestion",
  "suggestedTransitions": ["transition1", "transition2"],
  "sceneDescription": "brief scene description",
  "videoEnergy": 0.0-1.0,
  "bestPlatform": "TikTok/YouTube/Instagram"
}`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Failed to analyze image');
    return JSON.parse(content);
  }

  /**
   * Analyze video reference style
   */
  async analyzeVideoStyle(frames: string[]) {
    // Validate and limit frames to prevent exceeding OpenAI API limits
    const limitedFrames = frames.slice(0, MAX_FRAMES_PER_REQUEST);
    this.validateImageCount(limitedFrames, MAX_FRAMES_PER_REQUEST);

    const prompt = `Analyze these video frames and determine the editing style. Return JSON:
{
  "style": "overall editing style",
  "pacing": "cut frequency description",
  "transitions": ["transition types used"],
  "subtitleStyle": "subtitle appearance",
  "colorGrading": "color treatment",
  "hookStyle": "how the video hooks viewers",
  "energy": "low/medium/high",
  "cameraMovements": ["movement types"],
  "recommendations": ["how to replicate this style"]
}`;

    const imageContent = limitedFrames.map((frame) => ({
      type: 'image_url' as const,
      image_url: { url: frame },
    }));

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: prompt }, ...imageContent],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Failed to analyze video style');
    return JSON.parse(content);
  }

  /**
   * Generate storyboard from images and script
   */
  async generateStoryboard(input: {
    script: string;
    images?: string[];
    style: string;
    duration: number;
  }) {
    // Validate image count if images are provided
    if (input.images && input.images.length > 0) {
      this.validateImageCount(input.images, MAX_IMAGES_PER_REQUEST);
    }
    const prompt = `Create a video storyboard based on this script and style.

Script: ${input.script}
Style: ${input.style}
Duration: ${input.duration} seconds
${input.images ? `Reference images provided: ${input.images.length}` : ''}

Return JSON:
{
  "scenes": [
    {
      "sceneNumber": 1,
      "startTime": 0,
      "endTime": 3,
      "description": "scene visual description",
      "cameraMotion": "zoom/pan/static",
      "transition": "cut/fade/zoom",
      "subtitle": "text shown",
      "voiceover": "text spoken",
      "soundEffect": "effect name or null",
      "imageRef": "which reference image to use (index) or null"
    }
  ],
  "totalScenes": 8,
  "estimatedDuration": 30,
  "musicSuggestion": "music mood"
}`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 3000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Failed to generate storyboard');
    return JSON.parse(content);
  }
}
