import OpenAI from 'openai';
import fs from 'fs';

export interface TranscriptionSegment {
  text: string;
  startTime: number;
  endTime: number;
  words?: { word: string; start: number; end: number }[];
}

export class WhisperService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Transcribe audio file with word-level timestamps
   */
  async transcribe(
    audioPath: string,
    options: { language?: string; prompt?: string } = {},
  ): Promise<TranscriptionSegment[]> {
    const file = fs.createReadStream(audioPath);

    const response = await this.openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word', 'segment'],
      language: options.language,
      prompt: options.prompt,
    });

    // Parse segments with word timings
    const segments: TranscriptionSegment[] = (response as any).segments?.map((seg: any) => ({
      text: seg.text.trim(),
      startTime: seg.start,
      endTime: seg.end,
      words: (response as any).words
        ?.filter((w: any) => w.start >= seg.start && w.end <= seg.end)
        ?.map((w: any) => ({
          word: w.word,
          start: w.start,
          end: w.end,
        })),
    })) || [];

    return segments;
  }

  /**
   * Translate audio to English
   */
  async translate(audioPath: string): Promise<TranscriptionSegment[]> {
    const file = fs.createReadStream(audioPath);

    const response = await this.openai.audio.translations.create({
      file,
      model: 'whisper-1',
      response_format: 'verbose_json',
    });

    return (response as any).segments?.map((seg: any) => ({
      text: seg.text.trim(),
      startTime: seg.start,
      endTime: seg.end,
    })) || [];
  }
}
