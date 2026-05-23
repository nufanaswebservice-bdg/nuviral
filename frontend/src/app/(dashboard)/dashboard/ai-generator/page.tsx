'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Sparkles,
  Wand2,
  Hash,
  MessageSquare,
  Lightbulb,
  Target,
  Copy,
  RefreshCw,
  Loader2,
  Video,
  Check,
  Image as ImageIcon,
  Film,
} from 'lucide-react';
import { ImageUploader } from '@/components/ai-generator/image-uploader';
import { VideoReferenceUploader } from '@/components/ai-generator/video-reference-uploader';
import { AdvancedSettings, type AdvancedVideoSettings } from '@/components/ai-generator/advanced-settings';
import { BillingPopup } from '@/components/billing-popup';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuviral-production.up.railway.app/api/v1';

const niches = [
  'Business', 'Motivation', 'Anime', 'Gaming', 'Crypto',
  'Education', 'News', 'Horror', 'Storytelling', 'Affiliate Marketing',
  'Tech', 'Lifestyle', 'Fitness', 'Food', 'Travel', 'Comedy',
];

const tones = ['Engaging', 'Professional', 'Casual', 'Humorous', 'Dramatic', 'Educational'];

// Script variations database for demo
const scriptVariations: Record<string, any[]> = {
  Tech: [
    {
      title: '5 AI Tools That Will Replace Your Job in 2024',
      hook: 'Stop scrolling. If you don\'t know about these 5 AI tools, you\'re already behind.',
      script: '[0s] Stop scrolling. If you don\'t know about these 5 AI tools, you\'re already behind.\n[3s] Number 1: ChatGPT can now create entire websites in seconds...\n[8s] Number 2: Midjourney is replacing graphic designers...\n[15s] Number 3: This AI tool writes better emails than you...\n[22s] Number 4: Runway ML creates Hollywood-quality videos...\n[28s] Number 5: The scariest one... it can clone your voice perfectly.\n[33s] Follow for more AI updates that could change your career.',
      caption: 'These 5 AI tools are changing everything 🤖 Which one surprised you the most? Drop a comment 👇',
      cta: 'Follow for daily AI updates that could save your career',
      hashtags: ['#AI', '#ArtificialIntelligence', '#Tech', '#Future', '#AITools', '#ChatGPT'],
      viralScore: 0.87,
    },
    {
      title: 'This AI Secret Will Save You 10 Hours a Week',
      hook: 'I just discovered something that changed my entire workflow. And nobody is talking about it.',
      script: '[0s] I just discovered something that changed my entire workflow.\n[3s] It\'s called AI automation stacking.\n[6s] Step 1: Use ChatGPT to plan your entire week in 5 minutes.\n[12s] Step 2: Connect it to Zapier to automate repetitive tasks.\n[18s] Step 3: Use Notion AI to summarize all your meetings.\n[24s] Step 4: Let AI write your emails while you focus on real work.\n[30s] I went from 60 hours to 40 hours a week. Try it.',
      caption: 'AI automation stacking saved me 10+ hours every week 🚀 Save this for later!',
      cta: 'Follow for more productivity hacks with AI',
      hashtags: ['#Productivity', '#AIHacks', '#WorkSmarter', '#Automation', '#TechTips', '#AI'],
      viralScore: 0.82,
    },
    {
      title: 'Why 90% of Developers Will Be Replaced by 2026',
      hook: 'This is not clickbait. GitHub just released data that will terrify every developer.',
      script: '[0s] This is not clickbait. GitHub just released data that will terrify every developer.\n[3s] Copilot now writes 46% of all code on the platform.\n[8s] That number was 27% just 6 months ago.\n[13s] Junior developer jobs are already disappearing.\n[18s] But here\'s what nobody tells you...\n[22s] The developers who LEARN to use AI are getting promoted faster.\n[27s] It\'s not AI vs developers. It\'s developers WITH AI vs developers WITHOUT.\n[33s] Which side are you on?',
      caption: 'The future of coding is here. Are you adapting or getting left behind? 💻',
      cta: 'Follow for the truth about AI and tech careers',
      hashtags: ['#Developer', '#Coding', '#GitHub', '#Copilot', '#TechCareer', '#Programming'],
      viralScore: 0.91,
    },
  ],
  Motivation: [
    {
      title: 'The 5 AM Secret That Billionaires Won\'t Tell You',
      hook: 'Every billionaire wakes up at 5 AM. But that\'s not what makes them rich.',
      script: '[0s] Every billionaire wakes up at 5 AM. But that\'s not what makes them rich.\n[3s] It\'s what they do in those 2 hours before the world wakes up.\n[7s] Hour 1: They don\'t check their phone. They plan their ONE big move.\n[13s] Hour 2: They work on the thing that scares them most.\n[18s] The secret isn\'t waking up early.\n[22s] It\'s having 2 hours where nobody can distract you from your mission.\n[28s] Start tomorrow. Set your alarm. Change your life.',
      caption: 'The 5 AM club isn\'t about the time. It\'s about the focus. 🔥 Tag someone who needs this.',
      cta: 'Follow for daily motivation that actually works',
      hashtags: ['#Motivation', '#5AMClub', '#Success', '#Mindset', '#Hustle', '#GrindMode'],
      viralScore: 0.85,
    },
    {
      title: 'You\'re Not Lazy. You\'re Scared.',
      hook: 'You\'re not lazy. I need you to hear this.',
      script: '[0s] You\'re not lazy. I need you to hear this.\n[3s] That thing you\'ve been putting off? You\'re not avoiding it because you\'re lazy.\n[8s] You\'re avoiding it because you\'re scared of what happens if you actually try.\n[14s] Scared of failing. Scared of succeeding. Scared of change.\n[20s] But here\'s the truth nobody tells you...\n[24s] Fear and excitement feel exactly the same in your body.\n[28s] So maybe you\'re not scared. Maybe you\'re excited.\n[32s] Go do the thing. Now.',
      caption: 'Reframe your fear as excitement. Then watch everything change. 💪',
      cta: 'Follow if you needed to hear this today',
      hashtags: ['#Motivation', '#MentalHealth', '#SelfGrowth', '#Mindset', '#Fear', '#Success'],
      viralScore: 0.89,
    },
  ],
  Gaming: [
    {
      title: 'This Trick Got Me to Immortal in 2 Weeks',
      hook: 'I went from Gold to Immortal in 14 days. Here\'s the one thing I changed.',
      script: '[0s] I went from Gold to Immortal in 14 days. Here\'s the one thing I changed.\n[3s] I stopped playing to win. I started playing to improve.\n[7s] Every death, I asked: what could I have done differently?\n[12s] I recorded every game and watched my mistakes.\n[17s] I focused on ONE agent and mastered every lineup.\n[22s] I warmed up for 30 minutes before every session.\n[27s] The rank didn\'t matter anymore. The skill did.\n[31s] And the rank followed.',
      caption: 'Stop chasing rank. Chase improvement. The rank will follow. 🎮',
      cta: 'Follow for more gaming tips that actually work',
      hashtags: ['#Gaming', '#Valorant', '#GamingTips', '#Ranked', '#ProTips', '#Esports'],
      viralScore: 0.83,
    },
  ],
  Business: [
    {
      title: 'I Made $50K in 30 Days With This Simple Business',
      hook: 'I made $50,000 last month with a business that took me 2 hours to set up.',
      script: '[0s] I made $50,000 last month with a business that took me 2 hours to set up.\n[3s] No, it\'s not dropshipping. No, it\'s not crypto.\n[7s] It\'s AI automation services for small businesses.\n[11s] Step 1: I learned ChatGPT and Zapier in one weekend.\n[16s] Step 2: I reached out to 50 local businesses on LinkedIn.\n[21s] Step 3: I offered to automate their email, scheduling, and customer service.\n[26s] I charge $2,000-$5,000 per client. Got 15 clients in month one.\n[32s] The opportunity is massive. Most businesses don\'t know AI exists yet.',
      caption: 'AI services for small businesses = the biggest opportunity of 2024 💰',
      cta: 'Follow for real business ideas that work right now',
      hashtags: ['#Business', '#Entrepreneur', '#AI', '#SideHustle', '#MakeMoneyOnline', '#Startup'],
      viralScore: 0.88,
    },
  ],
  Horror: [
    {
      title: 'The Door That Shouldn\'t Exist',
      hook: 'There\'s a door in my basement that wasn\'t there yesterday.',
      script: '[0s] There\'s a door in my basement that wasn\'t there yesterday.\n[3s] I\'ve lived in this house for 12 years. I know every inch of it.\n[7s] But last night, I heard scratching from below.\n[11s] When I went down... there it was. A red door. In the concrete wall.\n[16s] I put my ear against it. Something was breathing on the other side.\n[21s] I grabbed the handle. It was warm.\n[25s] I turned it. It was unlocked.\n[28s] What I saw on the other side... I\'ll never forget.\n[32s] Part 2 tomorrow. If I\'m still here.',
      caption: 'Should I open the door? 🚪 Part 2 drops tomorrow...',
      cta: 'Follow for Part 2. Don\'t watch alone.',
      hashtags: ['#Horror', '#Scary', '#CreepyStory', '#HorrorStory', '#Paranormal', '#DontWatchAlone'],
      viralScore: 0.92,
    },
  ],
  Crypto: [
    {
      title: 'This Altcoin Will 100x Before December',
      hook: 'I found the next 100x altcoin. And no, it\'s not what you think.',
      script: '[0s] I found the next 100x altcoin. And no, it\'s not what you think.\n[3s] It\'s not a meme coin. It\'s not on most people\'s radar yet.\n[7s] Here\'s why I\'m so bullish:\n[10s] The team has ex-Google and ex-Meta engineers.\n[14s] They just partnered with 3 Fortune 500 companies.\n[18s] Market cap is only $50 million. Similar projects are at $5 billion.\n[23s] The token unlock schedule is incredibly bullish.\n[27s] I\'m not giving financial advice. But I\'m loading my bags.\n[31s] DYOR. Link in bio.',
      caption: 'Found a gem before the crowd 💎 Not financial advice. Always DYOR.',
      cta: 'Follow for daily crypto alpha',
      hashtags: ['#Crypto', '#Altcoin', '#Bitcoin', '#DeFi', '#CryptoGems', '#100x'],
      viralScore: 0.79,
    },
  ],
  Education: [
    {
      title: 'Study Hack: Remember Everything You Read',
      hook: 'You\'re studying wrong. Here\'s how to remember 90% of everything you read.',
      script: '[0s] You\'re studying wrong. Here\'s how to remember 90% of everything you read.\n[3s] It\'s called the Feynman Technique. And it takes 4 steps.\n[7s] Step 1: Read the topic once.\n[10s] Step 2: Close the book. Explain it like you\'re teaching a 5 year old.\n[15s] Step 3: Find the gaps where you got stuck.\n[19s] Step 4: Go back and fill those gaps. Then explain again.\n[24s] If you can explain it simply, you truly understand it.\n[28s] This is how I went from C student to straight A\'s in one semester.',
      caption: 'The Feynman Technique changed my grades forever 📚 Save this!',
      cta: 'Follow for study hacks that actually work',
      hashtags: ['#StudyTips', '#Education', '#StudyHacks', '#Learning', '#Students', '#ExamTips'],
      viralScore: 0.86,
    },
  ],
};

