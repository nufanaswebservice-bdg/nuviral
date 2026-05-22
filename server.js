const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const app = express();
app.use(cors({
  origin: ['https://nuviral.cloud', 'https://www.nuviral.cloud', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'NuViral Video Render', ffmpeg: true });
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
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: script,
      speed: 1.0,
    });

    const audioBuffer = Buffer.from(await mp3.arrayBuffer());
    fs.writeFileSync(audioFile, audioBuffer);
    console.log(`[render] Voiceover: ${(audioBuffer.length / 1024).toFixed(0)} KB`);

    // Step 2: Get audio duration
    let actualDuration = duration;
    try {
      const probe = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${audioFile}"`, { encoding: 'utf-8' }).trim();
      actualDuration = parseFloat(probe) || duration;
    } catch (e) {}

    // Step 3: Build subtitle filters
    const sentences = script.split(/[.\n!?]+/).filter(s => s.trim().length > 2);
    const segDuration = actualDuration / Math.max(sentences.length, 1);

    let textFilters = '';
    const safeTitle = title.replace(/'/g, "\\'").replace(/:/g, '\\:');
    textFilters += `,drawtext=text='${safeTitle}':fontsize=48:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=100`;
    textFilters += `,drawtext=text='NuViral AI':fontsize=20:fontcolor=0x7c3aed:borderw=1:bordercolor=black:x=(w-text_w)/2:y=170`;

    sentences.forEach((sentence, i) => {
      const start = (i * segDuration).toFixed(2);
      const end = ((i + 1) * segDuration).toFixed(2);
      const text = sentence.trim().replace(/'/g, "\\'").replace(/:/g, '\\:');
      textFilters += `,drawtext=text='${text}':fontsize=34:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-350:enable='between(t,${start},${end})'`;
    });

    textFilters += `,drawbox=x=0:y=1880:w='iw*t/${actualDuration}':h=6:color=0x7c3aed@0.9:t=fill`;

    // Step 4: Render with FFmpeg
    console.log('[render] Rendering video...');
    const cmd = `ffmpeg -y -f lavfi -i "color=c=0x0f0a2e:s=1080x1920:d=${Math.ceil(actualDuration)}:r=24,format=yuv420p" -i "${audioFile}" -filter_complex "[0:v]vignette=PI/4${textFilters}[v]" -map "[v]" -map 1:a -c:v libx264 -preset fast -crf 26 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart "${videoFile}"`;

    execSync(cmd, { stdio: 'pipe', timeout: 120000 });
    console.log('[render] Done!');

    // Step 5: Send video
    const videoBuffer = fs.readFileSync(videoFile);

    // Cleanup
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
