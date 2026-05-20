import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export class ThumbnailGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate thumbnail using DALL-E
   */
  async generate(
    prompt: string,
    outputPath: string,
    options: { style?: 'vivid' | 'natural'; size?: '1024x1024' | '1792x1024' } = {},
  ): Promise<string> {
    const { style = 'vivid', size = '1024x1024' } = options;

    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt: `Create a eye-catching YouTube/TikTok thumbnail: ${prompt}. Style: bold text, vibrant colors, high contrast, professional quality.`,
      n: 1,
      size,
      style,
      response_format: 'b64_json',
    });

    const imageData = response.data[0]?.b64_json;
    if (!imageData) throw new Error('Failed to generate thumbnail');

    const buffer = Buffer.from(imageData, 'base64');
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
  }

  /**
   * Generate multiple thumbnail variations
   */
  async generateVariations(
    prompt: string,
    outputDir: string,
    count = 3,
  ): Promise<string[]> {
    const results: string[] = [];

    for (let i = 0; i < count; i++) {
      const outputPath = path.join(outputDir, `thumbnail_${i + 1}.png`);
      const result = await this.generate(
        `${prompt} (variation ${i + 1}, different angle/style)`,
        outputPath,
      );
      results.push(result);
    }

    return results;
  }
}
