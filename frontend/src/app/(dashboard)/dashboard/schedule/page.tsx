'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  Video,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface ScheduledItem {
  id: string;
  title: string;
  platform: string;
  time: string;
  status: 'scheduled' | 'published' | 'failed';
  day: number;
}

const scheduledItems: ScheduledItem[] = [
  { id: '1', title: '5 AI Tools Video', platform: 'TikTok', time: '7:00 PM', status: 'published', day: 3 },
  { id: '2', title: 'Morning Routine', platform: 'Instagram', time: '12:00 PM', status: 'published', day: 5 },
  { id: '3', title: 'Crypto Update', platform: 'YouTube', time: '6:00 PM', status: 'scheduled', day: 8 },
  { id: '4', title: 'Study Tips Part 2', platform: 'TikTok', time: '7:30 PM', status: 'scheduled', day: 10 },
  { id: '5', title: 'Side Hustle Ideas', platform: 'Instagram', time: '5:00 PM', status: 'scheduled', day: 12 },
  { id: '6', title: 'Horror Story #5', platform: 'TikTok', time: '9:00 PM', status: 'scheduled', day: 14 },
  { id: '7', title: 'Motivation Monday', platform: 'Facebook', time: '8:00 AM', status: 'scheduled', day: 15 },
  { id: '8', title: 'Tech News Recap', platform: 'YouTube', time: '3:00 PM', status: 'scheduled', day: 18 },
  { id: '9', title: 'Fitness Challenge', platform: 'Instagram', time: '6:30 PM', status: 'scheduled', day: 20 },
  { id: '10', title: 'AI Workflow Tutorial', platform: 'TikTok', time: '7:00 PM', status: 'scheduled', day: 22 },
];

const bestTimes = [
  { day: 'Monday', time: '6:00 PM', score: 82 },
  { day: 'Tuesday', time: '7:00 PM', score: 95 },
  { day: 'Wednesday', time: '12:00 PM', score: 78 },
  { day: 'Thursday', time: '7:30 PM', score: 91 },
  { day: 'Friday', time: '8:00 PM', score: 85 },
  { day: 'Saturday', time: '10:00 AM', score: 88 },
  { day: 'Sunday', time: '5:00 PM', score: 74 },
];

const platformColors: Record<string, string> = {
  TikTok: 'bg-black text-white',
  YouTube: 'bg-red-500 text-white',
  Instagram: 'bg-pink-500 text-white',
  Facebook: 'bg-blue-500 text-white',
};

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showNewSchedule, setShowNewSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    platform: 'TikTok',
    date: '',
    time: '19:00',
  });

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getItemsForDay = (day: number) => scheduledItems.filter((item) => item.day === day);

  const handleCreateSchedule = () => {
    setShowNewSchedule(false);
    setNewSchedule({ title: '', platform: 'TikTok', date: '', time: '19:00' });
    // In production, this would call the API
    alert(`✅ Scheduled "${newSchedule.title}" on ${newSchedule.platform} at ${newSchedule.time}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Content Schedule
          </h1>
          <p className="text-muted-foreground mt-1">Plan and schedule your content calendar</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowNewSchedule(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-medium"
        >
          <Plus className="h-4 w-4" />
          Schedule Post
        </motion.button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-accent transition">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold">
              {months[currentMonth]} {currentYear}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-accent transition">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 rounded-lg" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const items = getItemsForDay(day);
              const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`h-20 p-1 rounded-lg border text-left transition relative ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : isToday
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-transparent hover:border-border hover:bg-accent/30'
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {items.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className={`text-[9px] px-1 py-0.5 rounded truncate ${platformColors[item.platform] || 'bg-muted'}`}
                      >
                        {item.title}
                      </div>
                    ))}
                    {items.length > 2 && (
                      <span className="text-[9px] text-muted-foreground">+{items.length - 2} more</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Day Details */}
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border border-border bg-card"
            >
              <h3 className="font-semibold mb-3">
                {months[currentMonth]} {selectedDay}, {currentYear}
              </h3>
              {getItemsForDay(selectedDay).length > 0 ? (
                <div className="space-y-3">
                  {getItemsForDay(selectedDay).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Video className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${platformColors[item.platform]}`}>
                            {item.platform}
                          </span>
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                        </div>
                      </div>
                      {item.status === 'published' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {item.status === 'scheduled' && <Clock className="h-4 w-4 text-blue-500" />}
                      {item.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No content scheduled for this day</p>
              )}
            </motion.div>
          )}

          {/* AI Best Times */}
          <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Best Posting Times
            </h3>
            <div className="space-y-2">
              {bestTimes.map((slot) => (
                <div key={slot.day} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-24">{slot.day}</span>
                    <span className="text-xs text-muted-foreground">{slot.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-primary"
                        style={{ width: `${slot.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-primary">{slot.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="font-semibold mb-3">Upcoming Posts</h3>
            <div className="space-y-3">
              {scheduledItems
                .filter((item) => item.status === 'scheduled')
                .slice(0, 5)
                .map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Day {item.day} • {item.time}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${platformColors[item.platform]}`}>
                      {item.platform}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Schedule Modal */}
      {showNewSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-xl mx-4"
          >
            <h2 className="text-lg font-semibold mb-4">Schedule New Post</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Video Title</label>
                <input
                  type="text"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                  placeholder="Enter video title"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Platform</label>
                <select
                  value={newSchedule.platform}
                  onChange={(e) => setNewSchedule({ ...newSchedule, platform: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none transition"
                >
                  <option>TikTok</option>
                  <option>YouTube</option>
                  <option>Instagram</option>
                  <option>Facebook</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <input
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Time</label>
                <input
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewSchedule(false)}
                className="flex-1 py-3 rounded-xl border border-border hover:bg-accent transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSchedule}
                disabled={!newSchedule.title || !newSchedule.date}
                className="flex-1 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                Schedule
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
