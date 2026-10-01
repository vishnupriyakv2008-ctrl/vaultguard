import React from 'react';
import { 
  LayoutDashboard, 
  Table, 
  Kanban, 
  FileText, 
  BarChart3, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  RotateCcw,
  Sparkles,
  HardDrive
} from 'lucide-react';
import { ModuleType, DocPage, TableSchema, ProjectTask } from '../types';

interface SidebarProps {
  activeModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  tasks: ProjectTask[];
  tables: TableSchema[];
  docs: DocPage[];
  onSelectDoc: (docId: string) => void;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  collapsed,
  onToggleCollapse,
  tasks,
  tables,
  docs,
  onSelectDoc,
  onResetData
}) => {
  const pendingTasksCount = tasks.filter(t => t.status !== 'done').length;
  const favoriteDocs = docs.filter(d => d.favorite);

  const navItems = [
    {
      id: 'overview' as ModuleType,
      label: 'Workspace Overview',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'tables' as ModuleType,
      label: 'Relational Tables',
      shortLabel: 'Tables',
      icon: Table,
      badge: tables.length
    },
    {
      id: 'kanban' as ModuleType,
      label: 'Sprint Board & Tasks',
      shortLabel: 'Tasks',
      icon: Kanban,
      badge: pendingTasksCount
    },
    {
      id: 'docs' as ModuleType,
      label: 'Notebook & RFCs',
      shortLabel: 'Docs',
      icon: FileText,
      badge: docs.length
    },
    {
      id: 'metrics' as ModuleType,
      label: 'Telemetry & Metrics',
      shortLabel: 'Metrics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'automations' as ModuleType,
      label: 'Workflows & Rules',
      shortLabel: 'Workflows',
      icon: Zap,
      badge: null
    }
  ];

  return (
    <aside 
      className={`h-[calc(100vh-3.5rem)] sticky top-14 bg-neutral-900 border-r border-neutral-800 transition-all duration-200 z-20 flex flex-col justify-between shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="p-3 overflow-y-auto overflow-x-hidden flex-1">
        {/* Navigation list */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-2 py-1 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              Modules
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Icon 
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-neutral-500 group-hover:text-neutral-300'
                  }`} 
                />

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between truncate text-left">
                    <span className="truncate">{item.label}</span>
                    {item.badge !== null && (
                      <span className={`px-1.5 py-0.2 font-mono text-[10px] rounded tabular-nums ${
                        isActive ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-500 rounded-r-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Pinned Favorites Section */}
        {!collapsed && favoriteDocs.length > 0 && (
          <div className="mt-6 pt-4 border-t border-neutral-800/80">
            <div className="flex items-center justify-between px-2 mb-2 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                Pinned RFCs
              </span>
            </div>
            <div className="space-y-0.5">
              {favoriteDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    onSelectModule('docs');
                    onSelectDoc(doc.id);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 transition-colors truncate flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="truncate">{doc.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer controls: Collapse button + Reset Data */}
      <div className="p-3 border-t border-neutral-800/80 bg-neutral-900/50 space-y-1.5">
        {!collapsed && (
          <div className="px-2 py-1 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3 h-3 text-indigo-400" />
              Local Storage
            </span>
            <span className="font-mono tabular-nums text-neutral-400">Sync Active</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={onResetData}
            title="Reset to default workspace dataset"
            className={`flex items-center gap-2 p-2 rounded-md text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors ${
              collapsed ? 'w-full justify-center' : 'flex-1'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span className="truncate">Reset Sample Data</span>}
          </button>

          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-2 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
