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
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_TOKEN || '';

function hasFfmpeg() {
  try { execSync('ffmpeg -version', { stdio: 'pipe' }); return true; } catch { return false; }
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'NuViral v4', replicate: !!REPLICATE_API_TOKEN, openai: !!OPENAI_API_KEY, ffmpeg: hasFfmpeg() });
});

app.post('/render', async (req, res) => {
  try {
    const { title = '', script = '', voice = 'nova', prompt = '', format = 'portrait', duration = 'medium', style = '' } = req.body;

    // prompt = full prompt with style from frontend
    // script = narasi bahasa Indonesia (untuk voiceover)
    // title = judul video
    const videoPrompt = prompt || title || 'cinematic video';
    const voiceoverText = script || title || ''; // Keep original language for voiceover

    console.log(`[render] === START ===`);
    console.log(`[render] Prompt: "${videoPrompt.substring(0, 80)}"`);
    console.log(`[render] Voice text: "${voiceoverText.substring(0, 50)}"`);
    console.log(`[render] Format: ${format} | Duration: ${duration}`);

    if (!REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_TOKEN not set');

    const outputDir = '/tmp/renders';
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const ts = Date.now();

    // STEP 1: Translate VIDEO PROMPT to English (NOT the voiceover script)
    let englishPrompt = videoPrompt;
    if (OPENAI_API_KEY) {
      try {
        const tr = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You translate video prompts to English for AI video generation. Keep the style keywords intact. Output max 25 words. Output ONLY the English prompt, nothing else.' },
              { role: 'user', content: videoPrompt.substring(0, 200) }
            ],
            max_tokens: 60,
          }),
        });
        if (tr.ok) {
          const d = await tr.json();
          englishPrompt = d.choices?.[0]?.message?.content?.trim() || videoPrompt;
        }
      } catch (e) {}
    }
    englishPrompt = englishPrompt.substring(0, 150);
    console.log(`[render] English prompt: "${englishPrompt}"`);

    // STEP 2: Generate video
    console.log('[render] Generating video...');
    const aspectRatio = format === 'portrait' ? '9:16' : '16:9';

    // Duration mapping: minimax video-01 uses "length" parameter
    // short=5s, medium=10s (not directly supported, we'll request longer)
    // minimax default is 5s, no direct duration control — but we can try

    const createRes = await fetch('https://api.replicate.com/v1/models/minimax/video-01/predictions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: {
          prompt: englishPrompt,
          prompt_optimizer: true,
          aspect_ratio: aspectRatio,
        },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.log(`[render] minimax failed: ${err.substring(0, 100)}`);
      // Fallback: wan2.1 (supports num_frames for duration control)
      const numFrames = duration === 'short' ? 41 : duration === 'long' ? 161 : 81;
      console.log(`[render] Trying wan2.1 (${numFrames} frames)...`);
      const wanRes = await fetch('https://api.replicate.com/v1/models/wan-ai/wan2.1-t2v-480p/predictions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { prompt: englishPrompt, num_frames: numFrames, num_inference_steps: 25, fps: 16, aspect_ratio: aspectRatio } }),
      });
      if (!wanRes.ok) throw new Error('All video models failed');
      var prediction = await wanRes.json();
    } else {
      var prediction = await createRes.json();
    }

    console.log(`[render] Prediction: ${prediction.id} (${prediction.status})`);

    // Poll
    const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
    const maxWait = 600000;
    const t0 = Date.now();
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
      if (Date.now() - t0 > maxWait) throw new Error('Timeout (10min). Coba prompt lebih pendek.');
      await new Promise(r => setTimeout(r, 4000));
      const p = await fetch(pollUrl, { headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` } });
      prediction = await p.json();
      console.log(`[render] ${prediction.status}`);
    }
    if (prediction.status !== 'succeeded') throw new Error('Generation failed');

    const videoUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    if (!videoUrl) throw new Error('No output URL');

    // Download video
    const vr = await fetch(videoUrl);
    const vb = Buffer.from(await vr.arrayBuffer());
    const videoFile = path.join(outputDir, `v-${ts}.mp4`);
    fs.writeFileSync(videoFile, vb);
    console.log(`[render] Video: ${(vb.length / 1024 / 1024).toFixed(1)}MB`);

    // STEP 3: Generate voiceover IN ORIGINAL LANGUAGE (Bahasa Indonesia)
    // IMPORTANT: Use the original script text, NOT the translated prompt
    let audioFile = null;
    if (OPENAI_API_KEY && voiceoverText.trim()) {
      console.log(`[render] TTS (original language): "${voiceoverText.substring(0, 40)}..."`);
      const tts = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'tts-1-hd',
          voice: voice,
          input: voiceoverText, // Original language (Bahasa Indonesia)
          speed: 1.0,
        }),
      });
      if (tts.ok) {
        const ab = Buffer.from(await tts.arrayBuffer());
        audioFile = path.join(outputDir, `a-${ts}.mp3`);
        fs.writeFileSync(audioFile, ab);
        console.log(`[render] Voice: ${(ab.length / 1024).toFixed(0)}KB`);
      } else {
        console.log(`[render] TTS failed: ${tts.status}`);
      }
    }

    // STEP 4: Merge video + voiceover
    let finalFile = videoFile;
    if (audioFile && hasFfmpeg()) {
      console.log('[render] Merging video + voiceover...');
      finalFile = path.join(outputDir, `f-${ts}.mp4`);
      try {
        // Use -shortest so video length determines final duration
        execSync(`ffmpeg -y -i "${videoFile}" -i "${audioFile}" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "${finalFile}"`, { stdio: 'pipe', timeout: 30000 });
        console.log('[render] Merge OK');
      } catch (e) {
        console.log('[render] Merge failed, returning video only');
        finalFile = videoFile;
      }
    }

    // Send final video
    const buf = fs.readFileSync(finalFile);
    console.log(`[render] === DONE! ${(buf.length / 1024 / 1024).toFixed(1)}MB ===`);

    // Cleanup
    try { fs.unlinkSync(videoFile); } catch (e) {}
    try { if (audioFile) fs.unlinkSync(audioFile); } catch (e) {}
    try { if (finalFile !== videoFile) fs.unlinkSync(finalFile); } catch (e) {}

    res.set({ 'Content-Type': 'video/mp4', 'Content-Disposition': `attachment; filename="nuviral-${ts}.mp4"`, 'Content-Length': buf.length });
    res.send(buf);
  } catch (error) {
    console.error('[render] ERROR:', error.message);
    res.status(500).json({ error: 'Render failed', detail: error.message });
  }
});

app.listen(PORT, () => console.log(`🎬 NuViral v4 | port ${PORT} | Replicate:${!!REPLICATE_API_TOKEN} | OpenAI:${!!OPENAI_API_KEY} | FFmpeg:${hasFfmpeg()}`));
