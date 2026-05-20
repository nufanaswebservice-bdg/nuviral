'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Hash,
  Music,
  Search,
  Loader2,
  Flame,
  BarChart3,
  Users,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

const platforms = ['TikTok', 'YouTube Shorts', 'Instagram Reels', 'Facebook Reels'];

const trendingTopics = [
  { keyword: 'AI Tools 2024', volume: '2.4M', growth: '+340%', viralScore: 0.95, category: 'Tech' },
  { keyword: 'Morning Routine', volume: '1.8M', growth: '+120%', viralScore: 0.88, category: 'Lifestyle' },
  { keyword: 'Side Hustle Ideas', volume: '1.5M', growth: '+95%', viralScore: 0.85, category: 'Business' },
  { keyword: 'Study Tips', volume: '1.2M', growth: '+78%', viralScore: 0.82, category: 'Education' },
  { keyword: 'Crypto Bull Run', volume: '980K', growth: '+210%', viralScore: 0.79, category: 'Crypto' },
  { keyword: 'Anime Edits', volume: '890K', growth: '+65%', viralScore: 0.77, category: 'Anime' },
  { keyword: 'Gym Motivation', volume: '750K', growth: '+45%', viralScore: 0.74, category: 'Fitness' },
  { keyword: 'Horror Stories', volume: '620K', growth: '+88%', viralScore: 0.81, category: 'Horror' },
];

const trendingHashtags = [
  { tag: '#fyp', views: '50B+', trend: 'stable' },
  { tag: '#viral', views: '30B+', trend: 'up' },
  { tag: '#ai', views: '5.2B', trend: 'up' },
  { tag: '#motivation', views: '4.8B', trend: 'stable' },
  { tag: '#tech', views: '3.9B', trend: 'up' },
  { tag: '#business', views: '3.2B', trend: 'up' },
  { tag: '#storytime', views: '2.8B', trend: 'up' },
  { tag: '#lifehack', views: '2.5B', trend: 'stable' },
  { tag: '#crypto', views: '2.1B', trend: 'up' },
  { tag: '#gaming', views: '1.9B', trend: 'stable' },
  { tag: '#fitness', views: '1.7B', trend: 'up' },
  { tag: '#comedy', views: '1.5B', trend: 'stable' },
];

const trendingSounds = [
  { name: 'Original Sound - Motivation Daily', uses: '1.2M', trend: 'up' },
  { name: 'Blade Runner 2049 - Ambient', uses: '890K', trend: 'up' },
  { name: 'Money Rain - Sound Effect', uses: '750K', trend: 'up' },
  { name: 'Suspense Horror BGM', uses: '620K', trend: 'up' },
  { name: 'Lo-fi Study Beats', uses: '580K', trend: 'stable' },
  { name: 'Epic Cinematic Trailer', uses: '450K', trend: 'up' },
];

