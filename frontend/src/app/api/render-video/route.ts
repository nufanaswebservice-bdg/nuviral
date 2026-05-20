import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

function getFFmpegPath(): string {
  // Search in WinGet packages
  const wingetDir = path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages');
  if (fs.existsSync(wingetDir)) {
    const dirs = fs.readdirSync(wingetDir).filter(d => d.toLowerCase().includes('ffmpeg'));
    for (const dir of dirs) {
      const binPath = path.join(wingetDir, dir);
      const found = findFile(binPath, 'ffmpeg.exe');
      if (found) return found;
    }
  }
  // Fallback
  return 'ffmpeg';
}

function findFile(dir: string, name: string): string | null {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        const found = findFile(full, name);
        if (found) return found;
      } else if (item === name) {
        return full;
      }
    }
  } catch (e) {}
  return null;
}

// Escape text for FFmpeg drawtext filter
function escapeFFmpeg(text: string): string {
  return text
    .replace(/\\/g, '\\\\\\\\')
    .replace(/'/g, "\\'")
    .replace(/:/g, '\\:')
    .replace(/%/g, '%%')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title = 'ViralAI Video',
      script = '',
      duration = 15,
      bgColor = '0x0f0a2e',
      accentColor = '0x7c3aed',
    } = body;

    const ffmpeg = getFFmpegPath();
    console.log('[render] FFmpeg:', ffmpeg);

    // Output
    const outputDir = path.join(process.cwd(), 'public', 'renders');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const filename = `viralai-${Date.now()}.mp4`;
    const outputFile = path.join(outputDir, filename);

    // Parse script into sentences
    const sentences = script
      ? script.split(/[.!?\n]+/).filter((s: string) => s.trim().length > 2)
      : ['Your AI video will appear here'];

    const segDuration = duration / Math.max(sentences.length, 1);

    // Build FFmpeg drawtext filters for subtitles
    let textFilters = '';

    // Title (always visible at top)
    const safeTitle = escapeFFmpeg(title);
    textFilters += `,drawtext=text='${safeTitle}':fontsize=52:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=120:fontfile='C\\:/Windows/Fonts/arialbd.ttf'`;

    // "ViralAI" branding
    textFilters += `,drawtext=text='ViralAI':fontsize=22:fontcolor=0x7c3aed:borderw=1:bordercolor=black:x=(w-text_w)/2:y=200:fontfile='C\\:/Windows/Fonts/arial.ttf'`;

    // Subtitle sentences (appear one by one)
    sentences.forEach((sentence: string, i: number) => {
      const start = (i * segDuration).toFixed(2);
      const end = ((i + 1) * segDuration).toFixed(2);
      const text = escapeFFmpeg(sentence.trim());

      // Main subtitle (center-bottom area)
      textFilters += `,drawtext=text='${text}':fontsize=38:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-400:fontfile='C\\:/Windows/Fonts/arialbd.ttf':enable='between(t,${start},${end})'`;

      // Counter (top-left)
      textFilters += `,drawtext=text='${i + 1}/${sentences.length}':fontsize=20:fontcolor=0xaaaaaa:x=50:y=50:fontfile='C\\:/Windows/Fonts/arial.ttf':enable='between(t,${start},${end})'`;
    });

    // Progress bar at bottom
    textFilters += `,drawbox=x=0:y=1880:w='iw*t/${duration}':h=8:color=${accentColor}@0.9:t=fill`;

    // CTA at very bottom
    textFilters += `,drawtext=text='Follow for more':fontsize=26:fontcolor=0xcccccc:borderw=1:bordercolor=black:x=(w-text_w)/2:y=1820:fontfile='C\\:/Windows/Fonts/arial.ttf'`;

    // Full FFmpeg command
    const cmd = [
      `"${ffmpeg}" -y`,
      // Animated gradient background
      `-f lavfi -i "color=c=${bgColor}:s=1080x1920:d=${duration}:r=24,format=yuv420p"`,
      // Ambient audio (chord pad)
      `-f lavfi -i "sine=f=174:d=${duration},volume=0.02[s1];sine=f=220:d=${duration},volume=0.015[s2];[s1][s2]amix=inputs=2,lowpass=f=400"`,
      // Apply text overlays
      `-filter_complex "[0:v]vignette=PI/4${textFilters}[v]"`,
      `-map "[v]" -map 1:a`,
      `-c:v libx264 -preset ultrafast -crf 26 -pix_fmt yuv420p`,
      `-c:a aac -b:a 96k`,
      `-t ${duration} -movflags +faststart`,
      `"${outputFile}"`,
    ].join(' ');

    console.log('[render] Starting render...');
    execSync(cmd, { stdio: 'pipe', timeout: 45000 });
    console.log('[render] Done!');

    const videoBuffer = fs.readFileSync(outputFile);

    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': videoBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('[render] ERROR:', error.message);
    // Return error details for debugging
    return NextResponse.json(
      { error: 'Render failed', detail: error.message?.substring(0, 500) },
      { status: 500 }
    );
  }
}
