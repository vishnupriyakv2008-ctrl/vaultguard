import React, { useState } from 'react';
import {
  ChevronRight,
  ShieldAlert,
  Hash,
  Sparkles,
  CheckCircle2,
  Copy,
  Mail,
  FileDown,
  RotateCw,
  ExternalLink,
  ZoomIn,
  Download,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { SubscriptionState, VaultItem } from '../types.js';

interface ItemDetailViewProps {
  item: VaultItem;
  subscription: SubscriptionState;
  onBack: () => void;
  onOpenPaywall: () => void;
  onInspectReceipt: (item: VaultItem) => void;
}

export const ItemDetailView: React.FC<ItemDetailViewProps> = ({
  item,
  subscription,
  onBack,
  onOpenPaywall,
  onInspectReceipt,
}) => {
  const isPro = subscription.plan === 'pro';

  const [legalVector, setLegalVector] = useState<'grace_period' | 'oem_repair'>('oem_repair');
  const [observations, setObservations] = useState(
    'Right earcup structural hinge squeaks intensely during motion, and the right 30mm driver experiences intermittent audio dropouts and loud pop noises during active ANC mode. Device has never suffered water contact or drop impact.'
  );
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Common failure modes for XM5 or appliances
  const insertCommonDefects = () => {
    if (item.category === 'audio') {
      setObservations(
        'Right earcup structural hinge squeaks intensely during motion, and the right 30mm driver experiences intermittent audio dropouts and loud pop noises during active ANC mode. Device has never suffered water contact or drop impact.'
      );
    } else if (item.category === 'appliances') {
      setObservations(
        'Vacuum digital motor pulses and cuts off after 15 seconds on High torque mode with cleaned filter and unobstructed airway. Flashing error code indicates battery cell internal resistance imbalance.'
      );
    } else {
      setObservations(
        'Internal Liquid Retina display flex ribbon experiences faint vertical line flicker upon waking from sleep. Hardware diagnostics test returns code VFD001.'
      );
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(formalEmailBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMail = () => {
    const to = item.supportEmail || 'claims-support@sony.com';
    const cc = item.merchantSupportEmail || 'customer.service@bestbuy.com';
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(formalEmailBody);
    window.location.href = `mailto:${to}?cc=${cc}&subject=${subject}&body=${body}`;
  };

  const handleExportPdf = () => {
    window.print();
  };

  // Re-compose formal claim email
  const emailSubject = `Warranty Claim & Replacement Request - ${item.title} [Order ${item.orderNumber || '#BBY01-89312'}]`;
  const toEmail = item.supportEmail || 'claims-support@sony.com';
  const ccEmail = `${item.merchantSupportEmail || 'customer.service@bestbuy.com'} (${item.storeId || item.merchant} Copy)`;

  const formalEmailBody = `Dear ${item.merchant.split(' ')[0]} / ${item.title.split(' ')[0]} Product Support & Warranty Custody Team,

I am formally initiating a manufacturer warranty claim regarding my ${item.title} (Serial Number: ${item.serialNumber}), purchased brand new from ${item.merchant} on ${item.purchaseDate} (Custody Transaction Hash: ${item.proofHash}).

As of today, this unit remains within the standard ${item.warrantyMonths * 30}-day manufacturer warranty term (${item.daysRemaining} days remaining prior to statutory coverage expiration).

REPORTED HARDWARE DEFECT:
"${observations}"

STATUTORY COMPLIANCE & LEGAL CITATION:
Under the Magnuson-Moss Warranty Act (15 U.S.C. § 2301 et seq.) and UCC § 2-314, I hereby request expedited warranty replacement or factory repair with prepaid logistics return shipping labels.

ATTACHED EVIDENCE:
- Timestamped Electronic Invoice: ${item.purchaseTimestamp}
- Serial Barcode Verification: ${item.serialNumber}
- Cryptographic Proof Hash: ${item.proofHash}

Sincerely,
${item.registeredCustodian}
${item.custodianEmail}
VaultGuard Sealed Warranty Custody`;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button onClick={onBack} className="hover:text-slate-900 transition-colors">
            Vault Items
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-700">{item.title}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Warranty & Claims</span>
        </nav>

        <div className="flex items-center gap-2">
          {item.daysRemaining <= 7 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Warranty Critical: {item.daysRemaining} Days Remaining</span>
            </div>
          )}

          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
            <Hash className="w-3.5 h-3.5 text-slate-500" />
            <span>HASH: {item.proofHash}</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Warranty Countdown, Receipt Proof & Hardware Identity */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Warranty Countdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  MANUFACTURER STANDARD CUSTODY
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{item.warrantyType}</h2>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-rose-600">
                  {item.daysRemaining} Days
                </div>
                <div className="text-[11px] text-slate-500">Expires {item.expiryDate}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
                <span>Warranty Elapsed: {item.warrantyElapsedPercent}%</span>
                <span>
                  {Math.round((item.warrantyElapsedPercent / 100) * (item.warrantyMonths * 30))} /{' '}
                  {item.warrantyMonths * 30} Days
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${item.warrantyElapsedPercent}%` }}
                />
              </div>
            </div>

            {item.riskAmount > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Active Money at Immediate Risk</span>
                </div>
                <span className="text-base font-extrabold text-rose-700">
                  ${item.riskAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Card 2: OCR Proof of Purchase */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <span className="w-4 h-4 text-slate-600">🔲</span>
                <span>OCR Proof of Purchase</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {item.merchant.split(' ')[0]} Store {item.storeId || '#0421'}
              </span>
            </div>

            {/* Receipt Preview with Bounding Box Overlays */}
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-2 group">
              {item.receiptImageUrl ? (
                <img
                  src={item.receiptImageUrl}
                  alt="Receipt Scan with OCR Bounding Boxes"
                  className="w-full h-72 object-contain rounded"
                />
              ) : (
                <div className="w-full h-64 bg-slate-900 flex items-center justify-center text-slate-500 text-xs">
                  Receipt Image Loaded
                </div>
              )}

              {/* Action tools on receipt */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-slate-900/90 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">
                  {item.receiptOcrAccuracy}% OCR ACCURACY
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onInspectReceipt(item)}
                    className="p-1.5 rounded bg-slate-900/80 hover:bg-slate-900 text-white transition-colors"
                    title="Zoom in receipt"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={item.receiptImageUrl}
                    download="receipt_proof.svg"
                    className="p-1.5 rounded bg-slate-900/80 hover:bg-slate-900 text-white transition-colors"
                    title="Download receipt SVG"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Merchant Metadata Details */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Merchant Retailer</span>
                <p className="font-bold text-slate-800 mt-0.5">{item.merchant}</p>
                <p className="text-[10px] text-slate-500">Store ID: {item.storeId || '#0421 - Bellevue'}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Purchase Timestamp</span>
                <p className="font-bold text-slate-800 mt-0.5">{item.purchaseDate}</p>
                <p className="text-[10px] text-slate-500">{item.purchaseTimestamp.split(' ')[3] || '14:28:11 PST'}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Subtotal + Sales Tax</span>
                <p className="font-bold text-slate-800 mt-0.5">${item.subtotal.toFixed(2)}</p>
                <p className="text-[10px] text-slate-500">Total Settled: ${item.totalSettled.toFixed(2)}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Payment Authorization</span>
                <p className="font-bold text-slate-800 mt-0.5">{item.paymentMethod}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Auth Match Confirmed</p>
              </div>
            </div>
          </div>

          {/* Card 3: Hardware Footprint & Identity */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold text-slate-900">Hardware Footprint & Identity</span>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                VERIFIED CUSTODY
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Product Model</span>
                <span className="font-semibold text-slate-900">{item.model}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Serial Number (S/N)</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {item.serialNumber}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Registered Custodian</span>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{item.registeredCustodian}</p>
                  <p className="text-[11px] text-slate-400 font-mono">({item.custodianEmail})</p>
                </div>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Manufacturer Support Path</span>
                <a
                  href={`mailto:${item.supportEmail}`}
                  className="font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <span>{item.supportPath}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): AI Return & Warranty Claim Drafter */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Return & Warranty Claim Drafter</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enforces statutory consumer warranty terms with verifiable receipt citations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Policy Validated</span>
              </div>
            </div>

            {/* Dispute Vector Selector */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                SELECT LEGAL DISPUTE VECTOR
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLegalVector('grace_period')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    legalVector === 'grace_period'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Grace Period Return</span>
                    <input
                      type="radio"
                      checked={legalVector === 'grace_period'}
                      onChange={() => setLegalVector('grace_period')}
                      className="text-indigo-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Extended retail remorse coverage</p>
                </button>

                <button
                  type="button"
                  onClick={() => setLegalVector('oem_repair')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    legalVector === 'oem_repair'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">OEM Repair & Service</span>
                    <input
                      type="radio"
                      checked={legalVector === 'oem_repair'}
                      onChange={() => setLegalVector('oem_repair')}
                      className="text-indigo-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Component swap under guarantee</p>
                </button>
              </div>
            </div>

            {/* Hardware Defect Observations input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  HARDWARE DEFECT OBSERVATIONS (PLAIN ENGLISH)
                </label>
                <button
                  type="button"
                  onClick={insertCommonDefects}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Insert Common {item.title.split(' ')[0]} Failure Modes</span>
                </button>
              </div>

              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={4}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
                placeholder="Describe what malfunctioned or failed..."
              />

              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Attached Proof: Receipt OCR + Serial Barcode + Timestamped Hash</span>
                </div>
                <span>Context Weight: 240 tokens</span>
              </div>
            </div>

            {/* Regenerate Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsRegenerating(true);
                  setTimeout(() => setIsRegenerating(false), 600);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate Claim Notice</span>
              </button>
            </div>

            {/* Pro Tier Banner if Free */}
            {!isPro && (
              <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-3 shadow-sm border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Pro Tier Warranty Automation</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        TIER UNLOCK
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Automated carrier certified delivery, multi-vendor claims portal bypass, & legal escalation support.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onOpenPaywall}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Upgrade ($4.99/mo)</span>
                </button>
              </div>
            )}

            {/* Email Preview Container */}
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              {/* Fake Email client bar */}
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-slate-600 font-semibold ml-2">
                    FORMAL WARRANTY CLAIM NOTICE - PREPARED FOR {item.merchant.split(' ')[0].toUpperCase()} SERVICE
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Statutory 1-Year Compliance Verified
                </span>
              </div>

              {/* Email Headers */}
              <div className="p-3 bg-white border-b border-slate-100 text-xs space-y-1 font-mono">
                <div className="flex items-center">
                  <span className="text-slate-400 w-16">TO:</span>
                  <span className="font-semibold text-slate-800">{toEmail}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-400 w-16">CC:</span>
                  <span className="text-slate-600">{ccEmail}</span>
                </div>
                <div className="flex items-center pt-1 border-t border-slate-100 mt-1 font-sans">
                  <span className="text-slate-400 w-16 font-mono">SUBJECT:</span>
                  <span className="font-bold text-slate-900">{emailSubject}</span>
                </div>
              </div>

              {/* Email Body */}
              <div className="p-4 bg-slate-50/50 max-h-80 overflow-y-auto font-sans text-xs text-slate-700 leading-relaxed whitespace-pre-line border-b border-slate-100 select-text">
                {formalEmailBody}
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-white flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyEmail}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                  </button>

                  <button
                    onClick={handleOpenMail}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Open in Mail Client</span>
                  </button>
                </div>

                <button
                  onClick={handleExportPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export PDF Bundle (Receipt Attached)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Audited Item History & Milestones */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="text-xs font-bold text-slate-900">Audited Item History & Milestones</h4>
              <span className="text-[11px] text-slate-400">4 Events Logged</span>
            </div>

            <div className="space-y-3">
              {item.auditEvents && item.auditEvents.length > 0 ? (
                item.auditEvents.map((ev, index) => (
                  <div key={ev.id || index} className="flex items-start justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          ev.type === 'claim_draft'
                            ? 'bg-emerald-500'
                            : ev.type === 'urgent_warning'
                            ? 'bg-rose-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <span className="font-semibold text-slate-800">{ev.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">{ev.timestamp}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">No milestone events logged yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
