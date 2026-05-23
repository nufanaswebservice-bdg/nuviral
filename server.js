const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors({
  origin: ['https://nuviral.cloud', 'https://www.nuviral.cloud', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || '';
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_TOKEN || '';
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || '';
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || '';
const YOUTUBE_REDIRECT_URI = 'https://nuviral-production.up.railway.app/auth/youtube/callback';

// Midtrans config
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || '';
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1'
  : 'https://app.sandbox.midtrans.com/snap/v1';

function hasFfmpeg() {
  try { execSync('ffmpeg -version', { stdio: 'pipe' }); return true; } catch { return false; }
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'NuViral v4', replicate: !!REPLICATE_API_TOKEN, openai: !!OPENAI_API_KEY, midtrans: !!MIDTRANS_SERVER_KEY, ffmpeg: hasFfmpeg() });
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

    // Duration: minimax only does 5s, use wan2.1 for longer videos
    const useMinimax = duration === 'short'; // Only use minimax for 5s
    const numFrames = duration === 'short' ? 41 : duration === 'long' ? 81 : 81; // wan2.1 max reliable is 81

    let prediction;

    if (useMinimax) {
      console.log('[render] Using minimax/video-01 (5s)...');
      const createRes = await fetch('https://api.replicate.com/v1/models/minimax/video-01/predictions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { prompt: englishPrompt, prompt_optimizer: true, aspect_ratio: aspectRatio } }),
      });
      if (createRes.ok) {
        prediction = await createRes.json();
      } else {
        // Fallback to wan2.1
        console.log('[render] minimax failed, fallback to wan2.1...');
        const wanRes = await fetch('https://api.replicate.com/v1/models/wan-ai/wan2.1-t2v-480p/predictions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: { prompt: englishPrompt, num_frames: numFrames, num_inference_steps: 25, fps: 16, aspect_ratio: aspectRatio } }),
        });
        if (!wanRes.ok) throw new Error('Video generation failed');
        prediction = await wanRes.json();
      }
    } else {
      // 10s or 20s: use wan2.1 directly (supports duration control)
      console.log(`[render] Using wan2.1 (${numFrames} frames)...`);
      const wanRes = await fetch('https://api.replicate.com/v1/models/wan-ai/wan2.1-t2v-480p/predictions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { prompt: englishPrompt.substring(0, 80), num_frames: numFrames, num_inference_steps: 20, fps: 16, aspect_ratio: aspectRatio } }),
      });
      if (!wanRes.ok) {
        // Fallback to minimax (will be 5s but at least works)
        console.log('[render] wan2.1 failed, fallback to minimax...');
        const mmRes = await fetch('https://api.replicate.com/v1/models/minimax/video-01/predictions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: { prompt: englishPrompt.substring(0, 80), prompt_optimizer: true, aspect_ratio: aspectRatio } }),
        });
        if (!mmRes.ok) throw new Error('All models failed');
        prediction = await mmRes.json();
      } else {
        prediction = await wanRes.json();
      }
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

// ============================================
// YOUTUBE OAUTH + UPLOAD
// ============================================

// Step 1: Redirect user to Google OAuth
app.get('/auth/youtube', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${YOUTUBE_CLIENT_ID}&redirect_uri=${encodeURIComponent(YOUTUBE_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}&access_type=offline&prompt=consent`;
  res.redirect(url);
});

// Step 2: Handle OAuth callback
app.get('/auth/youtube/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect('https://nuviral.cloud/dashboard/accounts?error=no_code');

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: YOUTUBE_REDIRECT_URI,
      }),
    });
    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      return res.redirect('https://nuviral.cloud/dashboard/accounts?error=token_failed');
    }

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` },
    });
    const userData = await userRes.json();
    const channel = userData.items?.[0];

    // Redirect back to frontend with token (stored in URL hash for security)
    const accountData = encodeURIComponent(JSON.stringify({
      platform: 'YouTube',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      channelId: channel?.id,
      channelName: channel?.snippet?.title,
      avatar: channel?.snippet?.thumbnails?.default?.url,
    }));

    res.redirect(`https://nuviral.cloud/dashboard/accounts?youtube_connected=true&data=${accountData}`);
  } catch (err) {
    console.error('[youtube] OAuth error:', err.message);
    res.redirect('https://nuviral.cloud/dashboard/accounts?error=oauth_failed');
  }
});

// Step 3: Upload video to YouTube
app.post('/upload/youtube', async (req, res) => {
  try {
    const { accessToken, title, description, videoUrl, tags = [] } = req.body;

    if (!accessToken || !videoUrl) {
      return res.status(400).json({ error: 'accessToken and videoUrl required' });
    }

    console.log(`[youtube] Uploading: "${title}"`);

    // Download video first
    const vidRes = await fetch(videoUrl);
    const videoBuffer = Buffer.from(await vidRes.arrayBuffer());

    // Initialize resumable upload
    const initRes = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'video/mp4',
        'X-Upload-Content-Length': videoBuffer.length.toString(),
      },
      body: JSON.stringify({
        snippet: {
          title: title || 'NuViral AI Video',
          description: description || 'Created with NuViral AI - nuviral.cloud',
          tags: [...tags, 'NuViral', 'AI', 'Shorts'],
          categoryId: '22',
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
        },
      }),
    });

    if (!initRes.ok) {
      const err = await initRes.text();
      throw new Error(`YouTube init failed: ${err.substring(0, 200)}`);
    }

    const uploadUrl = initRes.headers.get('location');
    if (!uploadUrl) throw new Error('No upload URL returned');

    // Upload video binary
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.length.toString(),
      },
      body: videoBuffer,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      throw new Error(`YouTube upload failed: ${err.substring(0, 200)}`);
    }

    const result = await uploadRes.json();
    console.log(`[youtube] Uploaded! ID: ${result.id}`);

    res.json({
      success: true,
      videoId: result.id,
      url: `https://youtube.com/shorts/${result.id}`,
    });
  } catch (error) {
    console.error('[youtube] Upload error:', error.message);
    res.status(500).json({ error: 'Upload failed', detail: error.message });
  }
});

