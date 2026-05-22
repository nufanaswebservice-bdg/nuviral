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
  res.json({ status: 'ok', service: 'NuViral v3', replicate: !!REPLICATE_API_TOKEN, openai: !!OPENAI_API_KEY, ffmpeg: hasFfmpeg() });
});

app.post('/render', async (req, res) => {
  try {
    const { title = '', script = '', voice = 'nova', prompt = '' } = req.body;
    const videoPrompt = prompt || title || script.split('.')[0] || 'cinematic video';
    console.log(`[render] Start: "${videoPrompt}"`);

    if (!REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_TOKEN not set');

    const outputDir = '/tmp/renders';
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const ts = Date.now();

    // STEP 1: Translate + enhance prompt
    let englishPrompt = videoPrompt;
    if (OPENAI_API_KEY) {
      try {
        const tr = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: 'Translate to English for AI video. Make visual & cinematic. Max 40 words. Output ONLY the prompt.' }, { role: 'user', content: videoPrompt }], max_tokens: 80 }),
        });
        if (tr.ok) { const d = await tr.json(); englishPrompt = d.choices?.[0]?.message?.content?.trim() || videoPrompt; }
      } catch (e) {}
    }
    console.log(`[render] Prompt: "${englishPrompt}"`);

    // STEP 2: Generate video with minimax/video-01
    console.log('[render] Calling minimax/video-01...');
    const createRes = await fetch('https://api.replicate.com/v1/models/minimax/video-01/predictions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { prompt: englishPrompt, prompt_optimizer: true } }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.log(`[render] minimax failed: ${err.substring(0, 100)}`);
      // Fallback: wan2.1
      console.log('[render] Trying wan2.1...');
      const wanRes = await fetch('https://api.replicate.com/v1/models/wan-ai/wan2.1-t2v-480p/predictions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { prompt: englishPrompt, num_frames: 41, num_inference_steps: 20, fps: 16 } }),
      });
      if (!wanRes.ok) throw new Error('All video models failed');
      var prediction = await wanRes.json();
    } else {
      var prediction = await createRes.json();
    }

    console.log(`[render] Prediction: ${prediction.id} (${prediction.status})`);

    // Poll
    const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
    const maxWait = 300000;
    const t0 = Date.now();
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
      if (Date.now() - t0 > maxWait) throw new Error('Timeout (5min)');
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
    console.log(`[render] Video: ${(vb.length/1024/1024).toFixed(1)}MB`);

    // STEP 3: Generate voiceover
    let audioFile = null;
    const voiceText = script || title || videoPrompt;
    if (OPENAI_API_KEY && voiceText.trim()) {
      console.log('[render] TTS...');
      const tts = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'tts-1-hd', voice, input: voiceText, speed: 1.0 }),
      });
      if (tts.ok) {
        const ab = Buffer.from(await tts.arrayBuffer());
        audioFile = path.join(outputDir, `a-${ts}.mp3`);
        fs.writeFileSync(audioFile, ab);
        console.log(`[render] Voice: ${(ab.length/1024).toFixed(0)}KB`);
      }
    }

    // STEP 4: Merge
    let finalFile = videoFile;
    if (audioFile && hasFfmpeg()) {
      console.log('[render] Merging...');
      finalFile = path.join(outputDir, `f-${ts}.mp4`);
      try {
        execSync(`ffmpeg -y -i "${videoFile}" -i "${audioFile}" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "${finalFile}"`, { stdio: 'pipe', timeout: 30000 });
      } catch (e) { finalFile = videoFile; }
    }

    // Send
    const buf = fs.readFileSync(finalFile);
    console.log(`[render] Done! ${(buf.length/1024/1024).toFixed(1)}MB`);
    try { fs.unlinkSync(videoFile); } catch(e){}
    try { if(audioFile) fs.unlinkSync(audioFile); } catch(e){}
    try { if(finalFile!==videoFile) fs.unlinkSync(finalFile); } catch(e){}

    res.set({ 'Content-Type': 'video/mp4', 'Content-Disposition': `attachment; filename="nuviral-${ts}.mp4"`, 'Content-Length': buf.length });
    res.send(buf);
  } catch (error) {
    console.error('[render] ERROR:', error.message);
    res.status(500).json({ error: 'Render failed', detail: error.message });
  }
});

app.listen(PORT, () => console.log(`🎬 NuViral v3 | port ${PORT} | Replicate:${!!REPLICATE_API_TOKEN} | OpenAI:${!!OPENAI_API_KEY} | FFmpeg:${hasFfmpeg()}`));
