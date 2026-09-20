import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Check,
  Clock,
  DollarSign,
  AlertTriangle,
  Lock,
  Star,
  RefreshCw,
} from 'lucide-react';
import { SubscriptionState } from '../types.js';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionState;
  onSuccessUpgrade: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onSuccessUpgrade,
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'annual' | 'monthly'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [apiLog, setApiLog] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPro = subscription.plan === 'pro';

  const handlePurchase = async () => {
    setIsProcessing(true);
    setApiLog('Initiating RevenueCat sandbox transaction (API Key: test_OAHnTjVUPYvUSapPhEoSLMDbGwR)...');

    try {
      const res = await fetch('/api/revenuecat/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingPeriod }),
      });
      const data = await res.json();
      if (data.success) {
        setPurchaseSuccess(true);
        setApiLog(`RevenueCat Transaction Confirmed: ${data.transactionId}. Entitlement 'pro_shield' granted.`);
        setTimeout(() => {
          onSuccessUpgrade();
          onClose();
        }, 1200);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setApiLog(`Sandbox Purchase: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    setApiLog('Querying RevenueCat API for existing receipts...');
    try {
      const res = await fetch('/api/revenuecat/restore', { method: 'POST' });
      const data = await res.json();
      setApiLog(data.message || 'Restored.');
      if (data.subscription?.isEntitled) {
        onSuccessUpgrade();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl relative my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Badge */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MONEY PROTECTOR PRO</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              RevenueCat API: <span className="text-indigo-600 font-bold">test_OAHnT...</span>
            </div>
          </div>

          {/* Hero Titles */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Never let another $400 warranty expire in silence.
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
              VaultGuard users recover an average of{' '}
              <strong className="text-slate-800 font-semibold">$680/year</strong> in repairs, replacements,
              and valid return window refunds before coverage lapses.
            </p>
          </div>

          {/* 3 Metric Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Avg. Claim Recovery</p>
                <p className="text-sm font-extrabold text-slate-900">$680.00 / yr</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Time to Draft Claim</p>
                <p className="text-sm font-extrabold text-slate-900">12 Seconds (AI)</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Your Active Risk</p>
                <p className="text-sm font-extrabold text-rose-600">$1,199.00 expiring</p>
              </div>
            </div>
          </div>

          {/* Limit Exceeded Callout (Gated Asset Alert) */}
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-xs">
            <div className="flex items-center justify-between font-bold text-rose-700 mb-1.5">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>LIMIT EXCEEDED • GATED ASSET</span>
              </div>
              <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px]">
                Free Cap: 3 / 3 Items
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              <strong className="font-semibold text-slate-900">Receipt Ingestion Blocked:</strong> Item #4: Sony WH-1000XM5 Noise Cancelling Headphones ($398.00 at risk). Target receipt scanned via camera. AI parsed serial #SN-89210-JP and identified 1-year factory warranty.
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-rose-200/60">
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                AI Claim Drafter & Unlimited Cloud Vault is locked
              </span>
              <span className="font-bold text-slate-800">Included in Pro</span>
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center pt-2">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  billingPeriod === 'annual'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                  Save 33%
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {/* PRO SHIELD ACCESS (Featured Card) */}
            <div className="rounded-2xl p-6 bg-slate-900 text-white border-2 border-emerald-500 shadow-xl relative flex flex-col justify-between">
              <div className="absolute -top-3 right-6 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                MOST POPULAR
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      PRO SHIELD ACCESS
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">Automated Custody</h3>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    {billingPeriod === 'annual' ? '$39.99' : '$4.99'}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {billingPeriod === 'annual' ? '/ year ($3.33/mo)' : '/ month'}
                  </span>
                </div>

                {/* Features List */}
                <ul className="mt-5 space-y-2.5 text-xs text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white font-semibold">Unlimited Receipts & Boxes:</strong> Never hit the 3-item ceiling again.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white font-semibold">Smart Vision LLM:</strong> Auto-extracts item, model, serial #, and manufacturer policy.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white font-semibold">✨ 1-Click Return & Claim Emails:</strong> Legally sound merchant dispute & repair requests.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white font-semibold">Intelligent Smart Alerts:</strong> Proactive pings at 30 days, 14 days, and 48h before cutoff.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white font-semibold">Multi-Device Sync & Cloud Vault:</strong> Instant encrypted desktop and mobile custody.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white font-semibold">Priority Concierge:</strong> Specialist warranty lookup for obscure vendors.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Purchase Button */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  id="paywall-trial-btn"
                  onClick={handlePurchase}
                  disabled={isProcessing || isPro}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Contacting RevenueCat Gateway...</span>
                    </>
                  ) : isPro ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Pro Shield Already Active</span>
                    </>
                  ) : (
                    <>
                      <span>Start 7-Day Free Trial</span>
                      <span>→</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                  No immediate charge. Cancel anytime with 1 click in RevenueCat portal.
                </p>
              </div>
            </div>

            {/* FREE BASELINE CARD */}
            <div className="rounded-2xl p-6 bg-slate-50 border border-slate-200 flex flex-col justify-between text-xs">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      FREE BASELINE
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5">Basic Vault</h3>
                  </div>
                  <span className="text-xl font-extrabold text-slate-900">$0 / mo</span>
                </div>

                <p className="text-slate-500 mt-1 font-medium">Currently active on your account</p>

                <ul className="mt-5 space-y-2.5 text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-slate-500" />
                    <span>Up to 3 Vault Items (Currently 3/3 Full)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-slate-500" />
                    <span>Manual purchase date inputs</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <X className="w-4 h-4 text-slate-400" />
                    <span>No AI Vision receipt extraction</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <X className="w-4 h-4 text-slate-400" />
                    <span>No AI Claim & Return email drafting</span>
                  </li>
                </ul>

                {/* Instant ROI Analysis */}
                <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span>REAL-TIME RISK BALANCE SHEET</span>
                    <span className="text-[10px] text-slate-400 font-normal">Updated Today</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5">Instant ROI Protection Analysis</h4>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400">Immediate Covered Exposure</span>
                      <p className="text-sm font-extrabold text-slate-900">$1,199.00</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">Cost to Secure Today</span>
                      <p className="text-sm font-extrabold text-emerald-600">$4.99 /mo</p>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-rose-200 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-emerald-500" style={{ width: '88%' }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span className="text-emerald-700 font-semibold">• 88% Unlocked ($1,055.00)</span>
                    <span className="text-rose-600 font-semibold">• Unclaimed Risk ($144.00)</span>
                  </div>

                  {/* Testimonial Quote */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700 shrink-0">
                      SL
                    </div>
                    <div className="text-[11px] text-slate-600 italic">
                      <div className="flex text-amber-400 text-[10px] mb-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </div>
                      "Got my $350 soundbar replaced 3 days before warranty ended with the auto-generated email. Manufacturer approved it in 4 hours."
                      <span className="block font-semibold not-italic text-slate-800 mt-0.5">— Sarah L., Verified Pro Custodian</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-slate-500">
                <button onClick={handleRestore} className="hover:text-slate-800 underline">
                  Restore Purchases
                </button>
                <span>Terms of Service • Privacy Policy</span>
              </div>
            </div>
          </div>

          {/* Feature Matrix */}
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              FEATURE MATRIX: AUDIT-GRADE CUSTODY VS. MANUAL SPREADSHEET CHAOS
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="text-left p-3">Capabilities</th>
                    <th className="text-left p-3">Free Plan</th>
                    <th className="text-left p-3 bg-emerald-50/60 text-emerald-900">Pro Protector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-medium text-slate-800">Receipt & Warranty Storage</td>
                    <td className="p-3 text-slate-500">3 Items Maximum</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/40">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-800">Vision LLM Metadata Capture</td>
                    <td className="p-3 text-slate-500">Manual entry only</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/40">Instant 5s Extraction</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-800">AI Return & Warranty Claim Drafter</td>
                    <td className="p-3 text-slate-400">Unavailable</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/40">Unlimited 1-Click Sends</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-800">Expiration Trajectory Warning</td>
                    <td className="p-3 text-slate-500">Basic local alarm</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/40">30D, 14D, 48h Smart Escalation</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-800">Sync Ecosystem</td>
                    <td className="p-3 text-slate-500">Single Device</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/40">Mobile, Tablet, Desktop Cloud</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 100% Value Recovery Guarantee Banner */}
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-950">100% Value Recovery Guarantee</h4>
                <p className="text-emerald-800 mt-0.5">
                  If VaultGuard doesn't help you recover more than your subscription cost across 12 months, contact us for an instant refund.
                </p>
              </div>
            </div>

            <button
              onClick={handlePurchase}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg shrink-0"
            >
              Upgrade Today
            </button>
          </div>

          {/* Live Telemetry Log Output */}
          {apiLog && (
            <div className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>{apiLog}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
