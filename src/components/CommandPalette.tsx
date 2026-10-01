import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  Table, 
  Kanban, 
  FileText, 
  BarChart3, 
  Zap, 
  Plus, 
  Sun, 
  Moon, 
  RotateCcw, 
  Download, 
  ArrowRight,
  Command
} from 'lucide-react';
import { ModuleType, ProjectTask, DocPage, TableSchema } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: ModuleType) => void;
  onOpenNewModal: (type?: 'task' | 'row' | 'doc') => void;
  onToggleTheme: () => void;
  onResetData: () => void;
  onExportJson: () => void;
  tasks: ProjectTask[];
  docs: DocPage[];
  tables: TableSchema[];
  onSelectDoc: (docId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  onOpenNewModal,
  onToggleTheme,
  onResetData,
  onExportJson,
  tasks,
  docs,
  onSelectDoc
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Define commands
  const defaultCommands = [
    {
      category: 'Navigation',
      id: 'nav-overview',
      title: 'Go to Workspace Overview',
      icon: LayoutDashboard,
      action: () => { onSelectModule('overview'); onClose(); }
    },
    {
      category: 'Navigation',
      id: 'nav-tables',
      title: 'Go to Relational Tables',
      icon: Table,
      action: () => { onSelectModule('tables'); onClose(); }
    },
    {
      category: 'Navigation',
      id: 'nav-kanban',
      title: 'Go to Tasks & Sprint Board',
      icon: Kanban,
      action: () => { onSelectModule('kanban'); onClose(); }
    },
    {
      category: 'Navigation',
      id: 'nav-docs',
      title: 'Go to Notebook & RFCs',
      icon: FileText,
      action: () => { onSelectModule('docs'); onClose(); }
    },
    {
      category: 'Navigation',
      id: 'nav-metrics',
      title: 'Go to Telemetry & Metrics',
      icon: BarChart3,
      action: () => { onSelectModule('metrics'); onClose(); }
    },
    {
      category: 'Navigation',
      id: 'nav-automations',
      title: 'Go to Workflows & Rules',
      icon: Zap,
      action: () => { onSelectModule('automations'); onClose(); }
    },
    {
      category: 'Quick Actions',
      id: 'act-new-task',
      title: 'Create new sprint task',
      icon: Plus,
      action: () => { onOpenNewModal('task'); onClose(); }
    },
    {
      category: 'Quick Actions',
      id: 'act-new-row',
      title: 'Add new table record',
      icon: Plus,
      action: () => { onOpenNewModal('row'); onClose(); }
    },
    {
      category: 'Quick Actions',
      id: 'act-new-doc',
      title: 'Create new RFC / note document',
      icon: Plus,
      action: () => { onOpenNewModal('doc'); onClose(); }
    },
    {
      category: 'System & Data',
      id: 'sys-theme',
      title: 'Toggle Dark / Light Theme',
      icon: Sun,
      action: () => { onToggleTheme(); onClose(); }
    },
    {
      category: 'System & Data',
      id: 'sys-export',
      title: 'Export Workspace Database as JSON',
      icon: Download,
      action: () => { onExportJson(); onClose(); }
    },
    {
      category: 'System & Data',
      id: 'sys-reset',
      title: 'Reset sample workspace data',
      icon: RotateCcw,
      action: () => { onResetData(); onClose(); }
    }
  ];

  // Dynamic search matching tasks and docs
  const matchingTasks = query.trim() ? tasks.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) || 
    t.description.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3).map(t => ({
    category: 'Matching Tasks',
    id: `task-${t.id}`,
    title: t.title,
    icon: Kanban,
    action: () => { onSelectModule('kanban'); onClose(); }
  })) : [];

  const matchingDocs = query.trim() ? docs.filter(d =>
    d.title.toLowerCase().includes(query.toLowerCase()) ||
    d.content.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3).map(d => ({
    category: 'Matching Documents',
    id: `doc-${d.id}`,
    title: d.title,
    icon: FileText,
    action: () => {
      onSelectModule('docs');
      onSelectDoc(d.id);
      onClose();
    }
  })) : [];

  const filteredCommands = query.trim()
    ? [
        ...matchingTasks,
        ...matchingDocs,
        ...defaultCommands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()))
      ]
    : defaultCommands;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Palette Container */}
      <div 
        className="relative w-full max-w-xl bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search records, docs, or tasks..."
            className="w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-500 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-800 border border-neutral-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No matching commands or items found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isSelected = idx === selectedIndex;

                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-neutral-300 hover:bg-neutral-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
                      <span className="truncate">{cmd.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-neutral-500'}`}>
                        {cmd.category}
                      </span>
                      {isSelected && <ArrowRight className="w-3 h-3 text-indigo-200" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom hints */}
        <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono">↑↓</kbd> Navigate</span>
            <span><kbd className="font-mono">↵</kbd> Select</span>
            <span><kbd className="font-mono">ESC</kbd> Close</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <Command className="w-3 h-3" /> AppBase Quick Launcher
          </div>
        </div>
      </div>
    </div>
  );
};
