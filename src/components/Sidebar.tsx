import React from 'react';
import {
  ShieldCheck,
  Package,
  Clock,
  Mail,
  BarChart3,
  Server,
  Settings,
  Sparkles,
  ChevronDown,
  UserCheck,
  Lock,
  LogOut,
} from 'lucide-react';
import { SubscriptionState, UserSession } from '../types.js';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  subscription: SubscriptionState;
  onOpenPaywall: () => void;
  currentUser: UserSession;
  onSwitchUser: (role: 'admin' | 'auditor' | 'member') => void;
  criticalCount: number;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  subscription,
  onOpenPaywall,
  currentUser,
  onSwitchUser,
  criticalCount,
  onLogout,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  const isPro = subscription.plan === 'pro';
  const usedSlots = subscription.activeItemsCount ?? 3;
  const maxSlots = subscription.maxFreeItems;
  const percentFull = isPro ? 25 : Math.min(100, Math.round((usedSlots / maxSlots) * 100));

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col h-screen border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white tracking-tight text-base">VaultGuard</span>
            {isPro ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                PRO
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                FREE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium">Warranty Custody</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 tracking-wider">
          VAULT OPERATIONS
        </div>

        <button
          id="nav-all-items"
          onClick={() => onSelectTab('items')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentTab === 'items'
              ? 'bg-slate-800/90 text-white font-semibold shadow-sm'
              : 'text-slate-300 hover:bg-slate-850 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Package className="w-4 h-4 text-slate-400" />
            <span>All Vault Items</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {usedSlots}
          </span>
        </button>

        <button
          id="nav-expiring-soon"
          onClick={() => onSelectTab('expiring')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentTab === 'expiring'
              ? 'bg-slate-800/90 text-white font-semibold'
              : 'text-slate-300 hover:bg-slate-850 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-rose-400" />
            <span>Expiring Soon</span>
          </div>
          {criticalCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
              {criticalCount}
            </span>
          )}
        </button>

        <button
          id="nav-claims-drafts"
          onClick={() => onSelectTab('claims')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentTab === 'claims'
              ? 'bg-slate-800/90 text-white font-semibold'
              : 'text-slate-300 hover:bg-slate-850 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-indigo-400" />
            <span>Claims & Return Emails</span>
          </div>
          {!isPro && <Lock className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        <button
          id="nav-analytics-reports"
          onClick={() => onSelectTab('analytics')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentTab === 'analytics'
              ? 'bg-slate-800/90 text-white font-semibold'
              : 'text-slate-300 hover:bg-slate-850 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Analytics & Reports</span>
        </button>

        <button
          id="nav-system-admin"
          onClick={() => onSelectTab('admin')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentTab === 'admin'
              ? 'bg-slate-800/90 text-white font-semibold'
              : 'text-slate-300 hover:bg-slate-850 hover:text-white'
          }`}
        >
          <Server className="w-4 h-4 text-cyan-400" />
          <span>System & API Docs</span>
        </button>

        <button
          id="nav-settings"
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentTab === 'settings'
              ? 'bg-slate-800/90 text-white font-semibold'
              : 'text-slate-300 hover:bg-slate-850 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>
      </div>

      {/* Storage Cap Card */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-850 border border-slate-800">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-medium">Storage Cap</span>
          <span className={`font-semibold ${percentFull >= 100 && !isPro ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isPro ? 'Unlimited (Pro)' : `${percentFull}% Full`}
          </span>
        </div>

        <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full transition-all duration-300 ${
              percentFull >= 100 && !isPro ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${percentFull}%` }}
          />
        </div>

        <div className="text-xs text-slate-300 mb-2.5 flex items-center justify-between">
          <span>{isPro ? `${usedSlots} Items Protected` : `${usedSlots} / ${maxSlots} Items Protected`}</span>
        </div>

        {!isPro ? (
          <button
            id="sidebar-upgrade-btn"
            onClick={onOpenPaywall}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Upgrade to Pro</span>
          </button>
        ) : (
          <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RevenueCat Pro Active</span>
          </div>
        )}
      </div>

      {/* User Session Switcher (Devin Vance) */}
      <div className="p-3 border-t border-slate-800 relative">
        <button
          id="user-profile-toggle"
          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{currentUser?.name || 'Devin Vance'}</div>
              <div className="text-[11px] text-slate-400 truncate">{currentUser?.email || 'devin@custody.io'}</div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        {/* RBAC Role Dropdown */}
        {userDropdownOpen && (
          <div className="absolute bottom-16 left-3 right-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-2 z-50 text-xs space-y-1">
            <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Role-Based Access Control (RBAC)
            </div>

            <button
              onClick={() => {
                onSwitchUser('admin');
                setUserDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left ${
                currentUser.role === 'admin' ? 'bg-indigo-600/30 text-indigo-300 font-medium' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div>
                <p className="font-semibold">Devin Vance (Admin)</p>
                <p className="text-[10px] text-slate-400">Full Custody & Billing Override</p>
              </div>
              {currentUser.role === 'admin' && <UserCheck className="w-3.5 h-3.5 text-indigo-400" />}
            </button>

            <button
              onClick={() => {
                onSwitchUser('auditor');
                setUserDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left ${
                currentUser.role === 'auditor' ? 'bg-indigo-600/30 text-indigo-300 font-medium' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div>
                <p className="font-semibold">Auditor Morgan (Auditor)</p>
                <p className="text-[10px] text-slate-400">Read-Only Cryptographic Check</p>
              </div>
              {currentUser.role === 'auditor' && <UserCheck className="w-3.5 h-3.5 text-indigo-400" />}
            </button>

            <button
              onClick={() => {
                onSwitchUser('member');
                setUserDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left ${
                currentUser.role === 'member' ? 'bg-indigo-600/30 text-indigo-300 font-medium' : 'text-slate-300 hover:bg-slate-850'
              }`}
            >
              <div>
                <p className="font-semibold">Alex Miller (Member)</p>
                <p className="text-[10px] text-slate-400">Standard Tier User</p>
              </div>
              {currentUser.role === 'member' && <UserCheck className="w-3.5 h-3.5 text-indigo-400" />}
            </button>

            {onLogout && (
              <div className="pt-1.5 mt-1 border-t border-slate-700/80">
                <button
                  id="btn-lock-vault-signout"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-rose-300 hover:bg-rose-950/40 text-left font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock Vault / Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
