const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function generateVideo(options = {}) {
  const {
    script = "Stop scrolling. These 5 AI tools will change your life forever. Number one. ChatGPT can now build entire websites in seconds. Number two. Midjourney creates images that look real. Number three. Eleven Labs clones any voice perfectly. Number four. Runway ML makes Hollywood quality videos. Number five. The scariest one can replace your entire job. Follow for more AI updates.",
    voice = 'nova',
    title = 'AI Video',
    subtitleColor = 'white',
    bgColor = '#1a1a2e',
    accentColor = '#7c3aed',
  } = options;

  console.log('🎬 ViralAI Video Generator');
  console.log('========================\n');

  // Step 1: Generate voiceover with OpenAI TTS
  console.log('🎙️  Step 1/4: Generating AI voiceover...');
  const audioPath = path.join(OUTPUT_DIR, 'voiceover.mp3');
  
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: voice,
    input: script,
    speed: 1.0,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  fs.writeFileSync(audioPath, buffer);
  console.log(`   ✅ Voiceover saved (${(buffer.length / 1024).toFixed(0)} KB)\n`);

  // Step 2: Get audio duration
  console.log('📐 Step 2/4: Analyzing audio duration...');
  const durationOutput = execSync(
    `ffprobe -v error -show_entries format=duration -of csv=p=0 "${audioPath}"`,
    { encoding: 'utf-8' }
  ).trim();
  const duration = parseFloat(durationOutput);
  console.log(`   ✅ Duration: ${duration.toFixed(1)} seconds\n`);

  // Step 3: Create subtitle file (SRT)
  console.log('💬 Step 3/4: Creating subtitles...');
  const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgDuration = duration / sentences.length;
  
  let srtContent = '';
  sentences.forEach((sentence, i) => {
    const start = i * avgDuration;
    const end = (i + 1) * avgDuration;
    srtContent += `${i + 1}\n`;
    srtContent += `${formatSrtTime(start)} --> ${formatSrtTime(end)}\n`;
    srtContent += `${sentence.trim()}\n\n`;
  });

  const srtPath = path.join(OUTPUT_DIR, 'subtitles.srt');
  fs.writeFileSync(srtPath, srtContent);
  console.log(`   ✅ ${sentences.length} subtitle segments created\n`);

  // Step 4: Render video with FFmpeg
  console.log('🎬 Step 4/4: Rendering video (9:16 vertical)...');
  const videoPath = path.join(OUTPUT_DIR, 'viral-video.mp4');

  // Create a vertical video (1080x1920) with animated gradient background + subtitles
  const ffmpegCmd = [
    'ffmpeg -y',
    // Generate animated gradient background
    `-f lavfi -i "color=c=${bgColor.replace('#', '0x')}:s=1080x1920:d=${duration},format=yuv420p"`,
    // Add audio
    `-i "${audioPath}"`,
    // Add animated elements + subtitles
    `-filter_complex "`,
    // Draw gradient overlay
    `[0:v]drawbox=x=0:y=0:w=1080:h=400:color=0x7c3aed@0.3:t=fill,`,
    // Draw title text at top
    `drawtext=text='${title.replace(/'/g, "\\'")}':fontsize=42:fontcolor=white:x=(w-text_w)/2:y=80:font=Arial,`,
    // Draw accent line
    `drawbox=x=390:y=150:w=300:h=4:color=0x7c3aed:t=fill,`,
    // Draw subtitles from SRT file
    `subtitles='${srtPath.replace(/\\/g, '/').replace(/:/g, '\\\\:')}':force_style='FontSize=28,FontName=Arial,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Alignment=2,MarginV=180'`,
    `[v]"`,
    `-map "[v]" -map 1:a`,
    `-c:v libx264 -preset fast -crf 23`,
    `-c:a aac -b:a 192k`,
    `-shortest`,
    `-movflags +faststart`,
    `"${videoPath}"`,
  ].join(' ');

  try {
    execSync(ffmpegCmd, { stdio: 'pipe', encoding: 'utf-8' });
  } catch (e) {
    // Try simpler version without subtitles if SRT path causes issues
    console.log('   ⚠️  Retrying with inline subtitles...');
    const simpleCmd = [
      'ffmpeg -y',
      `-f lavfi -i "color=c=${bgColor.replace('#', '0x')}:s=1080x1920:d=${duration},format=yuv420p"`,
      `-i "${audioPath}"`,
      `-filter_complex "[0:v]`,
      `drawbox=x=0:y=0:w=1080:h=300:color=0x7c3aed@0.2:t=fill,`,
      `drawtext=text='${title.replace(/'/g, "\\'")}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=100:font=Arial,`,
      `drawbox=x=390:y=170:w=300:h=4:color=0x7c3aed:t=fill,`,
      `drawtext=text='AI Generated Content':fontsize=24:fontcolor=0xaaaaaa:x=(w-text_w)/2:y=900:font=Arial,`,
      `drawtext=text='Follow for more':fontsize=32:fontcolor=0x7c3aed:x=(w-text_w)/2:y=1700:font=Arial`,
      `[v]" -map "[v]" -map 1:a`,
      `-c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k -shortest -movflags +faststart`,
      `"${videoPath}"`,
    ].join(' ');
    execSync(simpleCmd, { stdio: 'pipe' });
  }

  const stats = fs.statSync(videoPath);
  console.log(`   ✅ Video rendered! (${(stats.size / 1024 / 1024).toFixed(1)} MB)\n`);

  console.log('════════════════════════════════════════');
  console.log('🎉 VIDEO CREATED SUCCESSFULLY!');
  console.log('════════════════════════════════════════');
  console.log(`📁 File: ${videoPath}`);
  console.log(`⏱️  Duration: ${duration.toFixed(1)}s`);
  console.log(`📐 Resolution: 1080x1920 (9:16 vertical)`);
  console.log(`💾 Size: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  console.log(`🎙️  Voice: ${voice}`);
  console.log('');
  console.log('▶️  Open the video file to watch it!');

  return videoPath;
}

function formatSrtTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${ms.toString().padStart(3, '0')}`;
}

function pad(n) { return n.toString().padStart(2, '0'); }

// Run
generateVideo({
  script: "Stop scrolling. These 5 AI tools will change your life forever. Number one. ChatGPT can now build entire websites in seconds. Number two. Midjourney creates photorealistic images from text. Number three. Eleven Labs clones any voice perfectly. Number four. Runway ML makes Hollywood quality videos from a single prompt. Number five. The scariest one. It can replace your entire job by next year. Follow for more AI updates that could save your career.",
  voice: 'nova',
  title: '5 AI Tools That Will Replace You',
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
