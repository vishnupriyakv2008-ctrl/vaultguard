import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  Filter,
  ArrowUpDown,
  Upload,
  CheckCircle2,
  FileText,
  Clock,
  ChevronRight,
  Eye,
  Camera,
  AlertTriangle,
  Lock,
  Mail,
} from 'lucide-react';
import { SubscriptionState, VaultItem } from '../types.js';

interface DashboardViewProps {
  items: VaultItem[];
  subscription: SubscriptionState;
  onSelectItem: (item: VaultItem) => void;
  onDraftClaim: (item: VaultItem) => void;
  onOpenPaywall: () => void;
  onOpenScanModal: () => void;
  onInspectReceipt: (item: VaultItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  subscription,
  onSelectItem,
  onDraftClaim,
  onOpenPaywall,
  onOpenScanModal,
  onInspectReceipt,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'expiring' | 'protected' | 'archived'>('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [sortOption, setSortOption] = useState<'critical' | 'value' | 'newest'>('critical');

  const isPro = subscription.plan === 'pro';

  // Calculate Metrics
  const activeBalance = items.reduce((sum, item) => sum + item.subtotal, 0);
  const expiringItems = items.filter((i) => i.daysRemaining <= 30);
  const capitalAtRisk = expiringItems.reduce((sum, item) => sum + item.subtotal, 0);
  const criticalCount = items.filter((i) => i.daysRemaining <= 7).length;
  const protectedCount = items.filter((i) => i.daysRemaining > 30).length;

  // Filtered Items
  const filtered = items.filter((item) => {
    if (filterTab === 'expiring') return item.daysRemaining <= 30;
    if (filterTab === 'protected') return item.daysRemaining > 30;
    if (filterTab === 'archived') return item.status === 'archived';
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Storage Quota Banner (Free Tier Limit reached) */}
      {!isPro && (
        <div className="bg-white border border-rose-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  Storage Quota Depleted: 3 of 3 Protected Slots Utilized
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                  FREE TIER
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                You've reached your free tier limit. Upgrade to Pro for unlimited vaults, automated alerts, and AI return claim emails.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <button
              onClick={onOpenPaywall}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              View Usage Specs
            </button>
            <button
              id="quota-upgrade-btn"
              onClick={onOpenPaywall}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade to Pro</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Metric KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Warranty Balance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>ACTIVE WARRANTY BALANCE</span>
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900">
              ${activeBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{items.length} items legally secured</span>
            </div>
          </div>
          <div className="mt-3 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-full" />
          </div>
        </div>

        {/* Card 2: Capital at Risk (<= 30D) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>CAPITAL AT RISK (≤ 30D)</span>
            <div className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center text-rose-600">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-rose-600">
              ${capitalAtRisk.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-600 font-medium">
              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                URGENT ACTION
              </span>
              <span>{expiringItems.length} assets decaying</span>
            </div>
          </div>
          <div className="mt-3 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 w-3/4" />
          </div>
        </div>

        {/* Card 3: Claims Recouped */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>CLAIMS RECOUPED</span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900">$649.00</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
              <span className="text-emerald-600 font-bold">100% win-rate</span>
              <span>via automated claims</span>
            </div>
          </div>
          <div className="mt-3 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-5/6" />
          </div>
        </div>

        {/* Card 4: Custody Audit Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>CUSTODY AUDIT SCORE</span>
            <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="text-2xl font-extrabold text-slate-900">98.4%</div>
              <div className="text-xs text-slate-500 mt-1">Audit grade verifiable</div>
            </div>
            {/* Visual Circular Gauge */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray="98.4, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Vision OCR: Online</span>
            <span>Proof Hash: Valid</span>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Layout (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Filter Bar & Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200">
            {/* Tab pills */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  filterTab === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>All Items</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {items.length}
                </span>
              </button>

              <button
                onClick={() => setFilterTab('expiring')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  filterTab === 'expiring'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Expiring Soon</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-800">
                  {expiringItems.length}
                </span>
              </button>

              <button
                onClick={() => setFilterTab('protected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  filterTab === 'protected'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Active Protected</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-800">
                  {protectedCount}
                </span>
              </button>

              <button
                onClick={() => setFilterTab('archived')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterTab === 'archived'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Archived
              </button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  aria-label="Filter by Sector"
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 pr-7 appearance-none cursor-pointer focus:outline-none"
                >
                  <option value="all">All Sectors (Electronics, Home)</option>
                  <option value="electronics">Electronics & Audio</option>
                  <option value="appliances">Appliances</option>
                  <option value="computing">Computing</option>
                </select>
                <Filter className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  aria-label="Sort items"
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 pr-7 appearance-none cursor-pointer focus:outline-none"
                >
                  <option value="critical">Sort: Critical Expiry First</option>
                  <option value="value">Sort: Highest Value First</option>
                  <option value="newest">Sort: Recently Ingested</option>
                </select>
                <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                id="btn-upload-receipt-dash"
                onClick={onOpenScanModal}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Receipt / Box Photo</span>
              </button>
            </div>
          </div>

          {/* List of Item Cards */}
          <div className="space-y-3">
            {filtered.map((item) => {
              const isCritical = item.daysRemaining <= 7;
              const isExpiring = item.daysRemaining > 7 && item.daysRemaining <= 30;

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl p-4.5 transition-all hover:shadow-md ${
                    isCritical
                      ? 'border-l-4 border-l-rose-500 border-slate-200'
                      : isExpiring
                      ? 'border-l-4 border-l-amber-500 border-slate-200'
                      : 'border-l-4 border-l-emerald-500 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Thumbnail & Title */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0 relative overflow-hidden group">
                        {item.receiptImageUrl ? (
                          <img
                            src={item.receiptImageUrl}
                            alt="Receipt thumb"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <FileText className="w-8 h-8 text-slate-400" />
                        )}
                        <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-slate-900/80 text-white px-1 rounded font-mono">
                          OCR
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => onSelectItem(item)}
                            className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                          >
                            {item.title}
                          </h3>

                          {isCritical ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              Expires in {item.daysRemaining} Days
                            </span>
                          ) : isExpiring ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Expires in {item.daysRemaining} Days
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {item.daysRemaining} Days Remaining
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                          <span className="font-semibold text-slate-700">{item.merchant}</span>
                          <span>•</span>
                          <span>Purchased {item.purchaseDate}</span>
                          <span>•</span>
                          <span className="font-extrabold text-slate-900">
                            ${item.subtotal.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mt-1">
                          <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[11px] text-slate-600">
                            SN: {item.serialNumber}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-[11px] text-slate-500">{item.warrantyType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expiry Timestamp in top right */}
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-700">
                        Warranty Expiry: {item.expiryDate}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Standard Custody {item.warrantyMonths}M
                      </div>
                    </div>
                  </div>

                  {/* Status Banner inside card */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      {isCritical ? (
                        <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Warranty decay critical. Right to repair or claim replacement active.</span>
                        </div>
                      ) : isExpiring ? (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Receipt verified: printed register slip + carton barcode recorded.</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Direct manufacturer custody link active. Zero claim friction.</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onInspectReceipt(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Inspect Receipt</span>
                      </button>

                      {isCritical || isExpiring ? (
                        <button
                          id={`btn-draft-claim-${item.id}`}
                          onClick={() => onDraftClaim(item)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all ${
                            isPro
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                          <span>Draft Return / Claim Email</span>
                          {!isPro && <Lock className="w-3 h-3 text-slate-400" />}
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectItem(item)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                        >
                          <span>Manage Custody</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No vault items found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Scan or upload a receipt or product box to start tracking warranty coverage and protecting capital.
                </p>
                <button
                  onClick={onOpenScanModal}
                  className="mt-4 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                >
                  Scan First Receipt
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Ingestion Dropzone, Live Optical Telemetry & Auto-Claim Generator */}
        <div className="lg:col-span-4 space-y-4">
          {/* Box 1: Ingest Receipt or Product Box */}
          <div
            onClick={onOpenScanModal}
            className="bg-white border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-emerald-50/20 group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 flex items-center justify-center mx-auto mb-3 transition-colors">
              <Camera className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Ingest Receipt or Product Box</h4>
            <p className="text-xs text-slate-500 mt-1">
              Drag & drop JPEG, HEIC, PNG or PDF receipts. Our local optical model automatically isolates store, terms, and serials.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
              <Sparkles className="w-3 h-3" />
              <span>Automatic 3-second structured extraction</span>
            </div>
          </div>

          {/* Box 2: AI Extraction Telemetry (v4.8-Vision) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Extraction Telemetry</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                v4.8-Vision
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Live stream of optical parsing and warranty term inference pipeline.
            </p>

            {/* Stepper */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">Photo Inbound</p>
                    <p className="text-[11px] text-slate-400">Receipt / Serial Tag scan</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">Vision LLM Structuring</p>
                    <p className="text-[11px] text-slate-400">OCR bbox & confidence matching</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">Legal Policy Inferred</p>
                    <p className="text-[11px] text-slate-400">12 to 24 month rule engine matched</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  4
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">Vault Custody Secured</p>
                    <p className="text-[11px] text-slate-400">Encrypted audit proof pinned</p>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Extracted Schema Payload JSON */}
            <div className="mt-3.5 p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed relative overflow-hidden">
              <div className="flex items-center justify-between text-[9px] text-emerald-400 mb-1 border-b border-slate-800 pb-1 font-sans font-bold">
                <span>{`{...} EXTRACTED_SCHEMA_PAYLOAD`}</span>
                <span>99.8% CONFIDENCE</span>
              </div>
              <div className="space-y-0.5 text-[10px]">
                <p>
                  <span className="text-indigo-400">"merchant"</span>: <span className="text-amber-300">"Best Buy Co., Inc."</span>,
                </p>
                <p>
                  <span className="text-indigo-400">"item_title"</span>: <span className="text-amber-300">"Sony WH-1000XM5"</span>,
                </p>
                <p>
                  <span className="text-indigo-400">"purchase_price"</span>: <span className="text-emerald-400">399.99</span>,
                </p>
                <p>
                  <span className="text-indigo-400">"warranty_period_inferred"</span>: <span className="text-amber-300">"12_MONTHS"</span>,
                </p>
                <p>
                  <span className="text-indigo-400">"serial_number"</span>: <span className="text-amber-300">"SN-50821948-B"</span>
                </p>
              </div>
            </div>

            <button
              onClick={onOpenScanModal}
              className="mt-3 w-full text-center text-xs text-indigo-600 hover:text-indigo-700 font-semibold py-1 hover:underline"
            >
              View Extraction Logs
            </button>
          </div>

          {/* Box 3: Auto-Claim Generator Quick Action */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Auto-Claim Generator</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                  Sony headphone warranty expiring in 6 days? Launch an automated dispute letter citing Best Buy invoice ID.
                </p>
              </div>
            </div>

            <button
              id="dash-launch-claim-btn"
              onClick={() => {
                const sonyItem = items.find((i) => i.id.includes('sony')) || items[0];
                onDraftClaim(sonyItem);
              }}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Launch Pre-Written Claim</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
