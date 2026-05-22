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

function checkFfmpeg() {
  try { execSync('ffmpeg -version', { stdio: 'pipe' }); return true; } catch { return false; }
}

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NuViral AI Video Generator v2',
    model: 'minimax/video-01 (cheaper & fast)',
    voice: 'OpenAI TTS (Indonesian support)',
    hasOpenAI: !!OPENAI_API_KEY,
    hasReplicate: !!REPLICATE_API_TOKEN,
    hasFfmpeg: checkFfmpeg(),
  });
});

app.post('/render', async (req, res) => {
  try {
    const { title = 'NuViral Video', script = '', duration = 15, voice = 'nova', prompt = '' } = req.body;

    const videoPrompt = prompt || title || script.split('.')[0] || 'cinematic video';
    console.log(`[render] === START ===`);
    console.log(`[render] Input: "${videoPrompt}"`);

    if (!REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_TOKEN not set');

    const outputDir = '/tmp/renders';
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const ts = Date.now();

    // ============================================
    // STEP 1: Translate prompt to English + enhance
    // ============================================
    let englishPrompt = videoPrompt;
    if (OPENAI_API_KEY) {
      try {
        console.log('[render] Translating & enhancing prompt...');
        const trRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a video prompt engineer. Translate the input to English and enhance it for AI video generation. Make it highly visual, cinematic, and descriptive. Include camera angles, lighting, and motion details. Output ONLY the enhanced English prompt (max 50 words).' },
              { role: 'user', content: videoPrompt }
            ],
            max_tokens: 100,
          }),
        });
        if (trRes.ok) {
          const trData = await trRes.json();
          englishPrompt = trData.choices?.[0]?.message?.content?.trim() || videoPrompt;
        }
      } catch (e) { /* use original */ }
    }
    console.log(`[render] Prompt: "${englishPrompt}"`);

    // ============================================
    // STEP 2: Generate video with Minimax (cheaper model)
    // ============================================
    console.log('[render] Generating AI video (minimax)...');

    const createRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=60',
      },
      body: JSON.stringify({
        version: 'c8bcc4751328608bb75043b3af7bed52fc62ed5a7f2195bd2dcb4c8b3e7b3585',
        input: {
          prompt: englishPrompt,
          prompt_optimizer: true,
        },
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.log(`[render] Minimax failed (${createRes.status}), trying LTX-Video...`);

      // Fallback: LTX-Video (even cheaper)
      const ltxRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait=60',
        },
        body: JSON.stringify({
          version: '8b67e5fbae4f0f22b3b5b9d7f5a6aa0e1cde4f1fa2c5e0e2f3a4b5c6d7e8f9a0',
          input: {
            prompt: englishPrompt,
            num_frames: 49,
            fps: 12,
          },
        }),
      });

      if (!ltxRes.ok) {
        // Final fallback: use original Wan2.1 with fewer frames (cheaper)
        console.log('[render] LTX failed, using Wan2.1 lite...');
        const wanRes = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
            'Prefer': 'wait=60',
          },
          body: JSON.stringify({
            version: '847dfa8b01e739637fc76f480ede0c1d76408e1d694b830b5dfb8e547bf98405',
            input: {
              prompt: englishPrompt,
              num_frames: 41,
              num_inference_steps: 20,
              guidance_scale: 5.0,
              fps: 16,
            },
          }),
        });
        if (!wanRes.ok) throw new Error(`All models failed: ${errText.substring(0, 100)}`);
        var prediction = await wanRes.json();
      } else {
        var prediction = await ltxRes.json();
      }
    } else {
      var prediction = await createRes.json();
    }

    console.log(`[render] Prediction: ${prediction.id} (${prediction.status})`);

    // Poll until done
    const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
    const maxWait = 300000;
    const startTime = Date.now();

    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
      if (Date.now() - startTime > maxWait) throw new Error('Timeout');
      await new Promise(r => setTimeout(r, 3000));
      const pollRes = await fetch(pollUrl, { headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` } });
      prediction = await pollRes.json();
      console.log(`[render] ${prediction.status}`);
    }

    if (prediction.status !== 'succeeded') throw new Error('Video generation failed');

    const aiVideoUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    if (!aiVideoUrl) throw new Error('No video URL');

    // Download AI video
    console.log('[render] Downloading AI video...');
    const vidRes = await fetch(aiVideoUrl);
    const vidBuffer = Buffer.from(await vidRes.arrayBuffer());
    const aiVideoFile = path.join(outputDir, `ai-${ts}.mp4`);
    fs.writeFileSync(aiVideoFile, vidBuffer);
    console.log(`[render] Video: ${(vidBuffer.length / 1024 / 1024).toFixed(1)} MB`);

    // ============================================
    // STEP 3: Generate Indonesian voiceover with OpenAI TTS
    // ============================================
    let audioFile = null;
    const voiceText = script || title || videoPrompt;

    if (OPENAI_API_KEY && voiceText.trim()) {
      console.log('[render] Generating Indonesian voiceover...');
      const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'tts-1-hd',
          voice: voice,
          input: voiceText,
          speed: 1.0,
        }),
      });

      if (ttsRes.ok) {
        const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
        audioFile = path.join(outputDir, `voice-${ts}.mp3`);
        fs.writeFileSync(audioFile, audioBuffer);
        console.log(`[render] Voice: ${(audioBuffer.length / 1024).toFixed(0)} KB`);
      }
    }

    // ============================================
    // STEP 4: Merge video + voiceover with FFmpeg
    // ============================================
    let finalFile = aiVideoFile;

    if (audioFile && checkFfmpeg()) {
      console.log('[render] Merging video + voiceover...');
      finalFile = path.join(outputDir, `final-${ts}.mp4`);
      try {
        execSync(`ffmpeg -y -i "${aiVideoFile}" -i "${audioFile}" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "${finalFile}"`, { stdio: 'pipe', timeout: 30000 });
        console.log('[render] Merge OK!');
      } catch (e) {
        console.log('[render] Merge failed, returning video only');
        finalFile = aiVideoFile;
      }
    }

    // ============================================
    // STEP 5: Return final video
    // ============================================
    const finalBuffer = fs.readFileSync(finalFile);
    console.log(`[render] === DONE! ${(finalBuffer.length / 1024 / 1024).toFixed(1)} MB ===`);

    // Cleanup
    try { fs.unlinkSync(aiVideoFile); } catch (e) {}
    try { if (audioFile) fs.unlinkSync(audioFile); } catch (e) {}
    try { if (finalFile !== aiVideoFile) fs.unlinkSync(finalFile); } catch (e) {}

    res.set({
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="nuviral-${ts}.mp4"`,
      'Content-Length': finalBuffer.length,
    });
    res.send(finalBuffer);

  } catch (error) {
    console.error('[render] ERROR:', error.message);
    res.status(500).json({ error: 'Render failed', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🎬 NuViral AI v2 on port ${PORT}`);
  console.log(`   Replicate: ${REPLICATE_API_TOKEN ? '✅' : '❌'} (minimax/video-01)`);
  console.log(`   OpenAI: ${OPENAI_API_KEY ? '✅' : '❌'} (TTS-HD Indonesian)`);
  console.log(`   FFmpeg: ${checkFfmpeg() ? '✅' : '❌'} (merge)`);
});
