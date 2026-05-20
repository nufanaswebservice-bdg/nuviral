'use client';

import { motion } from 'framer-motion';
import { BarChart3, Eye, Heart, MessageSquare, Share2, Clock, TrendingUp, Users } from 'lucide-react';

const platformStats = [
  { platform: 'TikTok', views: '1.2M', engagement: '9.2%', followers: '45.2K', color: '#000000' },
  { platform: 'YouTube', views: '890K', engagement: '7.8%', followers: '23.1K', color: '#FF0000' },
  { platform: 'Instagram', views: '456K', engagement: '6.5%', followers: '18.7K', color: '#E4405F' },
  { platform: 'Facebook', views: '234K', engagement: '5.1%', followers: '12.3K', color: '#1877F2' },
];

const topVideos = [
  { title: '5 AI Tools You Need', views: '245K', engagement: '12.3%', platform: 'TikTok' },
  { title: 'Morning Routine Hack', views: '189K', engagement: '10.8%', platform: 'Instagram' },
  { title: 'Crypto Market Update', views: '156K', engagement: '9.5%', platform: 'YouTube' },
  { title: 'Study Tips for Students', views: '134K', engagement: '8.7%', platform: 'TikTok' },
  { title: 'Cooking in 60 Seconds', views: '98K', engagement: '11.2%', platform: 'Facebook' },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Track your content performance across all platforms</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Eye, label: 'Total Views', value: '2.78M', change: '+18%' },
          { icon: Heart, label: 'Total Likes', value: '342K', change: '+12%' },
          { icon: MessageSquare, label: 'Comments', value: '28.4K', change: '+8%' },
          { icon: Share2, label: 'Shares', value: '15.2K', change: '+22%' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl border border-border bg-card"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-green-500 font-medium">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Platform Comparison */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <h2 className="text-lg font-semibold mb-4">Platform Performance</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.map((platform, i) => (
            <motion.div
              key={platform.platform}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl border border-border hover:border-primary/30 transition"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform.color }} />
                <span className="font-medium text-sm">{platform.platform}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Views</span>
                  <span className="font-medium">{platform.views}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Engagement</span>
                  <span className="font-medium">{platform.engagement}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Followers</span>
                  <span className="font-medium">{platform.followers}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Performing Videos */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="text-lg font-semibold mb-4">Top Performing Videos</h2>
          <div className="space-y-3">
            {topVideos.map((video, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-6">#{i + 1}</span>
                  <div>
                    <p className="font-medium text-sm">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.platform}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{video.views}</p>
                  <p className="text-xs text-green-500">{video.engagement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Posting Times */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Best Posting Times
          </h2>
          <div className="space-y-3">
            {[
              { day: 'Tuesday', time: '7:00 PM', score: 95 },
              { day: 'Thursday', time: '12:00 PM', score: 88 },
              { day: 'Saturday', time: '10:00 AM', score: 82 },
              { day: 'Monday', time: '6:00 PM', score: 78 },
              { day: 'Friday', time: '8:00 PM', score: 75 },
            ].map((slot, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{slot.day} at {slot.time}</span>
                    <span className="text-sm text-primary font-medium">{slot.score}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${slot.score}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full gradient-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          AI Recommendations
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            'Post more content on Tuesdays at 7 PM for maximum reach',
            'Your tech niche videos get 3x more engagement — focus there',
            'Videos under 15 seconds perform 40% better on TikTok',
            'Add more hooks with questions — they increase comments by 25%',
            'Cross-post to Instagram Reels — untapped audience potential',
            'Use trending sounds to boost discoverability by 60%',
          ].map((rec, i) => (
            <div key={i} className="p-3 rounded-xl bg-card border border-border">
              <p className="text-sm">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
