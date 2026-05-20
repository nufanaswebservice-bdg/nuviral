import ffmpeg from 'fluent-ffmpeg';
import { WatermarkConfig } from './types';

export class WatermarkEngine {
  /**
   * Add watermark to video
   */
  async addWatermark(
    videoPath: string,
    outputPath: string,
    config: WatermarkConfig,
  ): Promise<string> {
    if (!config.enabled) return videoPath;

    const position = this.getPositionFilter(config.position, config.size);

    return new Promise((resolve, reject) => {
      const command = ffmpeg(videoPath);

      if (config.imagePath) {
        command
          .input(config.imagePath)
          .complexFilter([
            `[1:v]scale=${config.size}:-1,format=rgba,colorchannelmixer=aa=${config.opacity}[wm]`,
            `[0:v][wm]overlay=${position}[out]`,
          ])
          .outputOptions(['-map', '[out]', '-map', '0:a?']);
      } else if (config.text) {
        command.videoFilter(
          `drawtext=text='${config.text}':fontsize=${config.size}:fontcolor=white@${config.opacity}:x=${this.getTextX(config.position)}:y=${this.getTextY(config.position)}`,
        );
      }

      command
        .videoCodec('libx264')
        .audioCodec('copy')
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(`Watermark failed: ${err.message}`)))
        .run();
    });
  }

  private getPositionFilter(position: string, size: number): string {
    const padding = 20;
    const positions: Record<string, string> = {
      'top-left': `${padding}:${padding}`,
      'top-right': `main_w-overlay_w-${padding}:${padding}`,
      'bottom-left': `${padding}:main_h-overlay_h-${padding}`,
      'bottom-right': `main_w-overlay_w-${padding}:main_h-overlay_h-${padding}`,
      'center': `(main_w-overlay_w)/2:(main_h-overlay_h)/2`,
    };
    return positions[position] || positions['bottom-right'];
  }

  private getTextX(position: string): string {
    if (position.includes('left')) return '20';
    if (position.includes('right')) return 'w-tw-20';
    return '(w-tw)/2';
  }

  private getTextY(position: string): string {
    if (position.includes('top')) return '20';
    if (position.includes('bottom')) return 'h-th-20';
    return '(h-th)/2';
  }
}