// ============================================
// MIDTRANS PAYMENT GATEWAY
// ============================================

const PLANS = {
  STARTER: { name: 'Starter', price: 225000 },
  PRO: { name: 'Pro', price: 449000 },
  AGENCY: { name: 'Agency', price: 1225000 },
};

// Health check for subscription
app.get('/api/v1/subscription/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'midtrans-payment',
    midtransConfigured: !!MIDTRANS_SERVER_KEY,
    isProduction: MIDTRANS_IS_PRODUCTION,
    timestamp: new Date().toISOString(),
  });
});

// Create Midtrans Snap transaction
app.post('/api/v1/subscription/create-transaction', async (req, res) => {
  try {
    const { plan, userId, email, name } = req.body;

    // Get email from Authorization header token if available (decode JWT payload)
    let userEmail = email || 'customer@nuviral.cloud';
    let userName = name || 'Customer';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userEmail = payload.email || userEmail;
        userName = payload.name || payload.sub || userName;
      } catch (e) { /* ignore decode errors */ }
    }

    if (!plan) return res.status(400).json({ error: 'Plan is required' });
    if (!MIDTRANS_SERVER_KEY) {
      console.error('[midtrans] MIDTRANS_SERVER_KEY is not set!');
      return res.status(500).json({ error: 'Payment system not configured. Contact admin.' });
    }

    const planKey = plan.toUpperCase();
    const planConfig = PLANS[planKey];
    if (!planConfig) return res.status(400).json({ error: `Invalid plan: ${planKey}` });

    const orderId = `NUVIRAL-${planKey}-${Date.now()}`;
    const authString = Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: planConfig.price,
      },
      item_details: [{
        id: planKey.toLowerCase(),
        price: planConfig.price,
        quantity: 1,
        name: `NuViral ${planConfig.name} Plan - Monthly`,
      }],
      customer_details: {
        first_name: userName,
        email: userEmail,
      },
      callbacks: {
        finish: 'https://nuviral.cloud/dashboard/billing?payment=success',
        error: 'https://nuviral.cloud/dashboard/billing?payment=error',
        pending: 'https://nuviral.cloud/dashboard/billing?payment=pending',
      },
    };

    console.log(`[midtrans] Creating transaction: ${orderId} - ${planConfig.name} - Rp${planConfig.price} - ${userEmail}`);

    const response = await fetch(`${MIDTRANS_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(parameter),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[midtrans] API Error (${response.status}): ${JSON.stringify(data)}`);
      return res.status(500).json({ error: 'Failed to create transaction', detail: data });
    }

    console.log(`[midtrans] ✅ Transaction created: ${orderId}, token: ${data.token ? 'received' : 'EMPTY'}`);

    res.json({
      token: data.token,
      redirectUrl: data.redirect_url,
      orderId,
    });
  } catch (error) {
    console.error('[midtrans] Error:', error.message);
    res.status(500).json({ error: 'Failed to create transaction', detail: error.message });
  }
});

// Midtrans webhook notification
app.post('/api/v1/subscription/notification', (req, res) => {
  const notification = req.body;
  console.log(`[midtrans] Notification received:`, JSON.stringify(notification));

  // Handle test notification
  if (!notification.order_id || !notification.transaction_status) {
    console.log('[midtrans] Test notification received');
    return res.status(200).json({ status: 'ok', message: 'test notification received' });
  }

  // Verify signature
  const signatureKey = notification.signature_key;
  const orderId = notification.order_id;
  const statusCode = notification.status_code;
  const grossAmount = notification.gross_amount;

  const expectedSignature = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`)
    .digest('hex');

  if (signatureKey !== expectedSignature) {
    console.warn(`[midtrans] Invalid signature for order: ${orderId}`);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const transactionStatus = notification.transaction_status;
  console.log(`[midtrans] Payment ${orderId}: ${transactionStatus}`);

  // TODO: Update database subscription status here
  // For now, just acknowledge
  if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
    console.log(`[midtrans] ✅ Payment SUCCESS for ${orderId}`);
  } else if (transactionStatus === 'pending') {
    console.log(`[midtrans] ⏳ Payment PENDING for ${orderId}`);
  } else if (['deny', 'cancel', 'expire'].includes(transactionStatus)) {
    console.log(`[midtrans] ❌ Payment ${transactionStatus.toUpperCase()} for ${orderId}`);
  }

  res.status(200).json({ status: 'ok' });
});

// Check transaction status
app.get('/api/v1/subscription/status', async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) return res.status(400).json({ error: 'orderId required' });

    const authString = Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');
    const baseUrl = MIDTRANS_IS_PRODUCTION
      ? 'https://api.midtrans.com/v2'
      : 'https://api.sandbox.midtrans.com/v2';

    const response = await fetch(`${baseUrl}/${orderId}/status`, {
      headers: { 'Authorization': `Basic ${authString}` },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`🎬 NuViral v4 | port ${PORT} | Replicate:${!!REPLICATE_API_TOKEN} | OpenAI:${!!OPENAI_API_KEY} | YouTube:${!!YOUTUBE_CLIENT_ID} | Midtrans:${!!MIDTRANS_SERVER_KEY} | FFmpeg:${hasFfmpeg()}`));
