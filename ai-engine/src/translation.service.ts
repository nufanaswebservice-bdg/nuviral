import OpenAI from 'openai';

export class TranslationService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Translate content to target language
   */
  async translate(
    text: string,
    targetLanguage: string,
    options: { preserveFormatting?: boolean; context?: string } = {},
  ): Promise<{ translated: string; language: string }> {
    const prompt = `Translate the following text to ${targetLanguage}. 
${options.preserveFormatting ? 'Preserve all formatting, timestamps, and special characters.' : ''}
${options.context ? `Context: ${options.context}` : ''}

Text to translate:
${text}

Return only the translated text, nothing else.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const translated = response.choices[0]?.message?.content || '';

    return { translated: translated.trim(), language: targetLanguage };
  }

  /**
   * Translate subtitle segments
   */
  async translateSubtitles(
    segments: { text: string; startTime: number; endTime: number }[],
    targetLanguage: string,
  ): Promise<{ text: string; startTime: number; endTime: number }[]> {
    const textsToTranslate = segments.map((s) => s.text).join('\n---\n');

    const { translated } = await this.translate(textsToTranslate, targetLanguage, {
      preserveFormatting: true,
      context: 'These are video subtitle segments separated by ---',
    });

    const translatedTexts = translated.split('\n---\n');

    return segments.map((segment, index) => ({
      ...segment,
      text: translatedTexts[index]?.trim() || segment.text,
    }));
  }

  /**
   * Detect language of text
   */
  async detectLanguage(text: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{
        role: 'user',
        content: `Detect the language of this text and return only the language name in English: "${text.substring(0, 200)}"`,
      }],
      max_tokens: 50,
      temperature: 0,
    });

    return response.choices[0]?.message?.content?.trim() || 'Unknown';
  }
}
