import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export class TextToSpeechService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate speech from text using OpenAI TTS
   */
  async generateSpeech(
    text: string,
    outputPath: string,
    options: {
      voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
      model?: 'tts-1' | 'tts-1-hd';
      speed?: number;
    } = {},
  ): Promise<{ path: string; duration: number }> {
    const { voice = 'nova', model = 'tts-1-hd', speed = 1.0 } = options;

    const response = await this.openai.audio.speech.create({
      model,
      voice,
      input: text,
      speed,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, buffer);

    // Estimate duration (rough: ~150 words per minute at speed 1.0)
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 150) * 60 / speed;

    return { path: outputPath, duration: estimatedDuration };
  }

  /**
   * Generate speech for multiple segments (for subtitle sync)
   */
  async generateSegmentedSpeech(
    segments: { text: string; id: string }[],
    outputDir: string,
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova',
  ): Promise<{ id: string; path: string; duration: number }[]> {
    const results = [];

    for (const segment of segments) {
      const outputPath = path.join(outputDir, `${segment.id}.mp3`);
      const result = await this.generateSpeech(segment.text, outputPath, { voice });
      results.push({ id: segment.id, ...result });
    }

    return results;
  }
}
