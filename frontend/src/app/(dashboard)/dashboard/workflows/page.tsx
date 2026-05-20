'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Workflow,
  Plus,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Loader2,
  Sparkles,
  Video,
  Upload,
  BarChart3,
  Calendar,
  ArrowRight,
  Trash2,
  Copy,
} from 'lucide-react';

interface WorkflowItem {
  id: string;
  name: string;
  steps: WorkflowStep[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: string;
  runsCount: number;
}

interface WorkflowStep {
  id: string;
  type: 'generate_script' | 'generate_video' | 'render' | 'schedule' | 'publish' | 'analyze';
  label: string;
  icon: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  config?: Record<string, string>;
}

const stepTypes = [
  { type: 'generate_script', label: 'Generate Script', icon: Sparkles, color: 'from-violet-500 to-purple-500' },
  { type: 'generate_video', label: 'Generate Video', icon: Video, color: 'from-blue-500 to-cyan-500' },
  { type: 'render', label: 'Render Video', icon: Play, color: 'from-amber-500 to-orange-500' },
  { type: 'schedule', label: 'Schedule Upload', icon: Calendar, color: 'from-green-500 to-emerald-500' },
  { type: 'publish', label: 'Publish Content', icon: Upload, color: 'from-pink-500 to-rose-500' },
  { type: 'analyze', label: 'Analyze Results', icon: BarChart3, color: 'from-indigo-500 to-blue-500' },
];

const initialWorkflows: WorkflowItem[] = [
  {
    id: '1',
    name: 'Daily Tech Content Pipeline',
    status: 'completed',
    lastRun: '2 hours ago',
    runsCount: 24,
    steps: [
      { id: 's1', type: 'generate_script', label: 'Generate Script', icon: Sparkles, status: 'completed', config: { niche: 'Tech', tone: 'Engaging' } },
      { id: 's2', type: 'generate_video', label: 'Generate Video', icon: Video, status: 'completed', config: { template: 'Modern Minimal' } },
      { id: 's3', type: 'render', label: 'Render Video', icon: Play, status: 'completed', config: { quality: '1080p' } },
      { id: 's4', type: 'publish', label: 'Publish to TikTok', icon: Upload, status: 'completed', config: { platform: 'TikTok' } },
      { id: 's5', type: 'analyze', label: 'Track Analytics', icon: BarChart3, status: 'completed' },
    ],
  },
  {
    id: '2',
    name: 'Weekly Motivation Series',
    status: 'idle',
    lastRun: '1 day ago',
    runsCount: 8,
    steps: [
      { id: 's1', type: 'generate_script', label: 'Generate Script', icon: Sparkles, status: 'pending', config: { niche: 'Motivation', tone: 'Dramatic' } },
      { id: 's2', type: 'generate_video', label: 'Generate Video', icon: Video, status: 'pending', config: { template: 'Cinematic' } },
      { id: 's3', type: 'render', label: 'Render Video', icon: Play, status: 'pending', config: { quality: '1080p' } },
      { id: 's4', type: 'schedule', label: 'Schedule for Monday', icon: Calendar, status: 'pending', config: { time: '7:00 PM' } },
    ],
  },
  {
    id: '3',
    name: 'Multi-Platform Batch Upload',
    status: 'idle',
    lastRun: '3 days ago',
    runsCount: 5,
    steps: [
      { id: 's1', type: 'publish', label: 'Upload to TikTok', icon: Upload, status: 'pending', config: { platform: 'TikTok' } },
      { id: 's2', type: 'publish', label: 'Upload to YouTube', icon: Upload, status: 'pending', config: { platform: 'YouTube' } },
      { id: 's3', type: 'publish', label: 'Upload to Instagram', icon: Upload, status: 'pending', config: { platform: 'Instagram' } },
      { id: 's4', type: 'analyze', label: 'Track All Platforms', icon: BarChart3, status: 'pending' },
    ],
  },
];

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(initialWorkflows);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', steps: [] as string[] });

