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
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

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

// Cloudflare R2 config (S3-compatible)
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'nuviral-media';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Admin emails (super admin access)
const ADMIN_EMAILS = ['nufanaswebservice@gmail.com', 'baranashira01@gmail.com', 'rufanaswebservice@gmail.com'];

// ============================================
// AUTH MIDDLEWARE & HELPERS
// ============================================

// Extract user email from Firebase/JWT token in Authorization header
function extractUserEmail(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined' || token === 'email-token') return null;
    // Try to decode JWT payload (works for Firebase tokens and our custom tokens)
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.email || null;
  } catch {
    return null;
  }
}

// Middleware: require authenticated user
function requireAuth(req, res, next) {
  const email = extractUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Unauthorized', detail: 'Login required' });
  }
  req.userEmail = email;
  next();
}

// Middleware: require admin
function requireAdmin(req, res, next) {
  const email = extractUserEmail(req);
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return res.status(403).json({ error: 'Forbidden', detail: 'Admin access required' });
  }
  req.userEmail = email;
  next();
}

function hasFfmpeg() {
  try { execSync('ffmpeg -version', { stdio: 'pipe' }); return true; } catch { return false; }
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'NuViral v4', replicate: !!REPLICATE_API_TOKEN, openai: !!OPENAI_API_KEY, midtrans: !!MIDTRANS_SERVER_KEY, r2: !!R2_ACCESS_KEY_ID, ffmpeg: hasFfmpeg() });
});

