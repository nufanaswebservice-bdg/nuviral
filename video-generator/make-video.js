const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const videoPath = path.join(OUTPUT_DIR, 'viral-video.mp4');

console.log('\n  🎬 ViralAI - Generating Video...\n');

// Simple but working: dark background + subtle sine audio, 15 seconds, fast render
const cmd = `ffmpeg -y -f lavfi -i "color=c=0x1a1a2e:s=1080x1920:d=15:r=24" -f lavfi -i "sine=f=300:d=15,volume=0.03" -c:v libx264 -preset ultrafast -crf 30 -pix_fmt yuv420p -c:a aac -b:a 64k -shortest -movflags +faststart "${videoPath}"`;

try {
  execSync(cmd, { stdio: 'inherit', timeout: 30000 });
  
  const stats = fs.statSync(videoPath);
  console.log('\n  ✅ VIDEO CREATED!');
  console.log(`  📁 ${videoPath}`);
  console.log(`  💾 ${(stats.size / 1024 / 1024).toFixed(1)} MB | 15s | 1080x1920\n`);
  
  // Open video
  execSync(`start "" "${videoPath}"`, { stdio: 'ignore' });
  console.log('  ▶️  Video opened in media player!\n');
} catch (err) {
  console.error('  ❌ Error:', err.message);
}
