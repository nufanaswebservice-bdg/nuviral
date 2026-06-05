import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

function getFFmpegPath(): string {
  const wingetDir = path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages');
  if (fs.existsSync(wingetDir)) {
    const dirs = fs.readdirSync(wingetDir).filter(d => d.toLowerCase().includes('ffmpeg'));
    for (const dir of dirs) {
      const found = findFile(path.join(wingetDir, dir), 'ffmpeg.exe');
      if (found) return found;
    }
  }
  return 'ffmpeg';
}

function findFile(dir: string, name: string): string | null {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) { const f = findFile(full, name); if (f) return f; }
      else if (item === name) return full;
    }
  } catch (e) {}
  return null;
}

function escapeFFmpeg(text: string): string {
  return text.replace(/\\/g, '\\\\\\\\').replace(/'/g, "\\'").replace(/:/g, '\\:').replace(/%/g, '%%').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title = 'NuViral Video', script = '', duration = 15, useVoiceover = true } = body;

    const ffmpeg = getFFmpegPath();
    const outputDir = path.join(process.cwd(), 'public', 'renders');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const filename = `nuviral-${Date.now()}.mp4`;
    const outputFile = path.join(outputDir, filename);
    const audioFile = path.join(outputDir, `audio-${Date.now()}.mp3`);

    let actualDuration = duration;

    // Step 1: Generate AI Voiceover with OpenAI TTS
    if (useVoiceover && script.trim()) {
      console.log('[render] Generating AI voiceover...');
      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: 'nova',
          input: script,
          speed: 1.0,
        }),
      });

      if (!ttsResponse.ok) {
        const err = await ttsResponse.text();
        console.error('[render] TTS error:', err);
        throw new Error('TTS generation failed');
      }

      const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
      fs.writeFileSync(audioFile, audioBuffer);
      console.log(`[render] Voiceover saved: ${(audioBuffer.length / 1024).toFixed(0)} KB`);

      // Get audio duration
      const durationOutput = execSync(`"${ffmpeg}" -i "${audioFile}" 2>&1 | findstr Duration`, { encoding: 'utf-8', shell: 'cmd' }).trim();
      const match = durationOutput.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
      if (match) {
        actualDuration = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);
      }
    }

    // Step 2: Build subtitle filters
    const sentences = script ? script.split(/[.\n!?]+/).filter((s: string) => s.trim().length > 2) : [];
    const segDuration = actualDuration / Math.max(sentences.length, 1);

    let textFilters = '';
    const safeTitle = escapeFFmpeg(title);
    textFilters += `,drawtext=text='${safeTitle}':fontsize=48:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=100:fontfile='C\\:/Windows/Fonts/arialbd.ttf'`;
    textFilters += `,drawtext=text='NuNuViral':fontsize=20:fontcolor=0x7c3aed:borderw=1:bordercolor=black:x=(w-text_w)/2:y=170:fontfile='C\\:/Windows/Fonts/arial.ttf'`;

    sentences.forEach((sentence: string, i: number) => {
      const start = (i * segDuration).toFixed(2);
      const end = ((i + 1) * segDuration).toFixed(2);
      const text = escapeFFmpeg(sentence.trim());
      textFilters += `,drawtext=text='${text}':fontsize=36:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-350:fontfile='C\\:/Windows/Fonts/arialbd.ttf':enable='between(t,${start},${end})'`;
    });

    textFilters += `,drawbox=x=0:y=1880:w='iw*t/${actualDuration}':h=6:color=0x7c3aed@0.9:t=fill`;

    // Step 3: Render video with FFmpeg
    console.log('[render] Rendering video...');
    let cmd: string;

    if (fs.existsSync(audioFile)) {
      // With voiceover audio
      cmd = `"${ffmpeg}" -y -f lavfi -i "color=c=0x0f0a2e:s=1080x1920:d=${Math.ceil(actualDuration)}:r=24,format=yuv420p" -i "${audioFile}" -filter_complex "[0:v]vignette=PI/4${textFilters}[v]" -map "[v]" -map 1:a -c:v libx264 -preset ultrafast -crf 26 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart "${outputFile}"`;
    } else {
      // Without voiceover (ambient only)
      cmd = `"${ffmpeg}" -y -f lavfi -i "color=c=0x0f0a2e:s=1080x1920:d=${duration}:r=24,format=yuv420p" -f lavfi -i "sine=f=220:d=${duration},volume=0.03" -filter_complex "[0:v]vignette=PI/4${textFilters}[v]" -map "[v]" -map 1:a -c:v libx264 -preset ultrafast -crf 26 -pix_fmt yuv420p -c:a aac -b:a 96k -t ${duration} -movflags +faststart "${outputFile}"`;
    }

    execSync(cmd, { stdio: 'pipe', timeout: 60000 });
    console.log('[render] Video rendered!');

    // Cleanup audio
    try { if (fs.existsSync(audioFile)) fs.unlinkSync(audioFile); } catch (e) {}

    const videoBuffer = fs.readFileSync(outputFile);
    try { fs.unlinkSync(outputFile); } catch (e) {}

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
    return NextResponse.json({ error: 'Render failed', detail: error.message?.substring(0, 300) }, { status: 500 });
  }
}

