import React from 'react';
import { 
  CheckSquare, 
  Table, 
  FileText, 
  Zap, 
  ArrowRight, 
  Plus, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Server,
  Layers,
  Sparkles
} from 'lucide-react';
import { AppBaseState, ModuleType, ProjectTask, DocPage, TableRow } from '../../types';

interface OverviewViewProps {
  state: AppBaseState;
  onSelectModule: (module: ModuleType) => void;
  onSelectDoc: (docId: string) => void;
  onOpenNewModal: (type?: 'task' | 'row' | 'doc') => void;
  onToggleTaskStatus: (taskId: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  state,
  onSelectModule,
  onSelectDoc,
  onOpenNewModal,
  onToggleTaskStatus
}) => {
  const currentWs = state.workspaces.find(w => w.id === state.currentWorkspaceId) || state.workspaces[0];
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = state.tasks.filter(t => t.status === 'in_progress' || t.status === 'review');
  const sprintProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const currentTable = state.tables[0];
  const activeServices = currentTable?.rows.filter(r => r.status === 'Active').length || 0;
  const totalServices = currentTable?.rows.length || 0;

  const totalRuns = state.automations.reduce((acc, a) => acc + a.runCount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Workspace Banner / Hero Anchor */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium mb-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Workspace Base</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-neutral-400">Sprint Cadence Active</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            {currentWs.name}
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            {currentWs.description}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onOpenNewModal('task')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
          <button
            onClick={() => onSelectModule('tables')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition-colors"
          >
            <span>View Tables</span>
            <ArrowRight className="w-3 h-3 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* 4 Quantitative Metric Pillars (Zero-Pill, Tabular Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Sprint Completion</span>
            <CheckSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
              {sprintProgress}%
            </span>
            <span className="text-xs text-neutral-400 font-mono tabular-nums">
              {completedTasks}/{totalTasks} tasks
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${sprintProgress}%` }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Production Services</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
              {activeServices}
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              Nominal ({totalServices} total)
            </span>
          </div>
          <div className="text-[11px] text-neutral-400">
            High availability across 3 clusters
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Technical RFCs & Specs</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
              {state.docs.length}
            </span>
            <span className="text-xs text-neutral-400 font-mono tabular-nums">
              {state.docs.reduce((acc, d) => acc + d.wordCount, 0)} words
            </span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Peer reviewed architecture guidelines
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Automations Executed</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
              {totalRuns}
            </span>
            <span className="text-xs text-cyan-400 font-medium">
              4 Active Rules
            </span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Zero pipeline execution errors
          </div>
        </div>
      </div>

      {/* Main Grid: Active Sprints & Recent Docs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active Tasks & Services */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Sprint Tasks */}
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Active Sprint Queue</h2>
                <p className="text-xs text-neutral-400">Tasks currently in execution and peer review</p>
              </div>
              <button
                onClick={() => onSelectModule('kanban')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>Open Kanban Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-neutral-800/80">
              {inProgressTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500">
                  All active sprint items completed. Create a new task to continue.
                </div>
              ) : (
                inProgressTasks.slice(0, 4).map((task) => (
                  <div 
                    key={task.id} 
                    className="p-3.5 hover:bg-neutral-800/40 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => onToggleTaskStatus(task.id)}
                        title="Mark task as done"
                        className="mt-0.5 w-4 h-4 rounded border border-neutral-600 hover:border-indigo-400 flex items-center justify-center transition-colors shrink-0"
                      >
                        <span className="sr-only">Toggle</span>
                      </button>

                      <div className="min-w-0">
                        <div className="text-xs font-medium text-neutral-200 truncate">
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                          <span>{task.assignee.name}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{task.estimatePoints} pts</span>
                          <span aria-hidden="true">·</span>
                          <span>Due {task.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] font-mono uppercase tracking-wider ${
                        task.priority === 'urgent' ? 'text-rose-400 font-semibold' :
                        task.priority === 'high' ? 'text-amber-400' :
                        'text-neutral-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Table Services Snapshot */}
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Platform Services Directory</h2>
                <p className="text-xs text-neutral-400">{currentTable.name}</p>
              </div>
              <button
                onClick={() => onSelectModule('tables')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>Full Spreadsheet View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-950/40">
                    <th className="py-2.5 px-4 font-medium">Service</th>
                    <th className="py-2.5 px-4 font-medium">Status</th>
                    <th className="py-2.5 px-4 font-medium">Domain</th>
                    <th className="py-2.5 px-4 font-medium">Lead</th>
                    <th className="py-2.5 px-4 font-medium text-right">Replicas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {currentTable.rows.slice(0, 4).map((row) => (
                    <tr key={row.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-neutral-200 truncate max-w-[180px]">
                        {row.service}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`text-[11px] font-medium ${
                          row.status === 'Active' ? 'text-emerald-400' :
                          row.status === 'Degraded' ? 'text-rose-400' :
                          'text-amber-400'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-neutral-400">{row.category}</td>
                      <td className="py-2.5 px-4 text-neutral-300">{row.lead}</td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-neutral-300">
                        {row.replicas}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Docs & Workspace Activity */}
        <div className="space-y-6">
          {/* Recent Technical Docs */}
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Notebook & RFCs</h2>
                <p className="text-xs text-neutral-400">Architecture decisions and runbooks</p>
              </div>
              <button
                onClick={() => onSelectModule('docs')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 space-y-2">
              {state.docs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    onSelectModule('docs');
                    onSelectDoc(doc.id);
                  }}
                  className="w-full text-left p-3 rounded-lg bg-neutral-950/40 hover:bg-neutral-800/60 border border-neutral-800/60 hover:border-neutral-700/60 transition-colors group space-y-1"
                >
                  <div className="text-xs font-semibold text-neutral-200 group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {doc.title}
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {doc.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 pt-1">
                    <span>{doc.tags.join(' · ')}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{doc.wordCount} words</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Quick Execution
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenNewModal('task')}
                className="p-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-indigo-400 mb-1.5" />
                <div className="text-xs font-medium text-neutral-200">New Task</div>
                <div className="text-[10px] text-neutral-400">Sprint planning</div>
              </button>

              <button
                onClick={() => onOpenNewModal('row')}
                className="p-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left transition-colors"
              >
                <Table className="w-4 h-4 text-emerald-400 mb-1.5" />
                <div className="text-xs font-medium text-neutral-200">New Record</div>
                <div className="text-[10px] text-neutral-400">Database entry</div>
              </button>

              <button
                onClick={() => onOpenNewModal('doc')}
                className="p-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left transition-colors"
              >
                <FileText className="w-4 h-4 text-amber-400 mb-1.5" />
                <div className="text-xs font-medium text-neutral-200">New RFC</div>
                <div className="text-[10px] text-neutral-400">Technical spec</div>
              </button>

              <button
                onClick={() => onSelectModule('automations')}
                className="p-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left transition-colors"
              >
                <Zap className="w-4 h-4 text-cyan-400 mb-1.5" />
                <div className="text-xs font-medium text-neutral-200">Automations</div>
                <div className="text-[10px] text-neutral-400">Manage rules</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
