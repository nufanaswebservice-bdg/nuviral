import { SubtitleConfig, SubtitleSegment, SubtitleStyle } from './types';

export class SubtitleEngine {
  /**
   * Generate ASS subtitle file from segments
   */
  generateAssFile(config: SubtitleConfig): string {
    const { style, segments } = config;

    let ass = this.getAssHeader(style);

    segments.forEach((segment, index) => {
      const startTime = this.formatAssTime(segment.startTime);
      const endTime = this.formatAssTime(segment.endTime);
      const text = this.applyAnimation(segment.text, style.animation);

      ass += `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${text}\n`;
    });

    return ass;
  }

  /**
   * Generate SRT subtitle file
   */
  generateSrtFile(segments: SubtitleSegment[]): string {
    return segments
      .map((segment, index) => {
        const start = this.formatSrtTime(segment.startTime);
        const end = this.formatSrtTime(segment.endTime);
        return `${index + 1}\n${start} --> ${end}\n${segment.text}\n`;
      })
      .join('\n');
  }

  /**
   * Generate word-by-word karaoke subtitles
   */
  generateKaraokeAss(segments: SubtitleSegment[]): string {
    let ass = this.getAssHeader({
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 'bold',
      color: '#FFFFFF',
      outlineColor: '#000000',
      outlineWidth: 3,
      position: 'bottom',
      animation: 'karaoke',
      marginBottom: 60,
    });

    segments.forEach((segment) => {
      if (segment.words) {
        const startTime = this.formatAssTime(segment.startTime);
        const endTime = this.formatAssTime(segment.endTime);

        let karaokeText = '';
        segment.words.forEach((word) => {
          const duration = Math.round((word.endTime - word.startTime) * 100);
          karaokeText += `{\\kf${duration}}${word.word} `;
        });

        ass += `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${karaokeText.trim()}\n`;
      }
    });

    return ass;
  }

  private getAssHeader(style: Partial<SubtitleStyle>): string {
    const alignment = style.position === 'top' ? 8 : style.position === 'center' ? 5 : 2;
    const marginV = style.marginBottom || 40;

    return `[Script Info]
Title: ViralAI Subtitles
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${style.fontFamily || 'Arial'},${style.fontSize || 48},&H00FFFFFF,&H000000FF,&H00000000,&H80000000,${style.fontWeight === 'bold' ? 1 : 0},0,0,0,100,100,0,0,1,${style.outlineWidth || 2},0,${alignment},20,20,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  }

  private applyAnimation(text: string, animation: string): string {
    switch (animation) {
      case 'fade':
        return `{\\fad(200,200)}${text}`;
      case 'typewriter':
        return `{\\fad(0,0)\\t(0,500,\\alpha&H00&)}${text}`;
      case 'bounce':
        return `{\\move(540,1800,540,1700)\\fad(100,100)}${text}`;
      case 'highlight':
        return `{\\3c&H7C3AED&\\bord4}${text}`;
      default:
        return text;
    }
  }

  private formatAssTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const cs = Math.floor((seconds % 1) * 100);
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  }

  private formatSrtTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }
}
