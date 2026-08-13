import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { CloudflareR2Service } from '../../media/cloudflare-r2.service';

interface ChatMessage {
  role: string;
  content: string;
}

@Injectable()
export class AiStudioService {
  private readonly logger = new Logger(AiStudioService.name);
  private openai: OpenAI | null = null;

  constructor(
    private configService: ConfigService,
    private r2Service: CloudflareR2Service,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  private get falKey(): string {
    return (
      this.configService.get<string>('FAL_KEY') ||
      this.configService.get<string>('FAL_API_KEY') ||
      ''
    );
  }

  private get openaiKey(): string {
    return (
      this.configService.get<string>('OPENAI_API_KEY') ||
      this.configService.get<string>('OPENAI_KEY') ||
      ''
    );
  }

  private get replicateToken(): string {
    return (
      this.configService.get<string>('REPLICATE_API_TOKEN') ||
      this.configService.get<string>('REPLICATE_TOKEN') ||
      ''
    );
  }

  private get openaiModel(): string {
    return this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
  }

  private ensureOpenAiConfigured() {
    if (!this.openaiKey) {
      throw new InternalServerErrorException(
        'OpenAI belum dikonfigurasi. Hubungi admin.',
      );
    }
  }

  private ensureAiConfigured() {
    if (!this.falKey && !this.openaiKey) {
      throw new InternalServerErrorException(
        'AI belum dikonfigurasi. Hubungi admin.',
      );
    }
  }

  private buildSystemPrompt(): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    });

    return `Kamu adalah Lumora AI — asisten AI cerdas yang bisa menjawab semua pertanyaan, seperti ChatGPT.

## INFO REAL-TIME
- Hari ini: ${dateStr}
- Waktu sekarang: ${timeStr} WIB
- Tahun: ${now.getFullYear()}

## ATURAN UTAMA
1. Kamu HARUS menjawab pertanyaan user secara LANGSUNG dan RELEVAN
2. JANGAN mengalihkan topik ke hal lain — jawab apa yang ditanya
3. Jika user bertanya tentang tanggal/waktu, gunakan info real-time di atas
4. Jawab dalam bahasa yang SAMA dengan pertanyaan user
5. Berikan informasi yang AKURAT dan DETAIL
6. Gunakan format yang rapi (bullet points, numbering) jika perlu`;
  }

  private async falLLM(
    systemPrompt: string,
    userMessage: string,
    history: ChatMessage[] = [],
    maxTokens = 2000,
  ): Promise<string> {
    if (!this.falKey) throw new Error('FAL_KEY not set');

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10).map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: userMessage },
    ];

    const models = [
      'meta-llama/llama-4-maverick',
      'google/gemini-flash-2.0',
      'meta-llama/llama-3.3-70b-instruct',
    ];

    for (const model of models) {
      try {
        const res = await fetch('https://fal.run/fal-ai/any-llm', {
          method: 'POST',
          headers: {
            Authorization: `Key ${this.falKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
        });

        if (res.ok) {
          const data = await res.json();
          const output =
            data.output || data.choices?.[0]?.message?.content || '';
          if (output && output.length > 10) {
            this.logger.log(`fal.ai ${model} success`);
            return output;
          }
        }
      } catch (e: any) {
        this.logger.warn(`fal.ai ${model} error: ${e.message}`);
      }
    }

    throw new Error('All fal.ai LLM models failed');
  }

  async chat(message: string, history: ChatMessage[] = []) {
    if (!message?.trim()) {
      throw new BadRequestException('message required');
    }
    this.ensureOpenAiConfigured();

    const systemPrompt = this.buildSystemPrompt();
    const model = this.openaiModel;

    try {
      const completion = await this.openai!.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(-10).map((h) => ({
            role: h.role as 'user' | 'assistant' | 'system',
            content: h.content,
          })),
          { role: 'user', content: message },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content;
      if (!reply) {
        throw new InternalServerErrorException('OpenAI tidak memberikan respons');
      }

      const suggestions = await this.generateSuggestions(message, reply);
      return { reply, suggestions };
    } catch (e: any) {
      this.logger.error(`OpenAI chat error: ${e.message}`);
      throw new InternalServerErrorException(
        e.message || 'AI chat gagal — coba lagi nanti',
      );
    }
  }

  private async generateSuggestions(
    message: string,
    reply: string,
  ): Promise<string[]> {
    const sugPrompt = `Based on this conversation:
User asked: "${message}"
You replied: "${reply.substring(0, 500)}"

Generate exactly 3 follow-up questions that the user would naturally want to ask next.
Return ONLY a JSON array of 3 strings in the same language as the user's message.
Example: ["question 1", "question 2", "question 3"]`;

    try {
      if (!this.openai) return [];

      const completion = await this.openai.chat.completions.create({
        model: this.openaiModel,
        messages: [{ role: 'user', content: sugPrompt }],
        max_tokens: 200,
      });

      const sugResult = completion.choices[0]?.message?.content || '';
      if (sugResult) {
        const match = sugResult.match(/\[[\s\S]*?\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) return parsed.slice(0, 3);
        }
      }
    } catch (e: any) {
      this.logger.warn(`Suggestions generation failed: ${e.message}`);
    }

    return [];
  }

  async generateImage(
    prompt: string,
    aspectRatio = '9:16',
    style = '',
  ): Promise<{ imageUrl: string }> {
    if (!prompt?.trim()) throw new BadRequestException('prompt required');
    if (!this.falKey && !this.replicateToken) {
      throw new InternalServerErrorException('AI not configured');
    }

    let enhancedPrompt = style ? `${prompt}, ${style}` : prompt;

    if (this.falKey) {
      try {
        const enhanced = await this.falLLM(
          'Convert the user prompt into a detailed photorealistic image generation prompt in English. Output ONLY the prompt.',
          prompt,
          [],
          300,
        );
        if (enhanced?.length > 20) {
          enhancedPrompt = style ? `${enhanced.trim()}, ${style}` : enhanced.trim();
        }
      } catch {}
    }

    const imageSize =
      aspectRatio === '9:16'
        ? 'portrait_4_3'
        : aspectRatio === '1:1'
          ? 'square_hd'
          : 'landscape_4_3';

    if (this.falKey) {
      const models = [
        {
          id: 'fal-ai/flux-pro/v1.1-ultra',
          input: {
            prompt: enhancedPrompt,
            aspect_ratio: aspectRatio === '9:16' ? '9:16' : '16:9',
            num_images: 1,
            output_format: 'jpeg',
            safety_tolerance: '5',
          },
        },
        {
          id: 'fal-ai/flux-pro/v1.1',
          input: {
            prompt: enhancedPrompt,
            image_size: imageSize,
            num_images: 1,
            output_format: 'jpeg',
          },
        },
        {
          id: 'fal-ai/flux/dev',
          input: {
            prompt: enhancedPrompt,
            image_size: imageSize,
            num_inference_steps: 28,
            guidance_scale: 3.5,
            num_images: 1,
            output_format: 'jpeg',
          },
        },
      ];

      for (const model of models) {
        try {
          const res = await fetch(`https://fal.run/${model.id}`, {
            method: 'POST',
            headers: {
              Authorization: `Key ${this.falKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(model.input),
          });
          if (res.ok) {
            const data = await res.json();
            const imageUrl =
              data.images?.[0]?.url || data.image?.url || data.output?.[0];
            if (imageUrl) return { imageUrl };
          }
        } catch (e: any) {
          this.logger.warn(`Image model ${model.id} failed: ${e.message}`);
        }
      }
    }

    throw new InternalServerErrorException('Image generation failed');
  }

  async textToSpeech(
    text: string,
    voice = 'nova',
  ): Promise<{ audioUrl: string }> {
    if (!text?.trim()) throw new BadRequestException('text required');

    if (this.openaiKey) {
      const tts = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1-hd',
          voice,
          input: text.substring(0, 4096),
          speed: 0.95,
        }),
      });

      if (tts.ok) {
        const audioBuffer = Buffer.from(await tts.arrayBuffer());
        try {
          const { url } = await this.r2Service.uploadBuffer(
            audioBuffer,
            'tts.mp3',
            'audio/mpeg',
            'audio',
          );
          return { audioUrl: url };
        } catch {
          return {
            audioUrl: `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`,
          };
        }
      }
    }

    if (this.falKey) {
      const falRes = await fetch('https://fal.run/fal-ai/playht/tts/v3', {
        method: 'POST',
        headers: {
          Authorization: `Key ${this.falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: text.substring(0, 2000) }),
      });
      if (falRes.ok) {
        const data = await falRes.json();
        const audioUrl = data.audio?.url || data.audio_url;
        if (audioUrl) return { audioUrl };
      }
    }

    throw new InternalServerErrorException('TTS not available');
  }

  async generateMusic(
    prompt: string,
    duration = 30,
  ): Promise<{ audioUrl: string }> {
    if (!prompt?.trim()) throw new BadRequestException('prompt required');
    if (!this.falKey) throw new InternalServerErrorException('AI not configured');

    const submitRes = await fetch(
      'https://queue.fal.run/fal-ai/minimax-music/v2',
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${this.falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, duration: Number(duration) }),
      },
    );
    if (!submitRes.ok) throw new InternalServerErrorException('Submit failed');

    const { request_id } = await submitRes.json();
    const audioUrl = await this.pollFalQueue(
      'fal-ai/minimax-music/v2',
      request_id,
      300000,
      (result) => result.audio?.url || result.output?.url,
    );
    return { audioUrl };
  }

  async generateSfx(
    prompt: string,
    duration = 10,
  ): Promise<{ audioUrl: string }> {
    if (!prompt?.trim()) throw new BadRequestException('prompt required');
    if (!this.falKey) throw new InternalServerErrorException('AI not configured');

    const falRes = await fetch(
      'https://fal.run/fal-ai/elevenlabs/sound-effects/v2',
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${this.falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: prompt,
          duration_seconds: Number(duration),
        }),
      },
    );

    if (!falRes.ok) {
      const fallbackRes = await fetch(
        'https://fal.run/cassetteai/sound-effects-generator',
        {
          method: 'POST',
          headers: {
            Authorization: `Key ${this.falKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, duration: Number(duration) }),
        },
      );
      if (!fallbackRes.ok) {
        throw new InternalServerErrorException('SFX generation failed');
      }
      const data = await fallbackRes.json();
      return { audioUrl: data.audio?.url || data.audio_file?.url };
    }

    const data = await falRes.json();
    const audioUrl = data.audio?.url || data.audio_file?.url;
    if (!audioUrl) throw new InternalServerErrorException('No audio URL');
    return { audioUrl };
  }

  async voiceClone(
    text: string,
    audioBase64: string,
  ): Promise<{ audioUrl: string }> {
    if (!text || !audioBase64) {
      throw new BadRequestException('text and audioBase64 required');
    }
    if (!this.falKey) throw new InternalServerErrorException('AI not configured');

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const { url: audioUrl } = await this.r2Service.uploadBuffer(
      audioBuffer,
      'voice-sample.wav',
      'audio/wav',
      'temp',
    );

    const falRes = await fetch('https://fal.run/fal-ai/zonos', {
      method: 'POST',
      headers: {
        Authorization: `Key ${this.falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, audio_url: audioUrl }),
    });

    if (!falRes.ok) {
      const f5Res = await fetch('https://fal.run/fal-ai/f5-tts', {
        method: 'POST',
        headers: {
          Authorization: `Key ${this.falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gen_text: text, ref_audio_url: audioUrl }),
      });
      if (!f5Res.ok) {
        throw new InternalServerErrorException('Voice clone failed');
      }
      const data = await f5Res.json();
      return { audioUrl: data.audio_url?.url || data.audio?.url };
    }

    const data = await falRes.json();
    const resultUrl = data.audio?.url || data.audio_url;
    if (!resultUrl) throw new InternalServerErrorException('No audio URL');
    return { audioUrl: resultUrl };
  }

  async imageToVideo(
    imageBase64: string,
    prompt = 'smooth cinematic motion',
    duration = '5',
  ): Promise<{ videoUrl: string }> {
    if (!imageBase64) throw new BadRequestException('imageBase64 required');
    if (!this.falKey) throw new InternalServerErrorException('AI not configured');

    const imgBuffer = Buffer.from(imageBase64, 'base64');
    const { url: imageUrl } = await this.r2Service.uploadBuffer(
      imgBuffer,
      'input.jpg',
      'image/jpeg',
      'temp',
    );

    const submitRes = await fetch(
      'https://queue.fal.run/fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${this.falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url: imageUrl, prompt, duration }),
      },
    );
    if (!submitRes.ok) throw new InternalServerErrorException('Submit failed');

    const { request_id } = await submitRes.json();
    const videoUrl = await this.pollFalQueue(
      'fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
      request_id,
      600000,
      (result) => result.video?.url || result.output?.url,
    );
    return { videoUrl };
  }

  async generate3d(
    prompt?: string,
    imageBase64?: string,
  ): Promise<{ modelUrl?: string; videoUrl?: string }> {
    if (!prompt && !imageBase64) {
      throw new BadRequestException('prompt or imageBase64 required');
    }
    if (!this.falKey) throw new InternalServerErrorException('AI not configured');

    let input: Record<string, string> = {};
    if (imageBase64) {
      const imgBuffer = Buffer.from(imageBase64, 'base64');
      const { url: imageUrl } = await this.r2Service.uploadBuffer(
        imgBuffer,
        '3d-input.jpg',
        'image/jpeg',
        'temp',
      );
      input = { image_url: imageUrl };
    } else {
      input = { prompt: prompt! };
    }

    const submitRes = await fetch(
      'https://queue.fal.run/fal-ai/hunyuan3d-v2',
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${this.falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      },
    );
    if (!submitRes.ok) throw new InternalServerErrorException('Submit failed');

    const { request_id } = await submitRes.json();
    const result = await this.pollFalQueueRaw(
      'fal-ai/hunyuan3d-v2',
      request_id,
      300000,
    );

    return {
      modelUrl:
        result.model_mesh?.url || result.glb?.url || result.output?.url,
      videoUrl: result.video?.url,
    };
  }

  private async pollFalQueue(
    modelPath: string,
    requestId: string,
    maxWait: number,
    extract: (result: any) => string | undefined,
  ): Promise<string> {
    const result = await this.pollFalQueueRaw(modelPath, requestId, maxWait);
    const url = extract(result);
    if (!url) throw new InternalServerErrorException('No result URL');
    return url;
  }

  private async pollFalQueueRaw(
    modelPath: string,
    requestId: string,
    maxWait: number,
  ): Promise<any> {
    let status = 'IN_QUEUE';
    const t0 = Date.now();

    while (status !== 'COMPLETED' && status !== 'FAILED') {
      if (Date.now() - t0 > maxWait) {
        throw new InternalServerErrorException('Timeout');
      }
      await new Promise((r) => setTimeout(r, 5000));

      const sr = await fetch(
        `https://queue.fal.run/${modelPath}/requests/${requestId}/status`,
        { headers: { Authorization: `Key ${this.falKey}` } },
      );
      if (sr.ok) {
        const d = await sr.json();
        status = d.status;
      }
    }

    if (status === 'FAILED') {
      throw new InternalServerErrorException('Generation failed');
    }

    const resultRes = await fetch(
      `https://queue.fal.run/${modelPath}/requests/${requestId}`,
      { headers: { Authorization: `Key ${this.falKey}` } },
    );
    return resultRes.json();
  }
}