export default function TrendsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('TikTok');
  const [competitorUsername, setCompetitorUsername] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [competitorResult, setCompetitorResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'topics' | 'hashtags' | 'sounds' | 'competitor'>('topics');

  const handleAnalyzeCompetitor = () => {
    if (!competitorUsername.trim()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      setCompetitorResult({
        username: competitorUsername,
        platform: selectedPlatform,
        followers: '245K',
        avgViews: '89K',
        avgEngagement: '8.4%',
        postingFrequency: '2-3 videos per day',
        contentThemes: ['AI & Tech', 'Productivity', 'Side Hustles', 'Motivation'],
        hookStyles: ['Curiosity Gap', 'Controversial Statement', 'Story Opening'],
        hashtagStrategy: 'Mix of trending (3-5) + niche (5-8) + branded (1-2)',
        bestPerformingTime: 'Tuesday & Thursday, 7-9 PM',
        strengths: [
          'Strong hooks that stop scrolling',
          'Consistent posting schedule',
          'Great use of trending sounds',
          'Clear CTA in every video',
        ],
        weaknesses: [
          'Captions could be more engaging',
          'Not leveraging carousel posts',
          'Missing cross-platform strategy',
          'No community engagement in comments',
        ],
        recommendations: [
          'Use their hook style but add your unique angle',
          'Post at similar times but test 30 min earlier',
          'Cover similar topics with deeper insights',
          'Engage with their audience in comments',
          'Use their trending hashtags + add niche ones',
        ],
      });
      setIsAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Trend Analyzer
        </h1>
        <p className="text-muted-foreground mt-1">Discover viral trends, hashtags, and competitor strategies</p>
      </div>

      {/* Platform Selector */}
      <div className="flex gap-2">
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              selectedPlatform === platform
                ? 'gradient-primary text-white'
                : 'border border-border hover:bg-accent text-muted-foreground'
            }`}
          >
            {platform}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
        {[
          { id: 'topics', label: 'Trending Topics', icon: Flame },
          { id: 'hashtags', label: 'Hashtags', icon: Hash },
          { id: 'sounds', label: 'Sounds', icon: Music },
          { id: 'competitor', label: 'Competitor', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'topics' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Trending Topics on {selectedPlatform}</h2>
              <span className="text-xs text-muted-foreground">Updated 2 hours ago</span>
            </div>
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <motion.div
                  key={topic.keyword}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition"
                >
                  <span className="text-lg font-bold text-muted-foreground w-8">#{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{topic.keyword}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{topic.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{topic.volume} searches</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-500 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      {topic.growth}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full gradient-primary"
                          style={{ width: `${topic.viralScore * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{Math.round(topic.viralScore * 100)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Content Ideas */}
          <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Content Ideas Based on Trends
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                '"5 AI Tools That Will Replace Your Job" — Hook: Curiosity + Fear',
                '"I Tried the Viral Morning Routine for 30 Days" — Hook: Personal Story',
                '"How I Made $5K This Week With a Side Hustle" — Hook: Results',
                '"The Study Hack That Got Me Straight A\'s" — Hook: Transformation',
                '"This Crypto Will 10x Before December" — Hook: Prediction',
                '"The Scariest Thing Happened at 3 AM" — Hook: Suspense',
              ].map((idea, i) => (
                <div key={i} className="p-3 rounded-xl bg-card border border-border text-sm">
                  {idea}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'hashtags' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-border bg-card"
        >
          <h2 className="text-lg font-semibold mb-4">Viral Hashtags on {selectedPlatform}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {trendingHashtags.map((hashtag, index) => (
              <motion.div
                key={hashtag.tag}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/30 transition"
              >
                <div>
                  <p className="font-medium text-primary">{hashtag.tag}</p>
                  <p className="text-xs text-muted-foreground">{hashtag.views} views</p>
                </div>
                {hashtag.trend === 'up' && (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-muted/50">
            <h3 className="text-sm font-medium mb-2">💡 Hashtag Strategy Tip</h3>
            <p className="text-sm text-muted-foreground">
              Use 3-5 trending hashtags + 5-8 niche-specific hashtags + 1-2 branded hashtags.
              Total 10-15 hashtags per post for optimal reach on {selectedPlatform}.
            </p>
          </div>
        </motion.div>
      )}

      {activeTab === 'sounds' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-border bg-card"
        >
          <h2 className="text-lg font-semibold mb-4">Trending Sounds on {selectedPlatform}</h2>
          <div className="space-y-3">
            {trendingSounds.map((sound, index) => (
              <motion.div
                key={sound.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{sound.name}</p>
                  <p className="text-xs text-muted-foreground">{sound.uses} videos using this sound</p>
                </div>
                <div className="flex items-center gap-1 text-green-500">
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="text-xs font-medium">Trending</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-muted/50">
            <h3 className="text-sm font-medium mb-2">🎵 Sound Strategy Tip</h3>
            <p className="text-sm text-muted-foreground">
              Using trending sounds can boost your video&apos;s discoverability by up to 60%.
              The algorithm favors content that uses popular audio tracks.
            </p>
          </div>
        </motion.div>
      )}

      {activeTab === 'competitor' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Search */}
          <div className="p-6 rounded-2xl border border-border bg-card">
            <h2 className="text-lg font-semibold mb-4">Analyze Competitor</h2>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={competitorUsername}
                  onChange={(e) => setCompetitorUsername(e.target.value)}
                  placeholder="Enter username (e.g., @garyvee)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeCompetitor()}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyzeCompetitor}
                disabled={!competitorUsername.trim() || isAnalyzing}
                className="px-6 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Analyze'}
              </motion.button>
            </div>
          </div>

          {/* Results */}
          {competitorResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Overview */}
              <div className="p-6 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-white font-bold">@</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">@{competitorResult.username}</h3>
                    <p className="text-sm text-muted-foreground">{competitorResult.platform}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground">Followers</p>
                    <p className="text-lg font-bold">{competitorResult.followers}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground">Avg Views</p>
                    <p className="text-lg font-bold">{competitorResult.avgViews}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground">Engagement</p>
                    <p className="text-lg font-bold">{competitorResult.avgEngagement}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground">Frequency</p>
                    <p className="text-lg font-bold text-sm">{competitorResult.postingFrequency}</p>
                  </div>
                </div>
              </div>

              {/* Strategy Details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-border bg-card">
                  <h4 className="font-semibold mb-3 text-green-500">✅ Strengths</h4>
                  <ul className="space-y-2">
                    {competitorResult.strengths.map((s: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-5 rounded-2xl border border-border bg-card">
                  <h4 className="font-semibold mb-3 text-amber-500">⚠️ Weaknesses</h4>
                  <ul className="space-y-2">
                    {competitorResult.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Content Themes & Hook Styles */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-border bg-card">
                  <h4 className="font-semibold mb-3">Content Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {competitorResult.contentThemes.map((theme: string) => (
                      <span key={theme} className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-border bg-card">
                  <h4 className="font-semibold mb-3">Hook Styles Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {competitorResult.hookStyles.map((style: string) => (
                      <span key={style} className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-sm">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Recommendations
                </h4>
                <ul className="space-y-2">
                  {competitorResult.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {!competitorResult && !isAnalyzing && (
            <div className="p-12 rounded-2xl border border-dashed border-border text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Enter a competitor&apos;s username to analyze their strategy</p>
              <p className="text-sm text-muted-foreground/60 mt-1">AI will break down their content, hooks, and growth tactics</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
