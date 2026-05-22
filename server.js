const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors({
  origin: ['https://nuviral.cloud', 'https://www.nuviral.cloud', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || '';

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NuViral Video Render',
    ffmpeg: true,
    hasApiKey: !!OPENAI_API_KEY,
    keyPrefix: OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT SET',
  });
});

// Render video endpoint
app.post('/render', async (req, res) => {
  try {
    const { title = 'NuViral Video', script = '', duration = 15, voice = 'nova' } = req.body;

    if (!script.trim()) {
      return res.status(400).json({ error: 'Script is required' });
    }

    console.log(`[render] Starting: "${title}" (${script.length} chars)`);

    const outputDir = '/tmp/renders';
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const timestamp = Date.now();
    const audioFile = path.join(outputDir, `audio-${timestamp}.mp3`);
    const videoFile = path.join(outputDir, `video-${timestamp}.mp4`);

    // Step 1: Generate AI Voiceover
    console.log('[render] Generating voiceover...');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voice,
        input: script,
        speed: 1.0,
      }),
    });

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text();
      throw new Error(`TTS failed: ${ttsResponse.status} ${errText.substring(0, 200)}`);
    }

    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
    fs.writeFileSync(audioFile, audioBuffer);
    console.log(`[render] Voiceover: ${(audioBuffer.length / 1024).toFixed(0)} KB`);

    // Step 2: Get audio duration
    let actualDuration = duration;
    try {
      const probe = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${audioFile}"`, { encoding: 'utf-8' }).trim();
      actualDuration = parseFloat(probe) || duration;
    } catch (e) {
      const wordCount = script.split(/\s+/).length;
      actualDuration = Math.max((wordCount / 150) * 60, duration);
    }

    // Step 3: Download stock images from Pexels (free, no API key needed for small use)
    console.log('[render] Downloading stock footage...');
    const keywords = title.split(' ').slice(0, 3).join(' ');
    const imageFiles = [];

    // Download 3-5 stock images related to the topic
    const searchTerms = ['technology', 'business', 'social media', 'digital', 'creative'];
    const sentences = script.split(/[.\n!?]+/).filter(s => s.trim().length > 2);

    for (let i = 0; i < Math.min(5, sentences.length); i++) {
      const term = searchTerms[i % searchTerms.length];
      const imgFile = path.join(outputDir, `img-${timestamp}-${i}.jpg`);

      try {
        // Use picsum.photos for random high-quality images (no API key needed)
        const imgResponse = await fetch(`https://picsum.photos/1080/1920?random=${timestamp + i}`);
        if (imgResponse.ok) {
          const imgBuffer = Buffer.from(await imgResponse.arrayBuffer());
          fs.writeFileSync(imgFile, imgBuffer);
          imageFiles.push(imgFile);
        }
      } catch (e) {
        console.log(`[render] Image ${i} download failed, skipping`);
      }
    }

    console.log(`[render] Downloaded ${imageFiles.length} images`);

    // Step 4: Build video with images + subtitles + voiceover
    console.log('[render] Rendering video with FFmpeg...');

    const segDuration = actualDuration / Math.max(imageFiles.length, 1);

    if (imageFiles.length > 0) {
      // Create video from images with Ken Burns effect + subtitles
      let inputArgs = '';
      let filterParts = [];

      // Add each image as input with duration
      imageFiles.forEach((img, i) => {
        inputArgs += ` -loop 1 -t ${segDuration.toFixed(2)} -i "${img}"`;
        // Apply zoom effect on each image
        filterParts.push(`[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.001,1.3)':d=${Math.ceil(segDuration * 25)}:s=1080x1920:fps=25[v${i}]`);
      });

      // Concatenate all video segments
      const concatInputs = imageFiles.map((_, i) => `[v${i}]`).join('');
      const concatFilter = `${concatInputs}concat=n=${imageFiles.length}:v=1:a=0[base]`;

      // Add subtitle overlay
      let subtitleFilter = '[base]';
      const safeTitle = title.replace(/'/g, "\\'").replace(/:/g, '\\:').replace(/"/g, '\\"');
      subtitleFilter += `drawtext=text='${safeTitle}':fontsize=42:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=80`;

      sentences.forEach((sentence, i) => {
        const start = (i * (actualDuration / sentences.length)).toFixed(2);
        const end = ((i + 1) * (actualDuration / sentences.length)).toFixed(2);
        const text = sentence.trim().replace(/'/g, "\\'").replace(/:/g, '\\:').replace(/"/g, '\\"');
        if (text.length > 0) {
          subtitleFilter += `,drawtext=text='${text}':fontsize=32:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-300:enable='between(t\\,${start}\\,${end})'`;
        }
      });

      // Progress bar
      subtitleFilter += `,drawbox=x=0:y=1890:w='iw*t/${actualDuration.toFixed(2)}':h=6:color=0x7c3aed@0.9:t=fill`;
      subtitleFilter += '[outv]';

      const fullFilter = filterParts.join(';') + ';' + concatFilter + ';' + subtitleFilter;

      const cmd = `ffmpeg -y${inputArgs} -i "${audioFile}" -filter_complex "${fullFilter}" -map "[outv]" -map ${imageFiles.length}:a -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart "${videoFile}"`;

      try {
        execSync(cmd, { stdio: 'pipe', timeout: 120000 });
      } catch (ffmpegErr) {
        console.log('[render] Complex render failed, trying simple version...');
        // Fallback: simpler render with just first image + audio
        const simpleCmd = `ffmpeg -y -loop 1 -i "${imageFiles[0]}" -i "${audioFile}" -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.0005,1.2)':d=${Math.ceil(actualDuration * 25)}:s=1080x1920:fps=25,drawtext=text='${safeTitle}':fontsize=42:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=80[outv]" -map "[outv]" -map 1:a -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart "${videoFile}"`;
        execSync(simpleCmd, { stdio: 'pipe', timeout: 120000 });
      }
    } else {
      // No images available - use color background
      const safeTitle = title.replace(/'/g, "\\'").replace(/:/g, '\\:');
      const cmd = `ffmpeg -y -f lavfi -i "color=c=0x0f0a2e:s=1080x1920:d=${Math.ceil(actualDuration)}:r=24,format=yuv420p" -i "${audioFile}" -filter_complex "[0:v]vignette=PI/4,drawtext=text='${safeTitle}':fontsize=42:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=100[outv]" -map "[outv]" -map 1:a -c:v libx264 -preset fast -crf 26 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart "${videoFile}"`;
      execSync(cmd, { stdio: 'pipe', timeout: 120000 });
    }

    console.log('[render] Video rendered!');

    // Cleanup images
    imageFiles.forEach(f => { try { fs.unlinkSync(f); } catch (e) {} });

    // Send video
    const videoBuffer = fs.readFileSync(videoFile);
    try { fs.unlinkSync(audioFile); } catch (e) {}
    try { fs.unlinkSync(videoFile); } catch (e) {}

    res.set({
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="nuviral-${timestamp}.mp4"`,
      'Content-Length': videoBuffer.length,
    });
    res.send(videoBuffer);

  } catch (error) {
    console.error('[render] ERROR:', error.message);
    res.status(500).json({ error: 'Render failed', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🎬 NuViral Video Render running on port ${PORT}`);
  try {
    const v = execSync('ffmpeg -version', { encoding: 'utf-8' }).split('\n')[0];
    console.log(`✅ ${v}`);
  } catch (e) {
    console.error('❌ FFmpeg not found!');
  }
});
