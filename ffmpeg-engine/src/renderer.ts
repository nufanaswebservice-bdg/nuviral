import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { RenderConfig, RenderProgress } from './types';

export class VideoRenderer {
  private ffmpegPath: string;

  constructor(ffmpegPath?: string) {
    this.ffmpegPath = ffmpegPath || process.env.FFMPEG_PATH || 'ffmpeg';
    ffmpeg.setFfmpegPath(this.ffmpegPath);
  }

  async render(
    config: RenderConfig,
    onProgress?: (progress: RenderProgress) => void,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      // Add input clips
      config.clips.forEach((clip) => {
        command.input(clip.path);
      });

      // Video settings
      command
        .size(`${config.width}x${config.height}`)
        .fps(config.fps)
        .format(config.format)
        .videoCodec('libx264')
        .outputOptions([
          '-preset', this.getPreset(config.quality),
          '-crf', this.getCrf(config.quality).toString(),
          '-pix_fmt', 'yuv420p',
          '-movflags', '+faststart',
        ]);

      // Audio settings
      if (config.audio?.voiceover) {
        command.input(config.audio.voiceover.path);
      }
      if (config.audio?.backgroundMusic) {
        command.input(config.audio.backgroundMusic.path);
      }

      command.audioCodec('aac').audioBitrate('192k');

      // Progress tracking
      command.on('progress', (progress) => {
        if (onProgress) {
          onProgress({
            percent: progress.percent || 0,
            currentFrame: progress.frames || 0,
            totalFrames: config.fps * config.duration,
            fps: progress.currentFps || 0,
            eta: 0,
          });
        }
      });

      // Output
      command
        .output(config.outputPath)
        .on('end', () => resolve(config.outputPath))
        .on('error', (err) => reject(new Error(`Render failed: ${err.message}`)))
        .run();
    });
  }

  async generateThumbnail(videoPath: string, outputPath: string, timestamp = '00:00:01'): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '1080x1920',
        })
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(`Thumbnail failed: ${err.message}`)));
    });
  }

  async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) return reject(err);
        resolve(metadata.format.duration || 0);
      });
    });
  }

  async concatenateClips(clips: string[], outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      clips.forEach((clip) => command.input(clip));

      command
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(`Concatenation failed: ${err.message}`)))
        .mergeToFile(outputPath, '/tmp');
    });
  }

  private getPreset(quality: string): string {
    const presets: Record<string, string> = {
      low: 'ultrafast',
      medium: 'medium',
      high: 'slow',
      ultra: 'veryslow',
    };
    return presets[quality] || 'medium';
  }

  private getCrf(quality: string): number {
    const crfs: Record<string, number> = {
      low: 28,
      medium: 23,
      high: 18,
      ultra: 15,
    };
    return crfs[quality] || 23;
  }
}
