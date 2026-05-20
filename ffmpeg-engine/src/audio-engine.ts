import ffmpeg from 'fluent-ffmpeg';

export class AudioEngine {
  /**
   * Mix voiceover with background music
   */
  async mixAudio(
    voiceoverPath: string,
    musicPath: string,
    outputPath: string,
    options: { voiceVolume?: number; musicVolume?: number; fadeIn?: number; fadeOut?: number } = {},
  ): Promise<string> {
    const { voiceVolume = 1.0, musicVolume = 0.15, fadeIn = 2, fadeOut = 3 } = options;

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(voiceoverPath)
        .input(musicPath)
        .complexFilter([
          `[0:a]volume=${voiceVolume}[voice]`,
          `[1:a]volume=${musicVolume},afade=t=in:st=0:d=${fadeIn},afade=t=out:st=0:d=${fadeOut}[music]`,
          `[voice][music]amix=inputs=2:duration=first:dropout_transition=3[out]`,
        ])
        .outputOptions(['-map', '[out]'])
        .audioCodec('aac')
        .audioBitrate('192k')
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(`Audio mix failed: ${err.message}`)))
        .run();
    });
  }

  /**
   * Normalize audio levels
   */
  async normalizeAudio(inputPath: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFilters('loudnorm=I=-16:TP=-1.5:LRA=11')
        .audioCodec('aac')
        .audioBitrate('192k')
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(`Normalize failed: ${err.message}`)))
        .run();
    });
  }

  /**
   * Add sound effect at specific timestamp
   */
  async addSoundEffect(
    videoPath: string,
    effectPath: string,
    outputPath: string,
    startTime: number,
    volume = 0.5,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(effectPath)
        .complexFilter([
          `[1:a]adelay=${startTime * 1000}|${startTime * 1000},volume=${volume}[effect]`,
          `[0:a][effect]amix=inputs=2:duration=first[out]`,
        ])
        .outputOptions(['-map', '0:v', '-map', '[out]'])
        .videoCodec('copy')
        .audioCodec('aac')
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(`Sound effect failed: ${err.message}`)))
        .run();
    });
  }

  /**
   * Extract audio from video
   */
  async extractAudio(videoPath: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('aac')
        .audioBitrate('192k')
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(`Extract failed: ${err.message}`)))
        .run();
    });
  }
}
