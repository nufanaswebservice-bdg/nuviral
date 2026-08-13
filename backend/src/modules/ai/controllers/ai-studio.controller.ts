import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FlexibleAuthGuard } from '../../auth/guards/flexible-auth.guard';
import { AiStudioService } from '../services/ai-studio.service';

@ApiTags('AI Studio')
@ApiBearerAuth()
@UseGuards(FlexibleAuthGuard)
@Controller('ai')
export class AiStudioController {
  constructor(private aiStudioService: AiStudioService) {}

  @Post('chat')
  @ApiOperation({ summary: 'AI Chat Assistant' })
  async chat(
    @Body() body: { message: string; history?: { role: string; content: string }[] },
  ) {
    return this.aiStudioService.chat(body.message, body.history || []);
  }

  @Post('generate-image')
  @ApiOperation({ summary: 'Generate image with AI' })
  async generateImage(
    @Body() body: { prompt: string; aspect_ratio?: string; style?: string },
  ) {
    return this.aiStudioService.generateImage(
      body.prompt,
      body.aspect_ratio,
      body.style,
    );
  }

  @Post('text-to-speech')
  @ApiOperation({ summary: 'Text to speech' })
  async textToSpeech(@Body() body: { text: string; voice?: string }) {
    return this.aiStudioService.textToSpeech(body.text, body.voice);
  }

  @Post('generate-music')
  @ApiOperation({ summary: 'Generate music with AI' })
  async generateMusic(@Body() body: { prompt: string; duration?: number }) {
    return this.aiStudioService.generateMusic(body.prompt, body.duration);
  }

  @Post('generate-sfx')
  @ApiOperation({ summary: 'Generate sound effects' })
  async generateSfx(@Body() body: { prompt: string; duration?: number }) {
    return this.aiStudioService.generateSfx(body.prompt, body.duration);
  }

  @Post('voice-clone')
  @ApiOperation({ summary: 'Clone voice from audio sample' })
  async voiceClone(@Body() body: { text: string; audioBase64: string }) {
    return this.aiStudioService.voiceClone(body.text, body.audioBase64);
  }

  @Post('image-to-video')
  @ApiOperation({ summary: 'Generate video from image' })
  async imageToVideo(
    @Body()
    body: { imageBase64: string; prompt?: string; duration?: string },
  ) {
    return this.aiStudioService.imageToVideo(
      body.imageBase64,
      body.prompt,
      body.duration,
    );
  }

  @Post('generate-3d')
  @ApiOperation({ summary: 'Generate 3D model' })
  async generate3d(
    @Body() body: { prompt?: string; imageBase64?: string },
  ) {
    return this.aiStudioService.generate3d(body.prompt, body.imageBase64);
  }
}
