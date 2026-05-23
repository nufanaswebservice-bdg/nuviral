import { Controller, Post, Body, UseGuards, Req, UploadedFile, UploadedFiles, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { VisualAnalysisService } from '../services/visual-analysis.service';

const MAX_UPLOAD_IMAGES = 10;

@ApiTags('AI Visual Analysis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai/visual')
export class VisualAiController {
  constructor(private visualAnalysis: VisualAnalysisService) {}

  @Post('analyze-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Analyze uploaded image with AI Vision' })
  async analyzeImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }
    // In production, upload to S3/R2 and get URL
    const imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return this.visualAnalysis.analyzeImage(imageUrl);
  }

  @Post('analyze-images')
  @UseInterceptors(FilesInterceptor('images', MAX_UPLOAD_IMAGES))
  @ApiOperation({ summary: 'Analyze multiple images (max 10)' })
  async analyzeImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }
    if (files.length > MAX_UPLOAD_IMAGES) {
      throw new BadRequestException(
        `Too many images: ${files.length}. Maximum allowed is ${MAX_UPLOAD_IMAGES} per request.`,
      );
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        return this.visualAnalysis.analyzeImage(imageUrl);
      }),
    );
    return { analyses: results, count: results.length };
  }

  @Post('analyze-video-style')
  @UseInterceptors(FileInterceptor('video'))
  @ApiOperation({ summary: 'Analyze reference video style' })
  async analyzeVideoStyle(@UploadedFile() file: Express.Multer.File) {
    // In production: extract frames with FFmpeg, upload, analyze
    const frameUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64').slice(0, 1000)}`;
    return this.visualAnalysis.analyzeVideoStyle([frameUrl]);
  }

  @Post('generate-storyboard')
  @ApiOperation({ summary: 'Generate AI storyboard from script and references' })
  async generateStoryboard(@Body() body: {
    script: string;
    style: string;
    duration: number;
    imageRefs?: string[];
  }) {
    return this.visualAnalysis.generateStoryboard(body);
  }

  @Post('image-to-video')
  @UseInterceptors(FilesInterceptor('images', MAX_UPLOAD_IMAGES))
  @ApiOperation({ summary: 'Generate video from uploaded images (max 10)' })
  async imageToVideo(
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: {
      style: string;
      cameraMotion: string;
      duration: number;
      musicMood: string;
      subtitleStyle: string;
    },
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }
    if (files.length > MAX_UPLOAD_IMAGES) {
      throw new BadRequestException(
        `Too many images: ${files.length}. Maximum allowed is ${MAX_UPLOAD_IMAGES} per request.`,
      );
    }

    // In production: queue video generation job
    return {
      jobId: `render_${Date.now()}`,
      status: 'queued',
      message: 'Video generation started',
      settings: body,
      imageCount: files.length,
      estimatedTime: '2-5 minutes',
    };
  }

  @Post('clone-style')
  @ApiOperation({ summary: 'Clone style from reference video' })
  async cloneStyle(@Body() body: {
    referenceVideoId: string;
    scriptId: string;
    settings: Record<string, any>;
  }) {
    return {
      jobId: `style_${Date.now()}`,
      status: 'queued',
      message: 'Style cloning started',
      steps: [
        'Analyzing reference style',
        'Extracting transitions',
        'Matching color grading',
        'Applying pacing',
        'Generating video',
      ],
    };
  }
}
