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

    // Determine aspect ratio from format
    const aspectRatio = format === 'landscape' ? '16:9' : '9:16';
    const isPortrait = format !== 'landscape';

    console.log(`[render] === START ===`);
    console.log(`[render] Prompt: "${videoPrompt.substring(0, 100)}"`);
    console.log(`[render] Voice text: "${voiceoverText.substring(0, 50)}"`);
    console.log(`[render] Format: ${format} | Aspect: ${aspectRatio} | Duration: ${duration}`);

    if (!REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_TOKEN not set');

    const outputDir = '/tmp/renders';
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const ts = Date.now();

    // STEP 1: Translate & enhance VIDEO PROMPT to English while keeping visual context
    let englishPrompt = videoPrompt;
    if (OPENAI_API_KEY) {
      try {
        const tr = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: `You are a video prompt translator for AI video generation. 
Rules:
- Translate the user prompt to English for AI video generation
- KEEP the cultural/visual context (Indonesian food, Asian people, local scenery, etc.)
- If the prompt mentions Indonesian food (sate, nasi goreng, rendang, etc.), describe it visually in English but keep it as Indonesian/Asian food
- If the prompt mentions Indonesian places (Bali, Jakarta, etc.), keep the location context
- Add visual details: lighting, camera angle, movement, atmosphere
- Output 30-50 words maximum
- Output ONLY the English video prompt, nothing else
- Include the style keywords if provided` },
              { role: 'user', content: videoPrompt.substring(0, 300) }
            ],
            max_tokens: 100,
          }),
        });
        if (tr.ok) {
          const d = await tr.json();
          englishPrompt = d.choices?.[0]?.message?.content?.trim() || videoPrompt;
        }
      } catch (e) {
        console.log('[render] Translation failed, using original prompt');
      }
    }
    englishPrompt = englishPrompt.substring(0, 200);
    console.log(`[render] English prompt: "${englishPrompt}"`);

    // STEP 2: Generate video with Kling v2.1 Master (supports 5s and 10s native)
    console.log(`[render] Generating video with Kling v2.1 (${aspectRatio}, duration: ${duration})...`);

    // Kling v2.1 supports 5s and 10s natively
    // For 20s, we generate 2x 10s clips and concatenate
    const targetDurationSec = duration === 'short' ? 5 : duration === 'long' ? 20 : 10;
    const klingDuration = targetDurationSec <= 10 ? targetDurationSec : 10; // Max 10s per Kling call
    const clipsNeeded = Math.ceil(targetDurationSec / 10); // 5s=1, 10s=1, 20s=2

    console.log(`[render] Target: ${targetDurationSec}s, Kling duration: ${klingDuration}s, clips: ${clipsNeeded}`);

    const clipFiles = [];

    for (let clipIndex = 0; clipIndex < clipsNeeded; clipIndex++) {
      let clipPrompt = englishPrompt;
      if (clipsNeeded > 1 && clipIndex > 0) {
        clipPrompt = `${englishPrompt}, continuation, different angle, smooth transition`;
      }

      console.log(`[render] Generating clip ${clipIndex + 1}/${clipsNeeded} (${klingDuration}s)...`);

      let prediction;

      // Use Kling v2.1 Master (text-to-video, supports duration and aspect_ratio)
      const klingRes = await fetch('https://api.replicate.com/v1/models/kwaivgi/kling-v2.1-master/predictions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            prompt: clipPrompt,
            duration: klingDuration,
            aspect_ratio: aspectRatio,
          }
        }),
      });

      if (klingRes.ok) {
        prediction = await klingRes.json();
        console.log(`[render] Kling v2.1 prediction created: ${prediction.id}`);
      } else {
        // Fallback to minimax if Kling fails
        console.log(`[render] Kling failed (${klingRes.status}), fallback to minimax...`);
        const mmRes = await fetch('https://api.replicate.com/v1/models/minimax/video-01/predictions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: { prompt: clipPrompt, prompt_optimizer: true, aspect_ratio: aspectRatio } }),
        });
        if (!mmRes.ok) throw new Error(`Video generation failed for clip ${clipIndex + 1}`);
        prediction = await mmRes.json();
        console.log(`[render] Minimax fallback prediction: ${prediction.id}`);
      }

      // Poll for completion
      const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
      const maxWait = 600000;
      const t0clip = Date.now();
      while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
        if (Date.now() - t0clip > maxWait) throw new Error('Timeout (10min). Coba prompt lebih pendek.');
        await new Promise(r => setTimeout(r, 5000));
        const p = await fetch(pollUrl, { headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` } });
        prediction = await p.json();
        if (prediction.status === 'processing') {
          console.log(`[render] Clip ${clipIndex + 1} processing...`);
        }
      }
      if (prediction.status !== 'succeeded') {
        console.error(`[render] Clip ${clipIndex + 1} failed:`, prediction.error || 'unknown error');
        throw new Error(`Video generation failed: ${prediction.error || 'model error'}`);
      }

      const clipUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
      if (!clipUrl) throw new Error(`No output URL for clip ${clipIndex + 1}`);

      // Download clip
      const clipRes = await fetch(clipUrl);
      const clipBuf = Buffer.from(await clipRes.arrayBuffer());
      const clipFile = path.join(outputDir, `clip-${ts}-${clipIndex}.mp4`);
      fs.writeFileSync(clipFile, clipBuf);
      clipFiles.push(clipFile);
      console.log(`[render] Clip ${clipIndex + 1} done: ${(clipBuf.length / 1024 / 1024).toFixed(1)}MB`);
    }

    // Concatenate clips if multiple
    let videoFile;
    if (clipFiles.length === 1) {
      videoFile = clipFiles[0];
    } else if (hasFfmpeg()) {
      const concatListFile = path.join(outputDir, `concat-${ts}.txt`);
      const concatContent = clipFiles.map(f => `file '${f}'`).join('\n');
      fs.writeFileSync(concatListFile, concatContent);

      videoFile = path.join(outputDir, `v-${ts}.mp4`);
      try {
        execSync(`ffmpeg -y -f concat -safe 0 -i "${concatListFile}" -c copy -movflags +faststart "${videoFile}"`, { stdio: 'pipe', timeout: 60000 });
        console.log(`[render] ${clipFiles.length} clips concatenated`);
      } catch (e) {
        console.log(`[render] Concat failed, using first clip: ${e.message}`);
        videoFile = clipFiles[0];
      }
      try { fs.unlinkSync(concatListFile); } catch (e) {}
    } else {
      videoFile = clipFiles[0];
    }

    console.log(`[render] Video ready: ${videoFile}`);

    // STEP 3: Force correct aspect ratio with FFmpeg
    let processedVideoFile = videoFile;
    if (hasFfmpeg()) {
      try {
        processedVideoFile = path.join(outputDir, `ar-${ts}.mp4`);
        if (isPortrait) {
          // Force 9:16 portrait (1080x1920) - crop center if landscape, or pad if needed
          execSync(`ffmpeg -y -i "${videoFile}" -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" -c:a copy -movflags +faststart "${processedVideoFile}"`, { stdio: 'pipe', timeout: 60000 });
        } else {
          // Force 16:9 landscape (1920x1080)
          execSync(`ffmpeg -y -i "${videoFile}" -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" -c:a copy -movflags +faststart "${processedVideoFile}"`, { stdio: 'pipe', timeout: 60000 });
        }
        console.log(`[render] Aspect ratio corrected to ${aspectRatio}`);
      } catch (e) {
        console.log(`[render] Aspect ratio correction failed, using original: ${e.message}`);
        processedVideoFile = videoFile;
      }
    }

    // STEP 4: Generate voiceover IN ORIGINAL LANGUAGE (Bahasa Indonesia)
    let audioFile = null;
    if (OPENAI_API_KEY && voiceoverText.trim()) {
      console.log(`[render] TTS (original language): "${voiceoverText.substring(0, 40)}..."`);
      const tts = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'tts-1-hd',
          voice: voice,
          input: voiceoverText,
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

    // STEP 5: Merge video + voiceover
    let finalFile = processedVideoFile;
    if (audioFile && hasFfmpeg()) {
      console.log('[render] Merging video + voiceover...');
      finalFile = path.join(outputDir, `f-${ts}.mp4`);
      try {
        execSync(`ffmpeg -y -i "${processedVideoFile}" -i "${audioFile}" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "${finalFile}"`, { stdio: 'pipe', timeout: 30000 });
        console.log('[render] Merge OK');
      } catch (e) {
        console.log('[render] Merge failed, returning video only');
        finalFile = processedVideoFile;
      }
    }

    // Send final video
    const buf = fs.readFileSync(finalFile);
    console.log(`[render] === DONE! ${(buf.length / 1024 / 1024).toFixed(1)}MB ===`);

    // Cleanup
    try { if (videoFile) fs.unlinkSync(videoFile); } catch (e) {}
    try { if (processedVideoFile && processedVideoFile !== videoFile) fs.unlinkSync(processedVideoFile); } catch (e) {}
    try { if (audioFile) fs.unlinkSync(audioFile); } catch (e) {}
    try { if (finalFile && finalFile !== videoFile && finalFile !== processedVideoFile) fs.unlinkSync(finalFile); } catch (e) {}
    // Cleanup clip files
    for (const cf of clipFiles) { try { if (cf !== videoFile) fs.unlinkSync(cf); } catch (e) {} }

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

// Get current subscription (returns data based on user's actual plan)
app.get('/api/v1/subscription/current', (req, res) => {
  // Check if admin via Authorization header (decode JWT payload)
  let userEmail = '';
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      userEmail = payload.email || '';
    } catch (e) { /* ignore */ }
  }

  // Admin emails get unlimited access
  const ADMIN_EMAILS = ['nufanaswebservice@gmail.com', 'baranashira01@gmail.com', 'rufanaswebservice@gmail.com'];
  if (ADMIN_EMAILS.includes(userEmail)) {
    return res.json({
      plan: 'AGENCY',
      status: 'ACTIVE',
      videoRenderLimit: 9999,
      videoRenderUsed: 0,
      aiCreditsLimit: 99999,
      aiCreditsUsed: 0,
      storageLimit: 214748364800,
      storageUsed: 0,
      teamMemberLimit: 100,
      apiAccessEnabled: true,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  // Regular users: no plan (needs to subscribe)
  res.json({
    plan: null,
    status: 'INACTIVE',
    videoRenderLimit: 0,
    videoRenderUsed: 0,
    aiCreditsLimit: 0,
    aiCreditsUsed: 0,
    storageLimit: 0,
    storageUsed: 0,
    teamMemberLimit: 0,
    apiAccessEnabled: false,
    currentPeriodStart: null,
    currentPeriodEnd: null,
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
