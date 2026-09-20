import React, { useState } from 'react';
import { Search, Bell, Plus, ShieldAlert, CheckCircle2, Clock, X, Lock } from 'lucide-react';
import { VaultItem, UserSession } from '../types.js';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenScanModal: () => void;
  items: VaultItem[];
  onSelectItem: (item: VaultItem) => void;
  onLogout?: () => void;
  currentUser?: UserSession;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenScanModal,
  items,
  onSelectItem,
  onLogout,
  currentUser,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const criticalItems = items.filter((i) => i.daysRemaining <= 7);
  const expiringItems = items.filter((i) => i.daysRemaining > 7 && i.daysRemaining <= 30);
  const totalAlerts = criticalItems.length + expiringItems.length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Global Search Bar */}
      <div className="relative flex-1 max-w-xl">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="global-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search receipts, warranties, serials, vendors... (⌘K)"
          className="w-full pl-10 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200/70 text-slate-500 px-1.5 py-0.5 rounded border border-slate-300 font-mono">
          ⌘K
        </kbd>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors relative"
            title="Warranty Alerts"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-900">Warranty Expiration Alerts</span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {criticalItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectItem(item);
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/70 hover:bg-rose-100/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span>Warranty Critical: {item.daysRemaining} Days Left</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">{item.title}</p>
                    <p className="text-[11px] text-slate-500">{item.merchant} • ${item.subtotal.toFixed(2)} at risk</p>
                  </div>
                ))}

                {expiringItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectItem(item);
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/70 hover:bg-amber-100/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Expiring in {item.daysRemaining} Days</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">{item.title}</p>
                    <p className="text-[11px] text-slate-500">{item.merchant} • Expires {item.expiryDate}</p>
                  </div>
                ))}

                {totalAlerts === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                    All active warranties are securely shielded.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Scan New Receipt Button */}
        <button
          id="btn-scan-receipt"
          onClick={onOpenScanModal}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Scan New Receipt / Box</span>
        </button>

        {/* Lock Vault / Sign Out quick button */}
        {onLogout && (
          <button
            id="btn-header-lock-vault"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors"
            title="Lock Vault & Sign Out"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Lock Vault</span>
          </button>
        )}
      </div>
    </header>
  );
};