app.post('/render', requireAuth, async (req, res) => {
  try {
    const { title = '', script = '', voice = 'nova', prompt = '', format = 'portrait', duration = 'medium', style = '' } = req.body;
    const userEmail = req.userEmail;

    // Check user limit
    if (!ADMIN_EMAILS.includes(userEmail)) {
      const usage = getUserUsage(userEmail);
      if (usage.plan && PLANS[usage.plan]) {
        const planConfig = PLANS[usage.plan];
        if (usage.videosUsed >= planConfig.videoLimit) {
          return res.status(403).json({ error: 'Limit tercapai', detail: `Kuota video kamu sudah habis (${usage.videosUsed}/${planConfig.videoLimit}). Upgrade plan untuk mendapatkan lebih banyak kuota.` });
        }
      } else if (!usage.plan) {
        return res.status(403).json({ error: 'Belum berlangganan', detail: 'Silakan pilih paket berlangganan untuk menggunakan AI Video Generator.' });
      }
    }

    // prompt = full prompt with style from frontend (will be translated to English for video AI)
    // script = narasi bahasa Indonesia (untuk voiceover - NEVER translate this)
    // title = judul video
    const videoPrompt = prompt || title || 'cinematic video';
    
    // IMPORTANT: voiceover uses the ORIGINAL script text (bahasa Indonesia)
    // Do NOT use translated prompt for voiceover
    const voiceoverText = script || ''; // Only use script field, not title (title might get translated)

    // Determine aspect ratio from format
    const aspectRatio = format === 'landscape' ? '16:9' : '9:16';
    const isPortrait = format !== 'landscape';

    console.log(`[render] === START ===`);
    console.log(`[render] Video Prompt: "${videoPrompt.substring(0, 100)}"`);
    console.log(`[render] Voiceover Text (original): "${voiceoverText.substring(0, 100)}"`);
    console.log(`[render] Voice: ${voice} | Format: ${format} | Duration: ${duration}`);
    console.log(`[render] Voice text: "${voiceoverText.substring(0, 50)}"`);
    console.log(`[render] Format: ${format} | Aspect: ${aspectRatio} | Duration: ${duration}`);

    if (!REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_TOKEN not set');

    const outputDir = '/tmp/renders';
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const ts = Date.now();

    // STEP 1: Optimize prompt for AI video model
    // The video model can only generate 5-10s clips, so we need to extract
    // the most visually impactful scene from long/complex prompts
    let englishPrompt = videoPrompt;
    if (OPENAI_API_KEY) {
      try {
        const tr = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: `You are an expert AI video prompt optimizer. Your job is to convert user prompts into the BEST possible prompt for a 5-10 second AI video generation model (Kling 3.0).

CRITICAL RULES:
1. The model generates 5-10 seconds of HIGH QUALITY video
2. It CAN do: time-lapse, transformations, motion, camera movement, realistic scenes
3. PRESERVE the user's intent — if they want time-lapse, keep it as time-lapse
4. PRESERVE transformation requests (before→after, renovation, growth, etc.)
5. Add camera movement details (drone shot, tracking, orbit, zoom)
6. Add lighting and atmosphere (golden hour, neon, fog, rain)
7. Keep cultural context (Indonesian/Asian elements if mentioned)
8. If prompt is already in English and detailed, keep it mostly intact but optimize for video generation
9. Output 50-80 words in English
10. Make it CINEMATIC and DYNAMIC

FORMAT: [Camera/motion type], [Main subject with transformation/action], [Environment], [Lighting], [Style]

IMPORTANT: Do NOT remove time-lapse, transformation, or process descriptions from the prompt. The model supports these.` },
              { role: 'user', content: videoPrompt.substring(0, 1500) }
            ],
            max_tokens: 150,
          }),
        });
        if (tr.ok) {
          const d = await tr.json();
          englishPrompt = d.choices?.[0]?.message?.content?.trim() || videoPrompt;
        }
      } catch (e) {
        console.log('[render] Prompt optimization failed, using original');
      }
    }
    englishPrompt = englishPrompt.substring(0, 300);
    console.log(`[render] Optimized prompt: "${englishPrompt}"`);

    // STEP 2: Generate video with Kling v2.1 Master (supports 5s and 10s native)
    console.log(`[render] Generating video with Kling v2.1 (${aspectRatio}, duration: ${duration})...`);

    // Wan 2.1 1.3B: ~$0.10-0.20 per video (very cheap)
    // Uses num_frames: 81 frames = ~5s, 161 frames = ~10s at 16fps
    const targetDurationSec = duration === 'short' ? 5 : duration === 'long' ? 20 : 10;
    const klingDuration = targetDurationSec <= 10 ? targetDurationSec : 10;
    const clipsNeeded = targetDurationSec <= 10 ? 1 : 2;

    console.log(`[render] Target: ${targetDurationSec}s, Kling duration: ${klingDuration}s, clips: ${clipsNeeded}`);

    const clipFiles = [];

    for (let clipIndex = 0; clipIndex < clipsNeeded; clipIndex++) {
      let clipPrompt = englishPrompt;
      if (clipsNeeded > 1 && clipIndex > 0) {
        clipPrompt = `${englishPrompt}, continuation, different angle, smooth transition`;
      }

      console.log(`[render] Generating clip ${clipIndex + 1}/${clipsNeeded} (${klingDuration}s)...`);

      let prediction = null;

      // Use Kling 3.0 (best quality, time-lapse capable, ~$0.33/5s)
      // Fallback to Wan 2.1 if Kling fails
      const models = [
        {
          name: 'kwaivgi/kling-v2.1',
          input: { prompt: clipPrompt, duration: String(klingDuration), aspect_ratio: aspectRatio, cfg_scale: 0.5 }
        },
        {
          name: 'wan-video/wan-2.1-1.3b',
          input: { prompt: clipPrompt, num_frames: klingDuration <= 5 ? 81 : 161, num_inference_steps: 20, fps: 16, aspect_ratio: aspectRatio }
        },
        {
          name: 'minimax/video-01',
          input: { prompt: clipPrompt, prompt_optimizer: true, aspect_ratio: aspectRatio }
        },
      ];

      for (const model of models) {
        console.log(`[render] Trying ${model.name}...`);
        try {
          const res = await fetch(`https://api.replicate.com/v1/models/${model.name}/predictions`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: model.input }),
          });

          if (res.ok) {
            prediction = await res.json();
            console.log(`[render] ${model.name} prediction created: ${prediction.id}`);
            break;
          } else {
            const errText = await res.text().catch(() => '');
            console.log(`[render] ${model.name} failed (${res.status}): ${errText.substring(0, 150)}`);
          }
        } catch (e) {
          console.log(`[render] ${model.name} error: ${e.message}`);
        }
      }

      if (!prediction) throw new Error(`Video generation failed for clip ${clipIndex + 1} - all models unavailable`);

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

    // STEP 4: Generate voiceover IN ORIGINAL LANGUAGE (auto-detect: Indonesian/English)
    let audioFile = null;
    if (OPENAI_API_KEY && voiceoverText.trim()) {
      // Detect if text is Indonesian (contains common Indonesian words)
      const indonesianWords = ['yang', 'dan', 'ini', 'itu', 'akan', 'dengan', 'untuk', 'dari', 'tidak', 'bisa', 'kamu', 'saya', 'anda', 'adalah', 'sudah', 'belum', 'juga', 'atau', 'pada', 'ke', 'di', 'se', 'ber', 'ter', 'me', 'nomor', 'cara', 'buat', 'dalam'];
      const textLower = voiceoverText.toLowerCase();
      const isIndonesian = indonesianWords.filter(w => textLower.includes(w)).length >= 2;
      
      console.log(`[render] TTS: voice=${voice}, detected_lang=${isIndonesian ? 'ID' : 'EN'}`);
      console.log(`[render] TTS text: "${voiceoverText.substring(0, 120)}"`);
      
      // For Indonesian, use alloy or nova voice (best for non-English)
      // OpenAI TTS auto-detects language from input text
      const ttsVoice = voice || 'nova';
      
      try {
        const tts = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'tts-1',
            voice: ttsVoice,
            input: voiceoverText.substring(0, 4096),
            speed: 0.95, // Slightly slower for clearer Indonesian pronunciation
          }),
        });
        if (tts.ok) {
          const ab = Buffer.from(await tts.arrayBuffer());
          audioFile = path.join(outputDir, `a-${ts}.mp3`);
          fs.writeFileSync(audioFile, ab);
          console.log(`[render] ✅ Voiceover generated: ${(ab.length / 1024).toFixed(0)}KB (${isIndonesian ? 'Bahasa Indonesia' : 'English'})`);
        } else {
          const errText = await tts.text().catch(() => '');
          console.log(`[render] ❌ TTS failed (${tts.status}): ${errText.substring(0, 200)}`);
        }
      } catch (ttsErr) {
        console.log(`[render] ❌ TTS error: ${ttsErr.message}`);
      }
    } else {
      console.log(`[render] Skipping TTS: OPENAI_KEY=${!!OPENAI_API_KEY}, voiceText=${!!voiceoverText.trim()}`);
    }

    // STEP 5: Merge video + voiceover
    let finalFile = processedVideoFile;
    if (audioFile && hasFfmpeg()) {
      console.log('[render] Merging video + voiceover...');
      finalFile = path.join(outputDir, `f-${ts}.mp4`);
      try {
        // Method 1: Add audio to video (map video from first input, audio from second)
        execSync(`ffmpeg -y -i "${processedVideoFile}" -i "${audioFile}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 128k -shortest -movflags +faststart "${finalFile}"`, { stdio: 'pipe', timeout: 120000 });
        console.log('[render] ✅ Merge OK');
      } catch (e) {
        console.log(`[render] Merge method 1 failed, trying method 2...`);
        try {
          // Method 2: Re-encode everything
          execSync(`ffmpeg -y -i "${processedVideoFile}" -i "${audioFile}" -map 0:v:0 -map 1:a:0 -c:v libx264 -preset ultrafast -crf 28 -c:a aac -b:a 128k -shortest -movflags +faststart "${finalFile}"`, { stdio: 'pipe', timeout: 120000 });
          console.log('[render] ✅ Merge OK (re-encoded)');
        } catch (e2) {
          console.log(`[render] ❌ All merge methods failed: ${e2.message}`);
          finalFile = processedVideoFile;
        }
      }
    } else if (!audioFile) {
      console.log('[render] ⚠️ No voiceover audio generated, returning video only');
    }

    // Send final video
    const buf = fs.readFileSync(finalFile);
    console.log(`[render] === DONE! ${(buf.length / 1024 / 1024).toFixed(1)}MB ===`);

    // Increment user usage (after successful render)
    if (userEmail && !ADMIN_EMAILS.includes(userEmail)) {
      incrementUsage(userEmail);
      const usage = getUserUsage(userEmail);
      console.log(`[render] Usage updated for ${userEmail}: ${usage.videosUsed} videos used`);
    }

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
// AI CHAT (GPT-4o-mini)
// ============================================

