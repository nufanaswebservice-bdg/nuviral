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

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NuViral AI Video Generator',
    hasOpenAI: !!OPENAI_API_KEY,
    hasReplicate: !!REPLICATE_API_TOKEN,
    hasFfmpeg: checkFfmpeg(),
  });
});

function checkFfmpeg() {
  try { execSync('ffmpeg -version', { stdio: 'pipe' }); return true; } catch { return false; }
}

// Full AI Video: Replicate (visual) + OpenAI TTS (voice) + FFmpeg (merge)
app.post('/render', async (req, res) => {
  try {
    const { title = 'NuViral Video', script = '', duration = 15, voice = 'nova', prompt = '' } = req.body;

    const videoPrompt = prompt || title || script.split('.')[0] || 'cinematic video';
    console.log(`[render] === STARTING FULL AI VIDEO ===`);
    console.log(`[render] Prompt: "${videoPrompt}"`);
    console.log(`[render] Script: "${script.substring(0, 80)}..."`);

    const outputDir = '/tmp/renders';
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const ts = Date.now();

    // ============================================
    // STEP 1: Generate AI Video with Replicate
    // ============================================
    console.log('[render] STEP 1: Generating AI video with Replicate...');
    if (!REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_TOKEN not set');

    // Auto-translate to English (Replicate only understands English prompts)
    let englishPrompt = videoPrompt;
    if (OPENAI_API_KEY) {
      try {
        console.log('[render] Translating prompt to English...');
        const trRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Translate to English for AI video generation. Make it visual and descriptive. Output ONLY the English prompt.' },
              { role: 'user', content: videoPrompt }
            ],
            max_tokens: 150,
          }),
        });
        if (trRes.ok) {
          const trData = await trRes.json();
          englishPrompt = trData.choices?.[0]?.message?.content?.trim() || videoPrompt;
          console.log(`[render] English: "${englishPrompt}"`);
        }
      } catch (e) { /* use original */ }
    }

    const enhancedPrompt = `${englishPrompt}, cinematic, high quality, smooth motion, professional lighting, realistic, detailed`;

    const createRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=60',
      },
      body: JSON.stringify({
        version: '847dfa8b01e739637fc76f480ede0c1d76408e1d694b830b5dfb8e547bf98405',
        input: {
          prompt: enhancedPrompt,
          num_frames: 81,
          num_inference_steps: 30,
          guidance_scale: 5.0,
          fps: 16,
        },
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Replicate: ${createRes.status} ${errText.substring(0, 200)}`);
    }

    let prediction = await createRes.json();
    console.log(`[render] Prediction: ${prediction.id} (${prediction.status})`);

    // Poll if not yet succeeded
    const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
    const maxWait = 300000;
    const start = Date.now();

    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      if (Date.now() - start > maxWait) throw new Error('Replicate timeout');
      await new Promise(r => setTimeout(r, 3000));
      const pollRes = await fetch(pollUrl, { headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` } });
      prediction = await pollRes.json();
      console.log(`[render] Status: ${prediction.status}`);
    }

    if (prediction.status === 'failed') throw new Error('Replicate generation failed');

    const aiVideoUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    if (!aiVideoUrl) throw new Error('No video URL from Replicate');
    console.log(`[render] AI Video ready: ${aiVideoUrl}`);

    // Download AI video
    const videoRes = await fetch(aiVideoUrl);
    const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
    const aiVideoFile = path.join(outputDir, `ai-video-${ts}.mp4`);
    fs.writeFileSync(aiVideoFile, videoBuffer);
    console.log(`[render] AI Video: ${(videoBuffer.length / 1024 / 1024).toFixed(1)} MB`);

    // ============================================
    // STEP 2: Generate AI Voiceover with OpenAI TTS
    // ============================================
    const voiceText = script || title || videoPrompt;
    let audioFile = null;

    if (OPENAI_API_KEY && voiceText.trim()) {
      console.log('[render] STEP 2: Generating voiceover with OpenAI TTS...');
      const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: voice,
          input: voiceText,
          speed: 1.0,
        }),
      });

      if (ttsRes.ok) {
        const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
        audioFile = path.join(outputDir, `voice-${ts}.mp3`);
        fs.writeFileSync(audioFile, audioBuffer);
        console.log(`[render] Voiceover: ${(audioBuffer.length / 1024).toFixed(0)} KB`);
      } else {
        console.log(`[render] TTS failed: ${ttsRes.status}, continuing without voice`);
      }
    } else {
      console.log('[render] STEP 2: Skipping voiceover (no OpenAI key or empty script)');
    }

    // ============================================
    // STEP 3: Merge video + audio with FFmpeg
    // ============================================
    let finalFile = aiVideoFile;

    if (audioFile && checkFfmpeg()) {
      console.log('[render] STEP 3: Merging video + voiceover with FFmpeg...');
      finalFile = path.join(outputDir, `final-${ts}.mp4`);

      try {
        // Merge: use AI video as visual, add voiceover audio, shortest duration wins
        const mergeCmd = `ffmpeg -y -i "${aiVideoFile}" -i "${audioFile}" -c:v copy -c:a aac -b:a 128k -shortest -movflags +faststart "${finalFile}"`;
        execSync(mergeCmd, { stdio: 'pipe', timeout: 30000 });
        console.log('[render] Merge complete!');
      } catch (e) {
        console.log(`[render] FFmpeg merge failed: ${e.message}, using video without audio`);
        finalFile = aiVideoFile;
      }
    } else {
      console.log('[render] STEP 3: Skipping merge (no audio or no FFmpeg)');
    }

    // ============================================
    // STEP 4: Send final video
    // ============================================
    const finalBuffer = fs.readFileSync(finalFile);
    console.log(`[render] === DONE! Final: ${(finalBuffer.length / 1024 / 1024).toFixed(1)} MB ===`);

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
  console.log(`🎬 NuViral AI Video Generator on port ${PORT}`);
  console.log(`   Replicate: ${REPLICATE_API_TOKEN ? '✅' : '❌'}`);
  console.log(`   OpenAI TTS: ${OPENAI_API_KEY ? '✅' : '❌'}`);
  console.log(`   FFmpeg: ${checkFfmpeg() ? '✅' : '❌'}`);
});
