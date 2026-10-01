import React from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, FileText, Zap, Trash2 } from 'lucide-react';
import { ActivityItem } from '../types';

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityItem[];
  onClearActivities: () => void;
}

export const ActivityDrawer: React.FC<ActivityDrawerProps> = ({
  isOpen,
  onClose,
  activities,
  onClearActivities
}) => {
  if (!isOpen) return null;

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'status':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'create':
        return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
      case 'automation':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Activity & Audit Log</h2>
              <p className="text-xs text-neutral-400">Real-time workspace events and execution traces</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onClearActivities}
                title="Clear activity log"
                className="p-1.5 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Activity items list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activities.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500">
                No recorded activities yet. Actions taken in the workspace will appear here.
              </div>
            ) : (
              activities.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80 hover:border-neutral-700/60 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-neutral-200">
                      {getIcon(item.type)}
                      <span>{item.user}</span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-mono tabular-nums">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-500">{item.action}</span>{' '}
                    <span className="text-neutral-200 font-medium">{item.target}</span>
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-neutral-800 bg-neutral-950/40 text-[11px] text-neutral-500 flex items-center justify-between">
            <span>Tracking active workspace stream</span>
            <span className="font-mono tabular-nums">{activities.length} total entries</span>
          </div>
        </div>
      </div>
    </div>
  );
};