app.post('/api/v1/ai/chat', requireAuth, async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OpenAI not configured' });

  try {
    const messages = [
      { role: 'system', content: `Kamu adalah NuViral AI Assistant — asisten kreatif untuk content creator. 
Kamu membantu:
- Brainstorm ide konten viral untuk TikTok, Reels, Shorts
- Menulis script video pendek
- Membuat caption dan hashtag
- Strategi konten dan tips viral
- Ide thumbnail dan visual
- Analisis tren
Jawab dalam bahasa yang sama dengan user (Indonesia/English). Buat jawaban singkat, actionable, dan kreatif.` },
      ...history.slice(-10).map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: 1000 }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI error: ${err.substring(0, 100)}`);
    }

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// AI IMAGE GENERATION (Flux via Replicate)
// ============================================

app.post('/api/v1/ai/generate-image', requireAuth, async (req, res) => {
  const { prompt, aspect_ratio = '9:16', style = '' } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  if (!REPLICATE_API_TOKEN) return res.status(500).json({ error: 'Replicate not configured' });

  const userEmail = req.userEmail;
  // Check limits (images cost less, allow more)
  if (!ADMIN_EMAILS.includes(userEmail)) {
    const usage = getUserUsage(userEmail);
    if (!usage.plan) return res.status(403).json({ error: 'Belum berlangganan' });
  }

  try {
    // Use Flux Schnell (fast, cheap ~$0.003/image)
    const fullPrompt = style ? `${prompt}, ${style}` : prompt;
    
    const createRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { prompt: fullPrompt, aspect_ratio, num_outputs: 1 } }),
    });

    if (!createRes.ok) throw new Error('Failed to create image prediction');
    let prediction = await createRes.json();

    // Poll
    const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
    const maxWait = 60000;
    const t0 = Date.now();
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      if (Date.now() - t0 > maxWait) throw new Error('Timeout');
      await new Promise(r => setTimeout(r, 2000));
      const p = await fetch(pollUrl, { headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` } });
      prediction = await p.json();
    }

    if (prediction.status !== 'succeeded') throw new Error('Image generation failed');

    const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MIDTRANS PAYMENT GATEWAY
// ============================================

