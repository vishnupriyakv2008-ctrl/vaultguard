import React, { useState } from 'react';
import { 
  Zap, 
  Plus, 
  Play, 
  CheckCircle2, 
  Clock, 
  Power, 
  Trash2, 
  ArrowRight, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { AutomationRule, ActivityItem } from '../../types';

interface AutomationsViewProps {
  automations: AutomationRule[];
  onUpdateAutomations: (updated: AutomationRule[]) => void;
  onAddActivity: (activity: Omit<ActivityItem, 'id'>) => void;
}

export const AutomationsView: React.FC<AutomationsViewProps> = ({
  automations,
  onUpdateAutomations,
  onAddActivity
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [trigger, setTrigger] = useState('When task is moved to "Completed"');
  const [action, setAction] = useState('Dispatch deployment webhook and notify engineering channel');
  const [testingId, setTestingId] = useState<string | null>(null);

  // Toggle active rule
  const toggleRuleActive = (ruleId: string) => {
    const updated = automations.map(r => 
      r.id === ruleId ? { ...r, active: !r.active } : r
    );
    onUpdateAutomations(updated);
  };

  // Delete rule
  const deleteRule = (ruleId: string) => {
    onUpdateAutomations(automations.filter(r => r.id !== ruleId));
  };

  // Test Run Rule
  const handleTestRun = (rule: AutomationRule) => {
    setTestingId(rule.id);

    setTimeout(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} UTC`;

      // Update rule run count & timestamp
      const updated = automations.map(r => 
        r.id === rule.id 
          ? { ...r, runCount: r.runCount + 1, lastTriggered: `Just now (${timeStr})` }
          : r
      );
      onUpdateAutomations(updated);

      // Add to live activity log
      onAddActivity({
        user: 'Workflow Engine',
        action: `triggered rule [${rule.title}] ->`,
        target: rule.action,
        timestamp: 'Just now',
        type: 'automation'
      });

      setTestingId(null);
    }, 600);
  };

  // Create new rule
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRule: AutomationRule = {
      id: `auto-${Date.now()}`,
      title: title.trim(),
      trigger: trigger.trim(),
      action: action.trim(),
      active: true,
      runCount: 0,
      lastTriggered: 'Never'
    };

    onUpdateAutomations([...automations, newRule]);
    setShowCreateModal(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Workflows & Event Automations</h1>
          <p className="text-xs text-neutral-400 mt-0.5">Automated pipelines triggered on state mutations and system hooks</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Workflow Rule</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automations.map((rule) => {
          const isRunning = testingId === rule.id;

          return (
            <div
              key={rule.id}
              className={`rounded-xl border p-5 transition-all flex flex-col justify-between space-y-4 ${
                rule.active
                  ? 'bg-neutral-900 border-neutral-800'
                  : 'bg-neutral-900/50 border-neutral-800/60 opacity-60'
              }`}
            >
              <div className="space-y-3">
                {/* Title & Active Toggle */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${rule.active ? 'bg-indigo-500/10 text-indigo-400' : 'bg-neutral-800 text-neutral-500'}`}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white leading-snug">{rule.title}</h3>
                      <span className="font-mono text-[10px] text-neutral-500">{rule.id}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleRuleActive(rule.id)}
                    title={rule.active ? "Pause rule" : "Activate rule"}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      rule.active
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Trigger & Action Flow */}
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-2">
                    <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider shrink-0 mt-0.5">WHEN:</span>
                    <span className="text-neutral-200">{rule.trigger}</span>
                  </div>

                  <div className="flex justify-center -my-1">
                    <ArrowRight className="w-3 h-3 text-neutral-600 rotate-90" />
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-2">
                    <span className="font-mono text-[10px] text-indigo-400 uppercase tracking-wider shrink-0 mt-0.5">THEN:</span>
                    <span className="text-neutral-300">{rule.action}</span>
                  </div>
                </div>
              </div>

              {/* Footer: Runs, Last Triggered, Test Button */}
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                <div className="space-y-0.5 text-[11px] text-neutral-400">
                  <div className="font-mono tabular-nums font-medium text-neutral-300">
                    {rule.runCount} total executions
                  </div>
                  <div>Last: {rule.lastTriggered}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTestRun(rule)}
                    disabled={isRunning}
                    title="Simulate rule execution"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition-colors disabled:opacity-50"
                  >
                    <Play className={`w-3 h-3 ${isRunning ? 'animate-spin text-indigo-400' : 'text-neutral-400'}`} />
                    <span>{isRunning ? 'Running...' : 'Test Run'}</span>
                  </button>

                  <button
                    onClick={() => deleteRule(rule.id)}
                    title="Delete rule"
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-5 z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Create Automation Workflow</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Workflow Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Notify on Service Degradation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Trigger Event (WHEN)</label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="When service status changes to 'Degraded'">When service status changes to 'Degraded'</option>
                  <option value="When task priority is marked 'Urgent'">When task priority is marked 'Urgent'</option>
                  <option value="When new table record is inserted">When new table record is inserted</option>
                  <option value="On daily schedule at 00:00 UTC">On daily schedule at 00:00 UTC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Action (THEN)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Post Slack alert & open incident ticket"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  Save Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