  const handleRunWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== id) return wf;
        return {
          ...wf,
          status: 'running' as const,
          steps: wf.steps.map((s, i) => ({ ...s, status: i === 0 ? 'processing' as const : 'pending' as const })),
        };
      })
    );

    // Simulate step-by-step execution
    const wf = workflows.find((w) => w.id === id);
    if (!wf) return;

    wf.steps.forEach((_, index) => {
      setTimeout(() => {
        setWorkflows((prev) =>
          prev.map((w) => {
            if (w.id !== id) return w;
            const newSteps = w.steps.map((s, i) => {
              if (i < index) return { ...s, status: 'completed' as const };
              if (i === index) return { ...s, status: 'processing' as const };
              return { ...s, status: 'pending' as const };
            });
            return { ...w, steps: newSteps };
          })
        );
      }, (index + 1) * 2000);
    });

    // Complete all
    setTimeout(() => {
      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== id) return w;
          return {
            ...w,
            status: 'completed' as const,
            lastRun: 'Just now',
            runsCount: w.runsCount + 1,
            steps: w.steps.map((s) => ({ ...s, status: 'completed' as const })),
          };
        })
      );
    }, (wf.steps.length + 1) * 2000);
  };

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name || newWorkflow.steps.length === 0) return;

    const newWf: WorkflowItem = {
      id: Date.now().toString(),
      name: newWorkflow.name,
      status: 'idle',
      runsCount: 0,
      steps: newWorkflow.steps.map((type, i) => {
        const stepDef = stepTypes.find((s) => s.type === type)!;
        return {
          id: `s${i + 1}`,
          type: type as any,
          label: stepDef.label,
          icon: stepDef.icon,
          status: 'pending' as const,
        };
      }),
    };

    setWorkflows((prev) => [newWf, ...prev]);
    setNewWorkflow({ name: '', steps: [] });
    setShowCreate(false);
  };

  const handleDeleteWorkflow = (id: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  };

  const toggleStep = (type: string) => {
    setNewWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.includes(type)
        ? prev.steps.filter((s) => s !== type)
        : [...prev.steps, type],
    }));
  };

  const activeWorkflow = workflows.find((w) => w.id === selectedWorkflow);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            AI Workflows
          </h1>
          <p className="text-muted-foreground mt-1">Automate your content pipeline from script to publish</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-medium"
        >
          <Plus className="h-4 w-4" />
          Create Workflow
        </motion.button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Workflow List */}
        <div className="lg:col-span-2 space-y-4">
          {workflows.map((wf, index) => (
            <motion.div
              key={wf.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedWorkflow(wf.id)}
              className={`p-5 rounded-2xl border bg-card transition cursor-pointer ${
                selectedWorkflow === wf.id ? 'border-primary' : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{wf.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`flex items-center gap-1 text-xs font-medium ${
                      wf.status === 'completed' ? 'text-green-500' :
                      wf.status === 'running' ? 'text-blue-500' :
                      'text-muted-foreground'
                    }`}>
                      {wf.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                      {wf.status === 'running' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {wf.status === 'idle' && <Clock className="h-3 w-3" />}
                      {wf.status.charAt(0).toUpperCase() + wf.status.slice(1)}
                    </span>
                    {wf.lastRun && <span className="text-xs text-muted-foreground">Last run: {wf.lastRun}</span>}
                    <span className="text-xs text-muted-foreground">{wf.runsCount} runs</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); handleRunWorkflow(wf.id); }}
                    disabled={wf.status === 'running'}
                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition disabled:opacity-50"
                  >
                    {wf.status === 'running' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </motion.button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteWorkflow(wf.id); }}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>

              {/* Steps Preview */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {wf.steps.map((step, i) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                        step.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                        step.status === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {step.status === 'processing' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : step.status === 'completed' ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <StepIcon className="h-3 w-3" />
                        )}
                        {step.label}
                      </div>
                      {i < wf.steps.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground mx-1 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {workflows.length === 0 && (
            <div className="p-12 rounded-2xl border border-dashed border-border text-center">
              <Workflow className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No workflows yet</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Create your first automation pipeline</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          {activeWorkflow ? (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-5 rounded-2xl border border-border bg-card"
            >
              <h3 className="font-semibold mb-4">{activeWorkflow.name}</h3>
              <div className="space-y-3">
                {activeWorkflow.steps.map((step, i) => {
                  const StepIcon = step.icon;
                  const stepDef = stepTypes.find((s) => s.type === step.type);
                  return (
                    <div key={step.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stepDef?.color || 'from-gray-500 to-slate-500'} flex items-center justify-center`}>
                          {step.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : step.status === 'processing' ? (
                            <Loader2 className="h-4 w-4 text-white animate-spin" />
                          ) : (
                            <StepIcon className="h-4 w-4 text-white" />
                          )}
                        </div>
                        {i < activeWorkflow.steps.length - 1 && (
                          <div className={`w-0.5 h-6 mt-1 ${step.status === 'completed' ? 'bg-green-500' : 'bg-border'}`} />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm font-medium">{step.label}</p>
                        {step.config && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(step.config).map(([key, value]) => (
                              <span key={key} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex gap-2">
                <button
                  onClick={() => handleRunWorkflow(activeWorkflow.id)}
                  disabled={activeWorkflow.status === 'running'}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  Run Now
                </button>
                <button className="p-2.5 rounded-xl border border-border hover:bg-accent transition">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-border text-center">
              <Workflow className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a workflow to see details</p>
            </div>
          )}

          {/* How it works */}
          <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              How Workflows Work
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                Create a workflow with multiple steps
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                Click "Run" to execute all steps automatically
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                Each step feeds into the next (script → video → render → publish)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                Monitor progress in real-time
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create Workflow Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg p-6 rounded-2xl border border-border bg-card shadow-xl mx-4"
          >
            <h2 className="text-lg font-semibold mb-4">Create New Workflow</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Workflow Name</label>
                <input
                  type="text"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  placeholder="e.g., Daily Content Pipeline"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select Steps (in order)</label>
                <div className="grid grid-cols-2 gap-2">
                  {stepTypes.map((step) => {
                    const isSelected = newWorkflow.steps.includes(step.type);
                    const StepIcon = step.icon;
                    return (
                      <button
                        key={step.type}
                        onClick={() => toggleStep(step.type)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left transition ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                          <StepIcon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{step.label}</p>
                          {isSelected && (
                            <p className="text-[10px] text-primary">Step #{newWorkflow.steps.indexOf(step.type) + 1}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {newWorkflow.steps.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Pipeline Preview</label>
                  <div className="flex items-center gap-1 flex-wrap p-3 rounded-xl bg-muted/50">
                    {newWorkflow.steps.map((type, i) => {
                      const step = stepTypes.find((s) => s.type === type)!;
                      return (
                        <div key={`${type}-${i}`} className="flex items-center">
                          <span className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary font-medium">
                            {step.label}
                          </span>
                          {i < newWorkflow.steps.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground mx-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreate(false); setNewWorkflow({ name: '', steps: [] }); }}
                className="flex-1 py-3 rounded-xl border border-border hover:bg-accent transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkflow}
                disabled={!newWorkflow.name || newWorkflow.steps.length === 0}
                className="flex-1 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                Create Workflow
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