const PLANS = {
  STARTER: { name: 'Starter', price: 225000, videoLimit: 21, aiCreditsLimit: 210, storageLimit: 10 * 1024 * 1024 * 1024 },
  PRO: { name: 'Pro', price: 449000, videoLimit: 42, aiCreditsLimit: 420, storageLimit: 50 * 1024 * 1024 * 1024 },
  AGENCY: { name: 'Agency', price: 1225000, videoLimit: 115, aiCreditsLimit: 1150, storageLimit: 200 * 1024 * 1024 * 1024 },
};
// Profit margin: 50% — Kling 3.0 model
// Cost per video: ~Rp 5.300 (Replicate $0.33 × Rp 16.000)
// Starter: 225.000 × 50% = 112.500 / 5.300 = 21 videos
// Pro: 449.000 × 50% = 224.500 / 5.300 = 42 videos
// Agency: 1.225.000 × 50% = 612.500 / 5.300 = 115 videos

// User usage tracking
const USAGE_FILE = '/tmp/nuviral-usage.json';
function loadUsage() { try { if (fs.existsSync(USAGE_FILE)) return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8')); } catch {} return {}; }
function saveUsage(data) { try { fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2)); } catch {} }
let userUsage = loadUsage(); // { email: { videosUsed: 0, aiCreditsUsed: 0, plan: 'STARTER', periodStart: '...' } }

function getUserUsage(email) {
  if (!userUsage[email]) {
    userUsage[email] = { videosUsed: 0, aiCreditsUsed: 0, plan: null, periodStart: null, periodEnd: null };
  }
  return userUsage[email];
}

function incrementUsage(email) {
  const usage = getUserUsage(email);
  usage.videosUsed = (usage.videosUsed || 0) + 1;
  usage.aiCreditsUsed = (usage.aiCreditsUsed || 0) + 10; // 10 credits per video
  saveUsage(userUsage);
  return usage;
}

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

  // Check if user has a subscription
  const usage = getUserUsage(userEmail);
  if (usage.plan && PLANS[usage.plan]) {
    const planConfig = PLANS[usage.plan];
    // Check if period expired (30 days)
    if (usage.periodEnd && new Date(usage.periodEnd) < new Date()) {
      // Period expired, reset
      usage.videosUsed = 0;
      usage.aiCreditsUsed = 0;
      usage.plan = null;
      usage.periodStart = null;
      usage.periodEnd = null;
      saveUsage(userUsage);
    } else {
      return res.json({
        plan: usage.plan,
        status: 'ACTIVE',
        videoRenderLimit: planConfig.videoLimit,
        videoRenderUsed: usage.videosUsed || 0,
        aiCreditsLimit: planConfig.aiCreditsLimit,
        aiCreditsUsed: usage.aiCreditsUsed || 0,
        storageLimit: planConfig.storageLimit,
        storageUsed: 0,
        teamMemberLimit: usage.plan === 'AGENCY' ? 20 : usage.plan === 'PRO' ? 5 : 2,
        apiAccessEnabled: usage.plan !== 'STARTER',
        currentPeriodStart: usage.periodStart,
        currentPeriodEnd: usage.periodEnd,
      });
    }
  }

  // No plan
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

  if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
    // Extract plan from orderId: NUVIRAL-STARTER-1234567890
    const planKey = orderId.split('-')[1]; // STARTER, PRO, or AGENCY
    const customerEmail = notification.customer_details?.email || '';

    if (planKey && PLANS[planKey]) {
      // Activate subscription for user
      const usage = getUserUsage(customerEmail);
      usage.plan = planKey;
      usage.videosUsed = 0;
      usage.aiCreditsUsed = 0;
      usage.periodStart = new Date().toISOString();
      usage.periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
      saveUsage(userUsage);
      console.log(`[midtrans] ✅ Plan ${planKey} activated for ${customerEmail} (30 days)`);
    } else {
      console.log(`[midtrans] ✅ Payment SUCCESS for ${orderId} but plan not found: ${planKey}`);
    }
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

// ============================================
// USER MANAGEMENT (Admin)
// ============================================

const USERS_FILE = '/tmp/nuviral-users.json';

function loadUsersFromDisk() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

function saveUsersToDisk(users) {
  try { fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); } catch (e) {}
}

let usersCache = loadUsersFromDisk();

