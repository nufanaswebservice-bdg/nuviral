const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function generateVideo(options = {}) {
  const {
    title = '5 AI Tools That Will Replace You',
    duration = 30,
  } = options;

  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   🎬 ViralAI Video Generator (Free)  ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');

  const videoPath = path.join(OUTPUT_DIR, 'viral-video.mp4');

  // Step 1: Create animated video with color transitions + ambient audio
  console.log('  🎨 Step 1/2: Rendering animated video...');

  // Use color source with animated gradient effect + geometric shapes
  const ffmpegCmd = [
    'ffmpeg -y',
    `-f lavfi -i "color=s=1080x1920:d=${duration}:r=30:c=0x0f0f23,format=yuv420p,geq=r='clip(40+20*sin(2*PI*T/5)+X/20,0,255)':g='clip(15+10*sin(2*PI*T/3)+Y/30,0,255)':b='clip(60+40*sin(2*PI*T/4)+X/15+Y/20,0,255)'"`,
    `-f lavfi -i "anoisesrc=d=${duration}:c=pink:r=44100:a=0.004,aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,lowpass=f=800,volume=0.5"`,
    `-c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p`,
    `-c:a aac -b:a 128k`,
    `-t ${duration}`,
    `-movflags +faststart`,
    `"${videoPath}"`,
  ].join(' ');

  try {
    execSync(ffmpegCmd, { stdio: 'pipe', timeout: 60000 });
    console.log('     ✅ Animated background rendered\n');
  } catch (err) {
    // Even simpler fallback
    console.log('     ⚠️  Trying simpler render...');
    const fallbackCmd = [
      'ffmpeg -y',
      `-f lavfi -i "gradients=s=1080x1920:d=${duration}:r=30:c0=0x0f0f23:c1=0x7c3aed:speed=0.5,format=yuv420p"`,
      `-f lavfi -i "anoisesrc=d=${duration}:c=pink:r=44100:a=0.003"`,
      `-c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p`,
      `-c:a aac -b:a 128k -t ${duration} -movflags +faststart`,
      `"${videoPath}"`,
    ].join(' ');
    
    try {
      execSync(fallbackCmd, { stdio: 'pipe', timeout: 60000 });
      console.log('     ✅ Gradient video rendered\n');
    } catch (err2) {
      // Most basic fallback - just solid color + audio
      console.log('     ⚠️  Using basic render...');
      const basicCmd = [
        'ffmpeg -y',
        `-f lavfi -i "color=c=0x1a1a2e:s=1080x1920:d=${duration}:r=24,format=yuv420p"`,
        `-f lavfi -i "sine=frequency=220:duration=${duration}:sample_rate=44100,volume=0.05"`,
        `-c:v libx264 -preset ultrafast -crf 28 -pix_fmt yuv420p`,
        `-c:a aac -b:a 96k -t ${duration} -movflags +faststart`,
        `"${videoPath}"`,
      ].join(' ');
      execSync(basicCmd, { stdio: 'pipe', timeout: 60000 });
      console.log('     ✅ Basic video rendered\n');
    }
  }

  // Step 2: Show results
  console.log('  📊 Step 2/2: Finalizing...');
  const stats = fs.statSync(videoPath);
  console.log('     ✅ Done!\n');

  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║     🎉 VIDEO CREATED SUCCESSFULLY!   ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  console.log(`  📁 File    : ${videoPath}`);
  console.log(`  ⏱️  Duration: ${duration} seconds`);
  console.log(`  📐 Size    : 1080x1920 (9:16 vertical)`);
  console.log(`  💾 FileSize: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  🎬 Format  : MP4 (H.264 + AAC)`);
  console.log('');
  console.log('  ▶️  Buka file untuk menontonnya:');
  console.log(`     ${videoPath}`);
  console.log('');

  // Auto open the video
  try {
    execSync(`start "" "${videoPath}"`, { stdio: 'ignore' });
    console.log('  🖥️  Video dibuka otomatis di media player...');
  } catch (e) {
    // ignore if can't open
  }

  return videoPath;
}

// RUN
generateVideo({
  title: '5 AI Tools That Will Replace You',
  duration: 30,
});
