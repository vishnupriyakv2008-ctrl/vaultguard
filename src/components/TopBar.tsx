import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Sun, 
  Moon, 
  Bell, 
  ChevronDown, 
  Check, 
  Layers, 
  Palette, 
  Cloud,
  FileText,
  CheckSquare,
  Table as TableIcon
} from 'lucide-react';
import { Workspace, ModuleType } from '../types';

interface TopBarProps {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  onSelectWorkspace: (wsId: string) => void;
  activeModule: ModuleType;
  onOpenCommandPalette: () => void;
  onOpenNewModal: (type?: 'task' | 'row' | 'doc') => void;
  onToggleActivityDrawer: () => void;
  unreadActivitiesCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentWorkspace,
  workspaces,
  onSelectWorkspace,
  activeModule,
  onOpenCommandPalette,
  onOpenNewModal,
  onToggleActivityDrawer,
  unreadActivitiesCount,
  theme,
  onToggleTheme
}) => {
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);

  const moduleNames: Record<ModuleType, string> = {
    overview: 'Overview',
    tables: 'Data Tables',
    kanban: 'Tasks & Sprints',
    docs: 'Notebook & RFCs',
    metrics: 'Telemetry & Metrics',
    automations: 'Workflows & Rules'
  };

  const getWsIcon = (iconName: string) => {
    switch (iconName) {
      case 'Palette': return <Palette className="w-4 h-4 text-emerald-400" />;
      case 'Cloud': return <Cloud className="w-4 h-4 text-cyan-400" />;
      default: return <Layers className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-4 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Zone 1: Brand & Contextual Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 font-semibold text-sm tracking-tight text-white shrink-0">
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 ring-4 ring-indigo-500/20" />
          <span>AppBase</span>
        </div>

        <span className="text-neutral-600 text-xs hidden sm:inline">/</span>

        {/* Workspace Switcher */}
        <div className="relative">
          <button
            onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-700/60"
            title="Switch Workspace Base"
          >
            {getWsIcon(currentWorkspace.icon)}
            <span className="truncate max-w-[140px] md:max-w-[190px]">{currentWorkspace.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
          </button>

          {wsDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setWsDropdownOpen(false)} 
              />
              <div className="absolute left-0 mt-1.5 w-64 rounded-lg bg-neutral-900 border border-neutral-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1.5 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                  Workspaces
                </div>
                <div className="space-y-0.5">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        onSelectWorkspace(ws.id);
                        setWsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs text-left transition-colors ${
                        ws.id === currentWorkspace.id
                          ? 'bg-neutral-800 text-white font-medium'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {getWsIcon(ws.icon)}
                        <span className="truncate">{ws.name}</span>
                      </div>
                      {ws.id === currentWorkspace.id && (
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <span className="text-neutral-600 text-xs hidden md:inline">/</span>
        <span className="text-xs text-neutral-400 hidden md:inline font-medium">
          {moduleNames[activeModule]}
        </span>
      </div>

      {/* Zone 2: Universal Search / Command Launcher */}
      <div className="flex-1 max-w-md hidden sm:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-neutral-950/70 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors text-xs text-left group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-400 transition-colors" />
            <span className="truncate">Search records, tasks, docs, commands...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile search trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors sm:hidden"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick + New Item Button */}
        <div className="relative">
          <button
            onClick={() => setNewMenuOpen(!newMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
            <ChevronDown className="w-3 h-3 text-indigo-200" />
          </button>

          {newMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNewMenuOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-48 rounded-lg bg-neutral-900 border border-neutral-800 shadow-2xl p-1 z-50">
                <button
                  onClick={() => {
                    onOpenNewModal('task');
                    setNewMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 text-left transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Create Sprint Task</span>
                </button>
                <button
                  onClick={() => {
                    onOpenNewModal('row');
                    setNewMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 text-left transition-colors"
                >
                  <TableIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add Table Record</span>
                </button>
                <button
                  onClick={() => {
                    onOpenNewModal('doc');
                    setNewMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 text-left transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Write RFC / Doc</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Activity & Notifications Toggle */}
        <button
          onClick={onToggleActivityDrawer}
          className="relative p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Activity Log"
        >
          <Bell className="w-4 h-4" />
          {unreadActivitiesCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-neutral-900" />
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Avatar */}
        <div 
          className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-[11px] font-semibold border border-indigo-400/30 shrink-0 cursor-pointer"
          title="Vishnu Priya (Lead Architect)"
        >
          VP
        </div>
      </div>
    </header>
  );
};