// Track user login (called from frontend after login)
app.post('/api/v1/auth/track-login', (req, res) => {
  const { email, name, avatar, provider } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });

  const existing = usersCache.find(u => u.email === email);
  if (existing) {
    existing.lastLogin = new Date().toISOString();
    existing.loginCount = (existing.loginCount || 0) + 1;
    existing.name = name || existing.name;
    existing.avatar = avatar || existing.avatar;
  } else {
    usersCache.push({
      id: `user-${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      avatar: avatar || '',
      provider: provider || 'email',
      role: 'USER',
      status: 'active',
      plan: null,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      loginCount: 1,
      videosGenerated: 0,
    });
  }
  saveUsersToDisk(usersCache);
  res.json({ success: true });
});

// Get all users (admin) - includes subscription data
app.get('/api/v1/admin/users', requireAdmin, (req, res) => {
  // Merge user data with subscription/usage data
  const usersWithPlan = usersCache.map(user => {
    const usage = userUsage[user.email] || {};
    return {
      ...user,
      plan: usage.plan || null,
      videosUsed: usage.videosUsed || 0,
      aiCreditsUsed: usage.aiCreditsUsed || 0,
      periodStart: usage.periodStart || null,
      periodEnd: usage.periodEnd || null,
      videoLimit: usage.plan && PLANS[usage.plan] ? PLANS[usage.plan].videoLimit : 0,
    };
  });
  res.json(usersWithPlan);
});

// Update user (admin)
app.put('/api/v1/admin/users/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  usersCache = usersCache.map(u => u.id === id ? { ...u, ...updates } : u);
  saveUsersToDisk(usersCache);
  res.json({ success: true });
});

// Assign plan to user (admin)
app.put('/api/v1/admin/users/:id/plan', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { plan } = req.body;

  // Find user email
  const user = usersCache.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const usage = getUserUsage(user.email);
  if (plan && PLANS[plan]) {
    usage.plan = plan;
    usage.videosUsed = 0;
    usage.aiCreditsUsed = 0;
    usage.periodStart = new Date().toISOString();
    usage.periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    console.log(`[admin] Plan ${plan} assigned to ${user.email} (30 days)`);
  } else {
    usage.plan = null;
    usage.videosUsed = 0;
    usage.aiCreditsUsed = 0;
    usage.periodStart = null;
    usage.periodEnd = null;
    console.log(`[admin] Plan removed from ${user.email}`);
  }
  saveUsage(userUsage);
  res.json({ success: true });
});

// Delete/ban user (admin)
app.delete('/api/v1/admin/users/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  usersCache = usersCache.filter(u => u.id !== id);
  saveUsersToDisk(usersCache);
  res.json({ success: true });
});

// ============================================
// ADMIN: SECURITY, CONTENT, SETTINGS
// ============================================

const SECURITY_FILE = '/tmp/nuviral-security.json';
const CONTENT_FILE = '/tmp/nuviral-content.json';
const SETTINGS_FILE = '/tmp/nuviral-settings.json';

function loadJsonFile(file, fallback = {}) { try { if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8')); } catch {} return fallback; }
function saveJsonFile(file, data) { try { fs.writeFileSync(file, JSON.stringify(data, null, 2)); } catch {} }

// Security
app.get('/api/v1/admin/security', requireAdmin, (req, res) => res.json(loadJsonFile(SECURITY_FILE, { blockedIPs: [], settings: {}, logs: [] })));
app.put('/api/v1/admin/security', requireAdmin, (req, res) => { saveJsonFile(SECURITY_FILE, req.body); res.json({ success: true }); });

// AI System Config (always returns live data)
app.get('/api/v1/admin/ai-config', requireAdmin, (req, res) => {
  res.json({
    primaryModel: 'Kling v2.1 (kwaivgi/kling-v2.1)',
    primaryCost: '$0.33/5s video',
    fallbackModels: ['Wan 2.1 1.3B', 'Minimax Video-01'],
    ttsModel: 'OpenAI TTS-1',
    promptModel: 'GPT-4o-mini',
    plans: [
      { name: 'Starter', price: 225000, videoLimit: PLANS.STARTER.videoLimit, aiCreditsLimit: PLANS.STARTER.aiCreditsLimit, costPerVideo: 5300 },
      { name: 'Pro', price: 449000, videoLimit: PLANS.PRO.videoLimit, aiCreditsLimit: PLANS.PRO.aiCreditsLimit, costPerVideo: 5300 },
      { name: 'Agency', price: 1225000, videoLimit: PLANS.AGENCY.videoLimit, aiCreditsLimit: PLANS.AGENCY.aiCreditsLimit, costPerVideo: 5300 },
    ],
    status: {
      replicate_api: !!REPLICATE_API_TOKEN,
      openai_api: !!OPENAI_API_KEY,
      midtrans: !!MIDTRANS_SERVER_KEY,
      r2_storage: !!R2_ACCESS_KEY_ID,
      ffmpeg: hasFfmpeg(),
    },
  });
});

// Content
app.get('/api/v1/admin/content', requireAdmin, (req, res) => res.json(loadJsonFile(CONTENT_FILE, {})));
app.put('/api/v1/admin/content', requireAdmin, (req, res) => { saveJsonFile(CONTENT_FILE, req.body); res.json({ success: true }); });

// Settings
app.get('/api/v1/admin/settings', requireAdmin, (req, res) => res.json(loadJsonFile(SETTINGS_FILE, {})));
app.put('/api/v1/admin/settings', requireAdmin, (req, res) => { saveJsonFile(SETTINGS_FILE, req.body); res.json({ success: true }); });

// ============================================
// CLOUDFLARE R2 STORAGE & VIDEO SAMPLES API
// ============================================

// Persistent storage: save samples metadata to /tmp file (survives within same deploy)
const SAMPLES_FILE = '/tmp/nuviral-video-samples.json';

function loadSamplesFromDisk() {
  try {
    if (fs.existsSync(SAMPLES_FILE)) {
      return JSON.parse(fs.readFileSync(SAMPLES_FILE, 'utf8'));
    }
  } catch (e) { console.log('[samples] Failed to load from disk:', e.message); }
  return [];
}

function saveSamplesToDisk(samples) {
  try {
    fs.writeFileSync(SAMPLES_FILE, JSON.stringify(samples, null, 2));
  } catch (e) { console.log('[samples] Failed to save to disk:', e.message); }
}

let videoSamplesCache = loadSamplesFromDisk();

// Helper: Upload buffer to R2 using S3-compatible basic auth
async function uploadToR2(buffer, key, contentType) {
  if (!R2_ACCESS_KEY_ID || !R2_ACCOUNT_ID) {
    throw new Error('R2 not configured: missing R2_ACCESS_KEY_ID or R2_ACCOUNT_ID');
  }

  const { createHash, createHmac } = require('crypto');

  const method = 'PUT';
  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  const region = 'auto';
  const service = 's3';
  const canonicalUri = `/${R2_BUCKET_NAME}/${key}`;

  const payloadHash = createHash('sha256').update(buffer).digest('hex');

  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
  ].join('\n') + '\n';

  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

  const canonicalRequest = [method, canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');

  const kDate = createHmac('sha256', `AWS4${R2_SECRET_ACCESS_KEY}`).update(dateStamp).digest();
  const kRegion = createHmac('sha256', kDate).update(region).digest();
  const kService = createHmac('sha256', kRegion).update(service).digest();
  const signingKey = createHmac('sha256', kService).update('aws4_request').digest();
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  const authHeader = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(`https://${host}${canonicalUri}`, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'Host': host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      'Authorization': authHeader,
      'Content-Length': buffer.length.toString(),
    },
    body: buffer,
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[R2] Upload failed (${response.status}):`, errText.substring(0, 300));
    throw new Error(`R2 upload failed (${response.status})`);
  }

  const publicUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : `https://${host}/${R2_BUCKET_NAME}/${key}`;
  return publicUrl;
}

// Upload video sample (admin only)
app.post('/api/v1/admin/upload-video', requireAdmin, async (req, res) => {
  try {
    const { fileBase64, fileName, contentType, title, description, category, style, prompt, featured, trending, thumbnailBase64 } = req.body;

    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: 'fileBase64 and fileName required' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    const key = `videos/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    console.log(`[upload] Uploading ${fileName} (${(buffer.length / 1024 / 1024).toFixed(1)}MB) to R2...`);

    let videoUrl;
    try {
      videoUrl = await uploadToR2(buffer, key, contentType || 'video/mp4');
      console.log(`[upload] ✅ Uploaded to R2: ${videoUrl}`);
    } catch (r2Err) {
      console.log(`[upload] R2 failed: ${r2Err.message}, storing reference only`);
      videoUrl = ''; // Will be empty if R2 not configured
    }

    // Upload thumbnail if provided
    let thumbnailUrl = '';
    if (thumbnailBase64) {
      try {
        const thumbBuffer = Buffer.from(thumbnailBase64, 'base64');
        const thumbKey = `thumbnails/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.\w+$/, '')}.jpg`;
        thumbnailUrl = await uploadToR2(thumbBuffer, thumbKey, 'image/jpeg');
        console.log(`[upload] ✅ Thumbnail uploaded to R2: ${thumbnailUrl}`);
      } catch (thumbErr) {
        console.log(`[upload] Thumbnail upload failed (non-critical): ${thumbErr.message}`);
      }
    }

    // Save sample metadata
    const sample = {
      id: `sample-${Date.now()}`,
      title: title || fileName,
      description: description || '',
      category: category || 'Cinematic',
      style: style || '🎬 Cinematic',
      videoUrl,
      thumbnailUrl,
      prompt: prompt || '',
      featured: featured || false,
      trending: trending || false,
      views: 0,
      createdAt: new Date().toISOString(),
    };

    videoSamplesCache.unshift(sample);
    saveSamplesToDisk(videoSamplesCache);
    console.log(`[upload] Sample saved: ${sample.title} (total: ${videoSamplesCache.length})`);

    // Also save metadata to R2 for persistence across deploys
    try {
      const metadataBuffer = Buffer.from(JSON.stringify(videoSamplesCache, null, 2));
      await uploadToR2(metadataBuffer, 'metadata/samples.json', 'application/json');
      console.log('[upload] Metadata synced to R2');
    } catch (e) {
      console.log(`[upload] Metadata sync failed (non-critical): ${e.message}`);
    }

    res.json({ success: true, sample });
  } catch (error) {
    console.error('[upload] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Upload thumbnail for a sample
app.post('/api/v1/admin/upload-thumbnail', requireAdmin, async (req, res) => {
  try {
    const { fileBase64, fileName, contentType, sampleId } = req.body;

    if (!fileBase64 || !sampleId) {
      return res.status(400).json({ error: 'fileBase64 and sampleId required' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    const key = `thumbnails/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    let thumbnailUrl;
    try {
      thumbnailUrl = await uploadToR2(buffer, key, contentType || 'image/jpeg');
    } catch (r2Err) {
      thumbnailUrl = '';
    }

    // Update sample
    const sample = videoSamplesCache.find(s => s.id === sampleId);
    if (sample) {
      sample.thumbnailUrl = thumbnailUrl;
      saveSamplesToDisk(videoSamplesCache);
      // Sync metadata to R2
      try {
        const metadataBuffer = Buffer.from(JSON.stringify(videoSamplesCache, null, 2));
        await uploadToR2(metadataBuffer, 'metadata/samples.json', 'application/json');
      } catch (e) { /* non-critical */ }
    }

    res.json({ success: true, thumbnailUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate thumbnails for all videos without one (admin) - uses ffmpeg
app.post('/api/v1/admin/generate-thumbnails', requireAdmin, async (req, res) => {
  const { exec } = require('child_process');
  const samplesWithoutThumb = videoSamplesCache.filter(s => !s.thumbnailUrl && s.videoUrl);
  
  if (samplesWithoutThumb.length === 0) {
    return res.json({ success: true, message: 'All videos already have thumbnails', generated: 0 });
  }

  console.log(`[thumbnails] Generating thumbnails for ${samplesWithoutThumb.length} videos...`);
  let generated = 0;

  for (const sample of samplesWithoutThumb) {
    try {
      const tmpInput = `/tmp/thumb_input_${Date.now()}.mp4`;
      const tmpOutput = `/tmp/thumb_output_${Date.now()}.jpg`;

      // Download first 5MB of video (enough for first frames)
      console.log(`[thumbnails] Processing: ${sample.title}`);
      
      const downloadResponse = await fetch(sample.videoUrl, {
        headers: { 'Range': 'bytes=0-5242880' }
      });
      
      if (!downloadResponse.ok && downloadResponse.status !== 206) {
        console.log(`[thumbnails] Failed to download ${sample.title}: ${downloadResponse.status}`);
        continue;
      }

      const videoBuffer = Buffer.from(await downloadResponse.arrayBuffer());
      fs.writeFileSync(tmpInput, videoBuffer);

      // Extract frame at 1 second using ffmpeg
      try {
        execSync(`ffmpeg -i ${tmpInput} -ss 1 -vframes 1 -vf "scale=360:640:force_original_aspect_ratio=increase,crop=360:640" -q:v 3 -y ${tmpOutput}`, {
          timeout: 15000,
          stdio: 'pipe'
        });
      } catch (ffmpegErr) {
        // Try without seeking (get first frame)
        try {
          execSync(`ffmpeg -i ${tmpInput} -vframes 1 -vf "scale=360:640:force_original_aspect_ratio=increase,crop=360:640" -q:v 3 -y ${tmpOutput}`, {
            timeout: 15000,
            stdio: 'pipe'
          });
        } catch {
          console.log(`[thumbnails] ffmpeg failed for ${sample.title}`);
          try { fs.unlinkSync(tmpInput); } catch {}
          continue;
        }
      }

      // Upload thumbnail to R2
      if (fs.existsSync(tmpOutput)) {
        const thumbBuffer = fs.readFileSync(tmpOutput);
        const thumbKey = `thumbnails/${sample.id}.jpg`;
        
        try {
          const thumbnailUrl = await uploadToR2(thumbBuffer, thumbKey, 'image/jpeg');
          sample.thumbnailUrl = thumbnailUrl;
          generated++;
          console.log(`[thumbnails] ✅ Generated for: ${sample.title}`);
        } catch (r2Err) {
          console.log(`[thumbnails] R2 upload failed for ${sample.title}: ${r2Err.message}`);
        }
      }

      // Cleanup
      try { fs.unlinkSync(tmpInput); } catch {}
      try { fs.unlinkSync(tmpOutput); } catch {}
    } catch (err) {
      console.log(`[thumbnails] Error processing ${sample.title}: ${err.message}`);
    }
  }

  // Save updated metadata
  if (generated > 0) {
    saveSamplesToDisk(videoSamplesCache);
    try {
      const metadataBuffer = Buffer.from(JSON.stringify(videoSamplesCache, null, 2));
      await uploadToR2(metadataBuffer, 'metadata/samples.json', 'application/json');
    } catch {}
  }

  console.log(`[thumbnails] Done! Generated ${generated}/${samplesWithoutThumb.length} thumbnails`);
  res.json({ success: true, generated, total: samplesWithoutThumb.length });
});

// Get all video samples (public)
app.get('/api/v1/video-samples', (req, res) => {
  res.json(videoSamplesCache);
});

// Storage info (admin)
app.get('/api/v1/admin/storage', requireAdmin, (req, res) => {
  // Calculate storage usage from video samples
  let totalVideoSize = 0;
  let totalThumbnailSize = 0;
  const filesList = [];

  videoSamplesCache.forEach(sample => {
    // Estimate size based on video duration (avg 2MB per 5s video)
    const estimatedSize = 2 * 1024 * 1024; // 2MB estimate per video
    totalVideoSize += estimatedSize;
    filesList.push({
      key: `videos/${sample.id}`,
      name: sample.title,
      type: 'video',
      size: estimatedSize,
      url: sample.videoUrl,
      uploadedAt: sample.createdAt,
    });
    if (sample.thumbnailUrl) {
      const thumbSize = 200 * 1024; // ~200KB per thumbnail
      totalThumbnailSize += thumbSize;
      filesList.push({
        key: `thumbnails/${sample.id}`,
        name: `${sample.title} (thumb)`,
        type: 'image',
        size: thumbSize,
        url: sample.thumbnailUrl,
        uploadedAt: sample.createdAt,
      });
    }
  });

  const totalUsed = totalVideoSize + totalThumbnailSize;
  const totalLimit = 10 * 1024 * 1024 * 1024; // 10GB R2 free tier

  res.json({
    provider: 'Cloudflare R2',
    bucket: R2_BUCKET_NAME,
    publicUrl: R2_PUBLIC_URL,
    configured: !!R2_ACCESS_KEY_ID,
    totalLimit,
    totalUsed,
    totalVideoSize,
    totalThumbnailSize,
    totalFiles: filesList.length,
    totalVideos: videoSamplesCache.length,
    files: filesList,
    freeTier: {
      storage: '10 GB',
      classAOps: '1M requests/month',
      classBOps: '10M requests/month',
      egress: 'Free (no egress fees)',
    },
  });
});

// Delete video sample (admin)
app.delete('/api/v1/admin/video-samples/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  videoSamplesCache = videoSamplesCache.filter(s => s.id !== id);
  saveSamplesToDisk(videoSamplesCache);
  res.json({ success: true });
});

// Update video sample (admin)
app.put('/api/v1/admin/video-samples/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  videoSamplesCache = videoSamplesCache.map(s => s.id === id ? { ...s, ...updates } : s);
  saveSamplesToDisk(videoSamplesCache);
  res.json({ success: true, sample: videoSamplesCache.find(s => s.id === id) });
});

app.listen(PORT, async () => {
  console.log(`🎬 NuViral v4 | port ${PORT} | Replicate:${!!REPLICATE_API_TOKEN} | OpenAI:${!!OPENAI_API_KEY} | Midtrans:${!!MIDTRANS_SERVER_KEY} | R2:${!!R2_ACCESS_KEY_ID} | FFmpeg:${hasFfmpeg()}`);

  // Load all data from R2 on startup (persistent across deploys)
  if (R2_PUBLIC_URL) {
    const filesToLoad = [
      { url: `${R2_PUBLIC_URL}/metadata/samples.json`, target: 'samples' },
      { url: `${R2_PUBLIC_URL}/metadata/users.json`, target: 'users' },
      { url: `${R2_PUBLIC_URL}/metadata/usage.json`, target: 'usage' },
      { url: `${R2_PUBLIC_URL}/metadata/security.json`, target: 'security' },
      { url: `${R2_PUBLIC_URL}/metadata/content.json`, target: 'content' },
      { url: `${R2_PUBLIC_URL}/metadata/settings.json`, target: 'settings' },
    ];

    for (const file of filesToLoad) {
      try {
        const res = await fetch(file.url);
        if (res.ok) {
          const data = await res.json();
          if (file.target === 'samples' && Array.isArray(data) && data.length > 0) {
            videoSamplesCache = data;
            saveSamplesToDisk(videoSamplesCache);
          } else if (file.target === 'users' && Array.isArray(data)) {
            usersCache = data;
            saveUsersToDisk(usersCache);
          } else if (file.target === 'usage' && typeof data === 'object') {
            userUsage = data;
            saveUsage(userUsage);
          } else if (file.target === 'security') {
            saveJsonFile(SECURITY_FILE, data);
          } else if (file.target === 'content') {
            saveJsonFile(CONTENT_FILE, data);
          } else if (file.target === 'settings') {
            saveJsonFile(SETTINGS_FILE, data);
          }
          console.log(`[startup] ✅ Loaded ${file.target} from R2`);
        }
      } catch (e) {
        console.log(`[startup] ${file.target}: not found in R2 (starting fresh)`);
      }
    }
  }

  // Periodic backup to R2 every 5 minutes
  if (R2_ACCESS_KEY_ID) {
    setInterval(async () => {
      try {
        const backups = [
          { data: videoSamplesCache, key: 'metadata/samples.json' },
          { data: usersCache, key: 'metadata/users.json' },
          { data: userUsage, key: 'metadata/usage.json' },
          { data: loadJsonFile(SECURITY_FILE, {}), key: 'metadata/security.json' },
          { data: loadJsonFile(CONTENT_FILE, {}), key: 'metadata/content.json' },
          { data: loadJsonFile(SETTINGS_FILE, {}), key: 'metadata/settings.json' },
        ];
        for (const backup of backups) {
          if (backup.data && (Array.isArray(backup.data) ? backup.data.length > 0 : Object.keys(backup.data).length > 0)) {
            await uploadToR2(Buffer.from(JSON.stringify(backup.data)), backup.key, 'application/json');
          }
        }
        console.log(`[backup] ✅ All data synced to R2 (${new Date().toLocaleTimeString()})`);
      } catch (e) {
        console.log(`[backup] ❌ Sync failed: ${e.message}`);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    console.log('[startup] Auto-backup to R2 enabled (every 5 min)');
  }
});