// Default fallback for niches without specific content
const defaultVariations = [
  {
    title: 'The #1 Secret Nobody Tells You About {niche}',
    hook: 'I spent 5 years learning {niche} the hard way. Here\'s what I wish someone told me on day 1.',
    script: '[0s] I spent 5 years learning {niche} the hard way.\n[3s] Here\'s what I wish someone told me on day 1.\n[7s] The biggest mistake? Trying to learn everything at once.\n[12s] Instead, focus on ONE skill for 30 days straight.\n[17s] Master it. Then move to the next.\n[22s] In 6 months, you\'ll be better than 95% of people.\n[27s] Most people quit after 2 weeks. Don\'t be most people.\n[32s] Start today. Your future self will thank you.',
    caption: 'The secret to mastering anything: focus on ONE thing at a time 🎯',
    cta: 'Follow for more {niche} tips',
    hashtags: ['#{niche}', '#Tips', '#Learning', '#Growth', '#Mindset', '#Success'],
    viralScore: 0.78,
  },
];

export default function AiGeneratorPage() {
  const router = useRouter();
  const [selectedNiche, setSelectedNiche] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedTone, setSelectedTone] = useState('Engaging');
  const [selectedPlatform, setSelectedPlatform] = useState('TikTok');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [variationIndex, setVariationIndex] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [referenceVideo, setReferenceVideo] = useState<any>(null);
  const [activeInputTab, setActiveInputTab] = useState<'text' | 'visual'>('text');
  const [showBillingPopup, setShowBillingPopup] = useState(false);
  const [credits, setCredits] = useState<{ aiCreditsUsed: number; aiCreditsLimit: number }>({ aiCreditsUsed: 0, aiCreditsLimit: 50 });
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedVideoSettings>({
    videoStyle: 'cinematic',
    cameraMotion: 'smooth_zoom',
    subtitleStyle: 'tiktok_bold',
    musicMood: 'epic',
    duration: 30,
    fps: 30,
    resolution: '1080p',
    aspectRatio: '9:16',
    voiceGender: 'female',
    voiceLanguage: 'en',
    subtitleLanguage: 'en',
    autoEmoji: true,
    autoSoundEffect: true,
    autoBackgroundMusic: true,
    autoTransition: true,
    autoHook: true,
  });

  // Fetch user credits on mount
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${API_URL}/subscription/current`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.data) {
          setCredits({
            aiCreditsUsed: res.data.aiCreditsUsed ?? 0,
            aiCreditsLimit: res.data.aiCreditsLimit ?? 50,
          });
        }
      } catch {
        // If API fails, assume free plan with credits used up (force upgrade)
        setCredits({ aiCreditsUsed: 50, aiCreditsLimit: 50 });
      }
    };
    fetchCredits();
  }, []);

  const getVariations = () => {
    if (!selectedNiche) {
      return defaultVariations.map((v) => ({
        ...v,
        title: v.title.replace(/{niche}/g, 'Content'),
        hook: v.hook.replace(/{niche}/g, 'content creation'),
        script: v.script.replace(/{niche}/g, 'content creation'),
        caption: v.caption.replace(/{niche}/g, 'content creation'),
        cta: v.cta.replace(/{niche}/g, 'content creation'),
        hashtags: v.hashtags.map((h) => h.replace(/{niche}/g, 'Content')),
      }));
    }
    const nicheVariations = scriptVariations[selectedNiche];
    if (nicheVariations && nicheVariations.length > 0) {
      return nicheVariations;
    }
    // Use default with niche name replaced
    return defaultVariations.map((v) => ({
      ...v,
      title: v.title.replace(/{niche}/g, selectedNiche),
      hook: v.hook.replace(/{niche}/g, selectedNiche.toLowerCase()),
      script: v.script.replace(/{niche}/g, selectedNiche.toLowerCase()),
      caption: v.caption.replace(/{niche}/g, selectedNiche.toLowerCase()),
      cta: v.cta.replace(/{niche}/g, selectedNiche.toLowerCase()),
      hashtags: v.hashtags.map((h) => h.replace(/{niche}/g, selectedNiche)),
    }));
  };

  const handleGenerate = async () => {
    // Check if user has credits
    if (credits.aiCreditsUsed >= credits.aiCreditsLimit) {
      setShowBillingPopup(true);
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation delay
    const delay = 1500 + Math.random() * 2000;
    setTimeout(() => {
      if (activeInputTab === 'visual') {
        // Generate from visual references
        const visualResult = {
          title: 'AI-Generated Cinematic Video from Your References',
          hook: 'Watch how AI transforms your images into a stunning cinematic video in seconds.',
          script: '[0s] Opening shot — smooth zoom into your reference image with cinematic color grading.\n[3s] AI-generated motion brings your still images to life with parallax effects.\n[8s] Dynamic transitions between scenes, matching the style of your reference video.\n[14s] Professional subtitle animation synced with AI voiceover.\n[20s] B-roll footage seamlessly blended with your reference material.\n[26s] Closing shot with call-to-action and brand elements.\n[30s] End screen with follow prompt.',
          caption: 'Created this entire video using AI + my reference images 🎬✨ The future of content creation is here.',
          cta: 'Follow for more AI video creation tips',
          hashtags: ['#AIVideo', '#ContentCreator', '#VideoEditing', '#AI', '#Cinematic', '#ViralContent'],
          viralScore: 0.84 + Math.random() * 0.1,
          visualMode: true,
          settings: advancedSettings,
          imagesUsed: uploadedImages.length,
          referenceUsed: !!referenceVideo,
        };
        setResult(visualResult);
        toast.success('Video content generated from visual references!');
      } else {
        // Generate from text (existing logic)
        const variations = getVariations();
        const index = variationIndex % variations.length;
        const generated = { ...variations[index] };

        // Add some randomness to viral score
        generated.viralScore = Math.min(0.95, generated.viralScore + (Math.random() * 0.1 - 0.05));

        // If user provided a topic, adjust the title
        if (topic) {
          generated.title = topic.length > 50 ? topic.substring(0, 50) + '...' : topic;
        }

        setResult(generated);
        toast.success('Content generated successfully!');
      }
      setIsGenerating(false);
    }, delay);
  };

  const handleRegenerate = () => {
    setVariationIndex((prev) => prev + 1);
    handleGenerate();
    toast.info('Generating new variation...');
  };

  const handleCreateVideo = () => {
    // Save script data to localStorage for the Create Video page
    localStorage.setItem('viralai-script-data', JSON.stringify(result));
    toast.success('Script loaded! Redirecting to Video Creator...');
    setTimeout(() => {
      router.push('/dashboard/create-video');
    }, 500);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          AI Content Generator
        </h1>
        <p className="text-muted-foreground mt-1">Generate viral scripts, hooks, captions, and hashtags with AI</p>
      </div>

      {/* Billing Popup */}
      <BillingPopup
        isOpen={showBillingPopup}
        onClose={() => setShowBillingPopup(false)}
        creditsUsed={credits.aiCreditsUsed}
        creditsLimit={credits.aiCreditsLimit}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          {/* Input Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
            <button
              onClick={() => setActiveInputTab('text')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeInputTab === 'text' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              <Wand2 className="h-4 w-4" />
              Text Prompt
            </button>
            <button
              onClick={() => setActiveInputTab('visual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeInputTab === 'visual' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              Visual Reference
            </button>
          </div>

          {activeInputTab === 'visual' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Image Upload */}
              <div className="p-5 rounded-2xl border border-border bg-card">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Reference Images
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload images for AI to analyze style, colors, and create cinematic scenes
                </p>
                <ImageUploader
                  images={uploadedImages}
                  onImagesChange={setUploadedImages}
                />
              </div>

              {/* Video Reference Upload */}
              <div className="p-5 rounded-2xl border border-border bg-card">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Film className="h-4 w-4 text-primary" />
                  Reference Video
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload a video for AI to clone editing style, pacing, and transitions
                </p>
                <VideoReferenceUploader
                  video={referenceVideo}
                  onVideoChange={setReferenceVideo}
                />
              </div>

              {/* Advanced Settings */}
              <AdvancedSettings
                settings={advancedSettings}
                onSettingsChange={setAdvancedSettings}
              />

              {/* Generate Button for Visual Mode */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleGenerate}
                disabled={isGenerating || (uploadedImages.length === 0 && !referenceVideo)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating from Visual Reference...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Video from References
                  </>
                )}
              </motion.button>
            </motion.div>
          )}

          {activeInputTab === 'text' && (
          <div className="p-6 rounded-2xl border border-border bg-card">
            <h2 className="font-semibold mb-4">Content Settings</h2>

            {/* Niche Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Select Niche</label>
              <div className="flex flex-wrap gap-2">
                {niches.map((niche) => (
                  <button
                    key={niche}
                    onClick={() => setSelectedNiche(niche)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      selectedNiche === niche
                        ? 'gradient-primary text-white'
                        : 'border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Topic (optional)</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI tools replacing jobs in 2024"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              />
            </div>

            {/* Tone */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Tone</label>
              <div className="flex flex-wrap gap-2">
                {tones.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedTone(tone)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      selectedTone === tone
                        ? 'gradient-primary text-white'
                        : 'border border-border hover:border-primary/50 text-muted-foreground'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Platform</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none transition"
              >
                <option>TikTok</option>
                <option>YouTube Shorts</option>
                <option>Instagram Reels</option>
                <option>Facebook Reels</option>
              </select>
            </div>

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGenerate}
              disabled={!selectedNiche || isGenerating}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Viral Content
                </>
              )}
            </motion.button>
          </div>
          )}

          {/* Advanced Settings (shown in text mode too) */}
          {activeInputTab === 'text' && (
            <AdvancedSettings
              settings={advancedSettings}
              onSettingsChange={setAdvancedSettings}
            />
          )}
        </div>

        {/* Output Panel */}
        <div className="space-y-4">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Viral Score */}
              <div className="p-4 rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Viral Score</span>
                  <span className="text-2xl font-bold text-primary">{Math.round(result.viralScore * 100)}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-primary transition-all"
                    style={{ width: `${result.viralScore * 100}%` }}
                  />
                </div>
              </div>

              {/* Title */}
              <div className="p-4 rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Title</span>
                  </div>
                  <button onClick={() => handleCopy(result.title, 'title')} className="p-1 hover:bg-accent rounded">
                    {copiedField === 'title' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="font-medium">{result.title}</p>
              </div>

              {/* Hook */}
              <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Hook (First 3 Seconds)</span>
                  </div>
                  <button onClick={() => handleCopy(result.hook, 'hook')} className="p-1 hover:bg-accent rounded">
                    {copiedField === 'hook' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="font-medium">{result.hook}</p>
              </div>

              {/* Script */}
              <div className="p-4 rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Full Script</span>
                  </div>
                  <button onClick={() => handleCopy(result.script, 'script')} className="p-1 hover:bg-accent rounded">
                    {copiedField === 'script' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <pre className="text-sm whitespace-pre-wrap text-muted-foreground">{result.script}</pre>
              </div>

              {/* Caption */}
              <div className="p-4 rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Caption</span>
                  <button onClick={() => handleCopy(result.caption, 'caption')} className="p-1 hover:bg-accent rounded">
                    {copiedField === 'caption' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-sm">{result.caption}</p>
              </div>

              {/* Hashtags */}
              <div className="p-4 rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Hashtags</span>
                  </div>
                  <button onClick={() => handleCopy(result.hashtags.join(' '), 'hashtags')} className="p-1 hover:bg-accent rounded">
                    {copiedField === 'hashtags' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-accent transition disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateVideo}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-white hover:opacity-90 transition"
                >
                  <Video className="h-4 w-4" />
                  Create Video
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 rounded-2xl border border-border bg-card">
              {/* Phone Mockup Preview */}
              <div className="w-[200px] h-[360px] rounded-[2rem] border-4 border-foreground/20 bg-gradient-to-br from-card to-muted relative overflow-hidden shadow-2xl">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-foreground/20 rounded-b-xl" />
                
                {/* Screen Content */}
                <div className="absolute inset-3 top-7 rounded-xl bg-gradient-to-br from-primary/10 via-background to-primary/5 flex flex-col overflow-hidden">
                  {/* Video Preview Area */}
                  <div className="flex-1 relative flex items-center justify-center">
                    {/* Animated Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-indigo-600/20 animate-pulse" />
                    
                    {/* Play Button */}
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[10px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1" />
                    </div>

                    {/* Subtitle Preview */}
                    <div className="absolute bottom-8 left-3 right-3 text-center">
                      <div className="inline-block px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                        <p className="text-[9px] text-white font-bold">Your AI video will appear here</p>
                      </div>
                    </div>

                    {/* Side Icons (TikTok style) */}
                    <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20" />
                      <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20" />
                      <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20" />
                      <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20" />
                    </div>
                  </div>

                  {/* Bottom Bar */}
                  <div className="p-2 border-t border-white/5">
                    <div className="h-1.5 w-3/4 rounded-full bg-white/10 mb-1.5" />
                    <div className="h-1.5 w-1/2 rounded-full bg-white/10" />
                  </div>
                </div>
              </div>

              {/* Text Below Mockup */}
              <div className="mt-6 text-center">
                <p className="text-sm font-medium text-foreground">
                  {activeInputTab === 'text' ? 'Generate your viral video' : 'Create from visual references'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                  {activeInputTab === 'text'
                    ? 'Select a niche on the left, then click Generate to create AI content'
                    : 'Upload images or video references, then click Generate'}
                </p>
              </div>

              {/* Quick Stats Preview */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] text-muted-foreground">9:16</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-muted-foreground">30s</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="text-[10px] text-muted-foreground">1080p</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
