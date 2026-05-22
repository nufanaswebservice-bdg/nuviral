const express = require('express');
const cors = require('cors');
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
    features: ['text-to-video', 'ai-voiceover', 'cinematic-render'],
    hasOpenAI: !!OPENAI_API_KEY,
    hasReplicate: !!REPLICATE_API_TOKEN,
  });
});

// AI Video Generation with Replicate
app.post('/render', async (req, res) => {
  try {
    const { title = 'NuViral Video', script = '', duration = 15, voice = 'nova', prompt = '' } = req.body;

    const videoPrompt = prompt || title || script.split('.')[0] || 'cinematic video';
    console.log(`[render] Starting AI video: "${videoPrompt}"`);

    if (!REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN not configured');
    }

    // Enhance prompt for cinematic quality
    const enhancedPrompt = `${videoPrompt}, cinematic, high quality, smooth motion, professional lighting, detailed, 4K`;
    console.log(`[render] Prompt: "${enhancedPrompt}"`);

    // Call Replicate API
    console.log('[render] Calling Replicate AI...');
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
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

    if (!createResponse.ok) {
      const errText = await createResponse.text();
      console.log(`[render] Replicate error: ${createResponse.status} ${errText}`);
      throw new Error(`Replicate API: ${createResponse.status} - ${errText.substring(0, 200)}`);
    }

    const prediction = await createResponse.json();
    console.log(`[render] Prediction: ${prediction.id} status=${prediction.status}`);

    // Poll until complete
    let status = prediction.status;
    let output = prediction.output;
    const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
    const maxWait = 300000;
    const startTime = Date.now();

    while (status !== 'succeeded' && status !== 'failed' && status !== 'canceled') {
      if (Date.now() - startTime > maxWait) {
        throw new Error('Timeout: video generation took too long');
      }
      await new Promise(r => setTimeout(r, 3000));

      const pollRes = await fetch(pollUrl, {
        headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` },
      });
      const pollData = await pollRes.json();
      status = pollData.status;
      output = pollData.output;
      console.log(`[render] Poll: ${status}`);
    }

    if (status === 'failed' || status === 'canceled') {
      throw new Error('AI video generation failed');
    }

    // Get video URL
    const videoUrl = Array.isArray(output) ? output[0] : output;
    if (!videoUrl) throw new Error('No video output');

    console.log(`[render] Downloading: ${videoUrl}`);
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error('Failed to download video');

    const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
    console.log(`[render] Done! ${(videoBuffer.length / 1024 / 1024).toFixed(1)} MB`);

    res.set({
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="nuviral-${Date.now()}.mp4"`,
      'Content-Length': videoBuffer.length,
    });
    res.send(videoBuffer);

  } catch (error) {
    console.error('[render] ERROR:', error.message);
    res.status(500).json({ error: 'Render failed', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🎬 NuViral AI Video Generator on port ${PORT}`);
  console.log(`   Replicate: ${REPLICATE_API_TOKEN ? '✅ Ready' : '❌ Not set'}`);
  console.log(`   OpenAI: ${OPENAI_API_KEY ? '✅ Ready' : '❌ Not set'}`);
});
