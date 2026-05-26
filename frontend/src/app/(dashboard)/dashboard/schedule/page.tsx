'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Clock, Trash2, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleItem {
  id: string;
  title: string;
  platform: string;
  date: string;
  time: string;
  status: 'scheduled' | 'published' | 'failed';
}

const PLATFORMS = ['TikTok', 'YouTube Shorts', 'Instagram Reels', 'Facebook Reels'];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('nuviral-schedules') || '[]'); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formPlatform, setFormPlatform] = useState('TikTok');
  const [formTime, setFormTime] = useState('18:00');

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = new Date().toISOString().split('T')[0];

  const handleAddSchedule = () => {
    if (!formTitle.trim() || !selectedDate) { toast.error('Isi judul dan pilih tanggal'); return; }
    const newSchedule: ScheduleItem = {
      id: `sch-${Date.now()}`,
      title: formTitle.trim(),
      platform: formPlatform,
      date: selectedDate,
      time: formTime,
      status: 'scheduled',
    };
    const updated = [...schedules, newSchedule];
    setSchedules(updated);
    localStorage.setItem('nuviral-schedules', JSON.stringify(updated));
    toast.success('Jadwal ditambahkan!');
    setFormTitle('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    localStorage.setItem('nuviral-schedules', JSON.stringify(updated));
    toast.success('Jadwal dihapus');
  };

  const getSchedulesForDate = (date: string) => schedules.filter(s => s.date === date);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Schedule
          </h1>
          <p className="text-muted-foreground mt-1">Jadwalkan upload konten ke platform sosial media</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setShowForm(true); if (!selectedDate) setSelectedDate(today); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-medium"
        >
          <Plus className="h-4 w-4" />
          Buat Jadwal
        </motion.button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-border bg-card">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-accent transition">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="font-semibold">{MONTHS[currentMonth]} {currentYear}</h3>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-accent transition">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const daySchedules = getSchedulesForDate(dateStr);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center gap-0.5 transition relative ${
                    isSelected ? 'bg-primary text-white' : isToday ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-accent'
                  }`}
                >
                  <span>{day}</span>
                  {daySchedules.length > 0 && (
                    <div className="flex gap-0.5">
                      {daySchedules.slice(0, 3).map((_, idx) => (
                        <div key={idx} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Selected Date Schedules */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="font-semibold mb-3 text-sm">
              {selectedDate ? new Date(selectedDate + 'T00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Pilih tanggal'}
            </h3>

            {selectedDate && getSchedulesForDate(selectedDate).length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada jadwal di tanggal ini</p>
            ) : (
              <div className="space-y-2">
                {selectedDate && getSchedulesForDate(selectedDate).map(sch => (
                  <div key={sch.id} className="flex items-center gap-3 p-3 rounded-xl bg-accent/50 group">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Video className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{sch.title}</p>
                      <p className="text-xs text-muted-foreground">{sch.platform} • {sch.time}</p>
                    </div>
                    <button onClick={() => handleDelete(sch.id)} className="p-1 rounded hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Jadwal Mendatang
            </h3>
            {schedules.filter(s => s.date >= today).length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada jadwal mendatang</p>
            ) : (
              <div className="space-y-2">
                {schedules.filter(s => s.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5).map(sch => (
                  <div key={sch.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{sch.title}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(sch.date + 'T00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {sch.time} • {sch.platform}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Schedule Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-xl mx-4"
          >
            <h2 className="text-lg font-semibold mb-4">Buat Jadwal Upload</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Judul Video</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Nama video yang akan diupload"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Platform</label>
                <select
                  value={formPlatform}
                  onChange={e => setFormPlatform(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary outline-none transition text-sm"
                >
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Tanggal</label>
                  <input
                    type="date"
                    value={selectedDate || ''}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Waktu</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary outline-none transition text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border hover:bg-accent transition font-medium text-sm">
                Batal
              </button>
              <button onClick={handleAddSchedule} className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm hover:opacity-90 transition">
                Simpan Jadwal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
