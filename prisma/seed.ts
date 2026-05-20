import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@viralai.com' },
    update: {},
    create: {
      email: 'admin@viralai.com',
      name: 'Admin',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      emailVerified: true,
      subscription: {
        create: {
          plan: 'AGENCY',
          videoRenderLimit: 9999,
          aiCreditsLimit: 99999,
          storageLimit: BigInt(1099511627776), // 1TB
          teamMemberLimit: 100,
          apiAccessEnabled: true,
        },
      },
    },
  });
  console.log(`  ✅ Admin user: ${admin.email}`);

  // Create demo user
  const demoPassword = await bcrypt.hash('Demo123!', 12);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@viralai.com' },
    update: {},
    create: {
      email: 'demo@viralai.com',
      name: 'Demo User',
      password: demoPassword,
      role: 'USER',
      emailVerified: true,
      subscription: {
        create: {
          plan: 'PRO',
          videoRenderLimit: 200,
          aiCreditsLimit: 2000,
          storageLimit: BigInt(53687091200), // 50GB
          teamMemberLimit: 5,
          apiAccessEnabled: true,
        },
      },
    },
  });
  console.log(`  ✅ Demo user: ${demo.email}`);

  // Create templates
  const templates = [
    {
      name: 'Modern Minimal',
      description: 'Clean white subtitles with shadow effect',
      category: 'minimal',
      config: {
        subtitleStyle: { fontSize: 42, fontWeight: 'bold', color: '#FFFFFF', position: 'bottom', animation: 'fade' },
        transitions: ['fade'],
        colorScheme: ['#FFFFFF', '#000000'],
        fontFamily: 'Inter',
      },
    },
    {
      name: 'Bold Neon',
      description: 'Eye-catching neon glow subtitles',
      category: 'bold',
      config: {
        subtitleStyle: { fontSize: 48, fontWeight: 'extrabold', color: '#00FF88', position: 'center', animation: 'bounce' },
        transitions: ['zoom'],
        colorScheme: ['#00FF88', '#7C3AED'],
        fontFamily: 'Montserrat',
      },
    },
    {
      name: 'Karaoke Style',
      description: 'Word-by-word highlight animation',
      category: 'karaoke',
      config: {
        subtitleStyle: { fontSize: 44, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#7C3AED', position: 'bottom', animation: 'karaoke' },
        transitions: ['slide_left'],
        colorScheme: ['#7C3AED', '#FFFFFF'],
        fontFamily: 'Poppins',
      },
    },
    {
      name: 'Cinematic',
      description: 'Film-style letterbox with elegant typography',
      category: 'cinematic',
      config: {
        subtitleStyle: { fontSize: 36, fontWeight: 'normal', color: '#FFFFFF', position: 'bottom', animation: 'typewriter' },
        transitions: ['dissolve'],
        colorScheme: ['#1A1A2E', '#E94560'],
        fontFamily: 'Playfair Display',
      },
    },
    {
      name: 'TikTok Viral',
      description: 'Trending TikTok subtitle style with emoji',
      category: 'viral',
      config: {
        subtitleStyle: { fontSize: 52, fontWeight: 'extrabold', color: '#FFFF00', outlineColor: '#000000', position: 'center', animation: 'highlight' },
        transitions: ['zoom'],
        colorScheme: ['#FFFF00', '#FF0050'],
        fontFamily: 'Impact',
      },
    },
  ];

  for (const template of templates) {
    await prisma.template.upsert({
      where: { id: template.name.toLowerCase().replace(/\s/g, '-') },
      update: {},
      create: {
        name: template.name,
        description: template.description,
        category: template.category,
        config: template.config,
        isPublic: true,
        isPremium: false,
      },
    });
  }
  console.log(`  ✅ ${templates.length} templates created`);

  // Create sample hashtags
  const hashtags = [
    { tag: '#fyp', platform: 'TIKTOK', usageCount: BigInt(50000000), trendScore: 0.95, isViral: true },
    { tag: '#viral', platform: 'TIKTOK', usageCount: BigInt(30000000), trendScore: 0.92, isViral: true },
    { tag: '#ai', platform: 'TIKTOK', usageCount: BigInt(5000000), trendScore: 0.88, isViral: true },
    { tag: '#shorts', platform: 'YOUTUBE_SHORTS', usageCount: BigInt(100000000), trendScore: 0.99, isViral: true },
    { tag: '#reels', platform: 'INSTAGRAM_REELS', usageCount: BigInt(80000000), trendScore: 0.97, isViral: true },
    { tag: '#motivation', platform: 'TIKTOK', usageCount: BigInt(20000000), trendScore: 0.85, isViral: true },
    { tag: '#tech', platform: 'TIKTOK', usageCount: BigInt(15000000), trendScore: 0.82, isViral: true },
    { tag: '#business', platform: 'TIKTOK', usageCount: BigInt(12000000), trendScore: 0.80, isViral: true },
  ];

  for (const hashtag of hashtags) {
    await prisma.hashtag.upsert({
      where: { tag: hashtag.tag },
      update: {},
      create: {
        tag: hashtag.tag,
        platform: hashtag.platform as any,
        usageCount: hashtag.usageCount,
        trendScore: hashtag.trendScore,
        isViral: hashtag.isViral,
      },
    });
  }
  console.log(`  ✅ ${hashtags.length} hashtags created`);

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
