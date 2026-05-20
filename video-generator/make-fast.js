const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const videoPath = path.join(OUTPUT_DIR, 'viral-premium.mp4');
const duration = 12;

console.log('\n  🎬 ViralAI - Rendering Premium Video...\n');

// Fast animated visual: color pulsing dark background with vignette
// This is lightweight and renders in seconds
const cmd = [
  'ffmpeg -y',
  `-f lavfi -i "color=c=0x1a0a3e:s=1080x1920:d=${duration}:r=24,format=yuv420p,hue='H=30*sin(2*PI*t/4)':s='1+0.3*sin(2*PI*t/3)',vignette=PI/3"`,
  `-f lavfi -i "sine=f=220:d=${duration},volume=0.03,aecho=0.6:0.3:500:0.4"`,
  `-c:v libx264 -preset ultrafast -crf 26 -pix_fmt yuv420p`,
  `-c:a aac -b:a 96k -t ${duration} -movflags +faststart`,
  `"${videoPath}"`,
].join(' ');

try {
  execSync(cmd, { stdio: 'pipe', timeout: 30000 });
  const stats = fs.statSync(videoPath);
  
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   🎉 PREMIUM VIDEO CREATED!          ║');
  console.log('  ╚══════════════════════════════════════╝\n');
  console.log(`  📁 ${videoPath}`);
  console.log(`  ⏱️  ${duration}s | 1080x1920 | ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  console.log('  🎨 Animated purple gradient + vignette + echo audio\n');

  execSync(`Start-Process "${videoPath}"`, { shell: 'powershell', stdio: 'ignore' });
  console.log('  ▶️  Video opened!\n');
} catch (e) {
  console.error('  ❌', e.message?.substring(0, 100));
}
