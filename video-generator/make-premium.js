const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

console.log('');
console.log('  ╔══════════════════════════════════════════╗');
console.log('  ║  🎬 ViralAI Premium Video Generator      ║');
console.log('  ╚══════════════════════════════════════════╝');
console.log('');

const videoPath = path.join(OUTPUT_DIR, 'viral-premium.mp4');
const duration = 15;

console.log('  🎨 Rendering premium video...');
console.log('     (animated colors + vignette + ambient audio)\n');

// Single FFmpeg command: animated color cycling + vignette + ambient audio
// Using cellauto for fast organic animation with color cycling
const cmd = [
  'ffmpeg -y',
  // Source 1: cellular automaton scaled up with color cycling (fast to render)
  `-f lavfi -i "life=s=54x96:r=10:rule=B3/S23:random_fill_ratio=0.4,scale=1080:1920:flags=neighbor,format=yuv420p,hue=H=2*PI*t/6:s=3,eq=contrast=1.8:brightness=-0.15:saturation=2.5,vignette=PI/3.5"`,
  // Source 2: ambient chord (C minor pad)
  `-f lavfi -i "sine=f=261:d=${duration},volume=0.015[a1];sine=f=311:d=${duration},volume=0.012[a2];sine=f=392:d=${duration},volume=0.01[a3];[a1][a2]amix=inputs=2[m];[m][a3]amix=inputs=2,lowpass=f=500,aecho=0.6:0.4:800:0.35"`,
  // Output
  `-c:v libx264 -preset ultrafast -crf 26 -pix_fmt yuv420p`,
  `-c:a aac -b:a 128k`,
  `-t ${duration} -shortest -movflags +faststart`,
  `"${videoPath}"`,
].join(' ');

try {
  execSync(cmd, { stdio: 'pipe', timeout: 60000 });
  
  const stats = fs.statSync(videoPath);
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║      🎉 PREMIUM VIDEO CREATED!           ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`  📁 File     : ${videoPath}`);
  console.log(`  ⏱️  Duration : ${duration}s`);
  console.log(`  📐 Resolution: 1080x1920 (9:16)`);
  console.log(`  💾 Size     : ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  🎨 Effects  : Color cycling, vignette, ambient pad`);
  console.log('');

  // Open
  try {
    execSync(`Start-Process "${videoPath}"`, { shell: 'powershell', stdio: 'ignore' });
    console.log('  ▶️  Video opened!\n');
  } catch (e) {}

} catch (err) {
  console.log('  ⚠️  First method slow, trying alternative...\n');
  
  // Alternative: plasma-like effect using sierpinski
  const alt = [
    'ffmpeg -y',
    `-f lavfi -i "sierpinski=s=1080x1920:r=24:type=carpet,format=yuv420p,hue=H=t:s=2.5,eq=brightness=-0.1:contrast=1.5:saturation=2,vignette"`,
    `-f lavfi -i "sine=f=220:d=${duration},volume=0.02,aecho=0.5:0.3:600:0.3"`,
    `-c:v libx264 -preset ultrafast -crf 28 -pix_fmt yuv420p`,
    `-c:a aac -b:a 96k -t ${duration} -movflags +faststart`,
    `"${videoPath}"`,
  ].join(' ');

  try {
    execSync(alt, { stdio: 'pipe', timeout: 45000 });
    const stats = fs.statSync(videoPath);
    console.log('  ✅ VIDEO CREATED!');
    console.log(`  📁 ${videoPath}`);
    console.log(`  💾 ${(stats.size / 1024 / 1024).toFixed(1)} MB | ${duration}s | 1080x1920\n`);
    try {
      execSync(`Start-Process "${videoPath}"`, { shell: 'powershell', stdio: 'ignore' });
    } catch (e) {}
  } catch (err2) {
    // Final fallback: simple color pulse
    console.log('  ⚠️  Using color pulse...\n');
    const pulse = [
      'ffmpeg -y',
      `-f lavfi -i "color=c=0x1a1a2e:s=1080x1920:d=${duration}:r=24,format=yuv420p,hue=H=sin(2*PI*t/4)*30:s=1+0.5*sin(2*PI*t/3),vignette"`,
      `-f lavfi -i "sine=f=180:d=${duration},volume=0.025"`,
      `-c:v libx264 -preset ultrafast -crf 26 -pix_fmt yuv420p`,
      `-c:a aac -b:a 96k -t ${duration} -movflags +faststart`,
      `"${videoPath}"`,
    ].join(' ');
    execSync(pulse, { stdio: 'pipe', timeout: 30000 });
    const stats = fs.statSync(videoPath);
    console.log(`  ✅ VIDEO CREATED! (${(stats.size / 1024 / 1024).toFixed(1)} MB)\n`);
    console.log(`  📁 ${videoPath}\n`);
    try {
      execSync(`Start-Process "${videoPath}"`, { shell: 'powershell', stdio: 'ignore' });
    } catch (e) {}
  }
}
