/**
 * FFmpeg Engine - HTTP Service
 * Video processing and rendering service
 */
const http = require('http');
const { execSync } = require('child_process');

const PORT = process.env.PORT || 3003;

function checkFfmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'ffmpeg-engine',
      version: '1.0.0',
      ffmpeg: checkFfmpeg(),
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎬 FFmpeg Engine service running on port ${PORT}`);
  console.log(`   FFmpeg available: ${checkFfmpeg()}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
