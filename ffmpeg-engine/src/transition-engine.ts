import ffmpeg from 'fluent-ffmpeg';
import { TransitionConfig } from './types';

export class TransitionEngine {
  /**
   * Apply transition between two clips
   */
  async applyTransition(
    clip1Path: string,
    clip2Path: string,
    outputPath: string,
    transition: TransitionConfig,
  ): Promise<string> {
    const filterMap: Record<string, string> = {
      fade: `xfade=transition=fade:duration=${transition.duration}:offset=${transition.atTime}`,
      slide_left: `xfade=transition=slideleft:duration=${transition.duration}:offset=${transition.atTime}`,
      slide_right: `xfade=transition=slideright:duration=${transition.duration}:offset=${transition.atTime}`,
      zoom: `xfade=transition=zoomin:duration=${transition.duration}:offset=${transition.atTime}`,
      dissolve: `xfade=transition=dissolve:duration=${transition.duration}:offset=${transition.atTime}`,
      wipe: `xfade=transition=wipeleft:duration=${transition.duration}:offset=${transition.atTime}`,
    };

    const filter = filterMap[transition.type] || filterMap.fade;

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(clip1Path)
        .input(clip2Path)
        .complexFilter([
          `[0:v][1:v]${filter}[v]`,
          `[0:a][1:a]acrossfade=d=${transition.duration}[a]`,
        ])
        .outputOptions(['-map', '[v]', '-map', '[a]'])
        .videoCodec('libx264')
        .audioCodec('aac')
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(`Transition failed: ${err.message}`)))
        .run();
    });
  }

  /**
   * Apply Ken Burns effect (zoom/pan) to image
   */
  async applyKenBurns(
    imagePath: string,
    outputPath: string,
    duration: number,
    effect: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right' = 'zoom_in',
  ): Promise<string> {
    const effects: Record<string, string> = {
      zoom_in: `zoompan=z='min(zoom+0.001,1.5)':d=${duration * 25}:s=1080x1920:fps=25`,
      zoom_out: `zoompan=z='if(lte(zoom,1.0),1.5,max(1.001,zoom-0.001))':d=${duration * 25}:s=1080x1920:fps=25`,
      pan_left: `zoompan=z=1.2:x='iw/2-(iw/zoom/2)+((iw/zoom)*on/${duration * 25})':d=${duration * 25}:s=1080x1920:fps=25`,
      pan_right: `zoompan=z=1.2:x='iw/2-(iw/zoom/2)-((iw/zoom)*on/${duration * 25})':d=${duration * 25}:s=1080x1920:fps=25`,
    };

    return new Promise((resolve, reject) => {
      ffmpeg(imagePath)
        .loop(duration)
        .videoFilter(effects[effect])
        .duration(duration)
        .videoCodec('libx264')
        .outputOptions(['-pix_fmt', 'yuv420p'])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(`Ken Burns failed: ${err.message}`)))
        .run();
    });
  }
}
