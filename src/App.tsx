import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { DashboardView } from './components/DashboardView.js';
import { ItemDetailView } from './components/ItemDetailView.js';
import { PaywallModal } from './components/PaywallModal.js';
import { CameraCaptureModal } from './components/CameraCaptureModal.js';
import { ReceiptInspectorModal } from './components/ReceiptInspectorModal.js';
import { LoginPage } from './components/LoginPage.js';
import { VaultItem, SubscriptionState, UserSession } from './types.js';
import {
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Lock,
  RotateCcw,
  CheckCircle2,
  Key,
  Database,
  ExternalLink,
  Mail,
  Clock,
  Download,
} from 'lucide-react';

const DEFAULT_ITEMS: VaultItem[] = [
  {
    id: 'item-sony-xm5',
    title: 'Sony WH-1000XM5',
    model: 'WH-1000XM5 / Black (S01-9842109-H)',
    category: 'electronics',
    serialNumber: 'SN-50821948-B',
    merchant: 'Best Buy Co., Inc.',
    storeId: '#0421 - Bellevue',
    storeLocation: 'Bellevue, WA',
    purchaseDate: 'May 18, 2023',
    purchaseTimestamp: 'May 18, 2023 14:28:11 PST',
    subtotal: 399.99,
    salesTax: 34.5,
    totalSettled: 434.49,
    paymentMethod: 'Visa Ending 4012 (Auth: #94012)',
    warrantyType: 'Manufacturer 1-Year Limited',
    warrantyMonths: 12,
    expiryDate: 'May 18, 2024',
    daysRemaining: 6,
    warrantyElapsedPercent: 98,
    status: 'critical',
    riskAmount: 399.99,
    proofHash: '#8F9A-49C2',
    receiptImageUrl: '/receipt_sony_xm5.svg',
    receiptOcrAccuracy: 99.4,
    registeredCustodian: 'Devin Vance',
    custodianEmail: 'devin@custody.io',
    supportPath: 'Sony North America (1-800-222-7669)',
    orderNumber: '#BBY01-89312',
    supportEmail: 'claims-support@sony.com',
    merchantSupportEmail: 'customer.service@bestbuy.com',
    auditEvents: [
      { id: '1', title: 'AI Claim Draft Initialized', timestamp: 'Just now', type: 'claim_draft' },
      {
        id: '2',
        title: 'Urgent Expiration Warning Triggered (< 7 Days)',
        timestamp: 'Yesterday, 09:12 AM',
        type: 'urgent_warning',
      },
      {
        id: '3',
        title: 'Hardware Registered to Vault',
        timestamp: 'May 19, 2023',
        type: 'registered',
      },
      {
        id: '4',
        title: 'Receipt Ingested & OCR Verification Complete',
        timestamp: 'May 18, 2023',
        type: 'ocr_verified',
      },
    ],
  },
  {
    id: 'item-dyson-v12',
    title: 'Dyson V12 Detect Slim',
    model: 'V12 Detect Cordless / Yellow Nickel',
    category: 'appliances',
    serialNumber: 'DYS-441-9002-K',
    merchant: 'Target Store #0812',
    storeId: '#0812 - Seattle Downtown',
    storeLocation: 'Seattle, WA',
    purchaseDate: 'June 12, 2022',
    purchaseTimestamp: 'June 12, 2022 16:10:04 PST',
    subtotal: 649.99,
    salesTax: 65.0,
    totalSettled: 714.99,
    paymentMethod: 'Mastercard Ending 8831',
    warrantyType: 'Dyson 2-Year Limited Guarantee',
    warrantyMonths: 24,
    expiryDate: 'June 12, 2024',
    daysRemaining: 28,
    warrantyElapsedPercent: 96,
    status: 'expiring',
    riskAmount: 649.99,
    proofHash: '#DYS-2022-714',
    receiptImageUrl: '/receipt_dyson_v12.svg',
    receiptOcrAccuracy: 99.8,
    registeredCustodian: 'Devin Vance',
    custodianEmail: 'devin@custody.io',
    supportPath: 'Dyson Helpline (1-866-693-9766)',
    orderNumber: '#TGT-984128',
    supportEmail: 'service@dyson.com',
    merchantSupportEmail: 'guest.relations@target.com',
    auditEvents: [
      {
        id: 'd1',
        title: '30-Day Expiration Advisory Dispatched',
        timestamp: '2 days ago',
        type: 'urgent_warning',
      },
      {
        id: 'd2',
        title: 'Carton Barcode & Register Slip Sealed',
        timestamp: 'June 12, 2022',
        type: 'ocr_verified',
      },
    ],
  },
  {
    id: 'item-apple-macbook',
    title: 'Apple MacBook Pro 16" M3 Max',
    model: 'MacBookPro18,2 / Space Black (1TB)',
    category: 'electronics',
    serialNumber: 'C02GM09AQ05D',
    merchant: 'Apple Store Soho',
    storeId: '#R048 - Soho',
    storeLocation: 'New York, NY',
    purchaseDate: 'Dec 20, 2023',
    purchaseTimestamp: 'Dec 20, 2023 11:05:42 EST',
    subtotal: 2499.0,
    salesTax: 221.78,
    totalSettled: 2720.78,
    paymentMethod: 'Apple Card Ending 1029',
    warrantyType: 'AppleCare+ Extended Warranty (3 Years)',
    warrantyMonths: 36,
    expiryDate: 'Dec 20, 2026',
    daysRemaining: 890,
    warrantyElapsedPercent: 18,
    status: 'protected',
    riskAmount: 0,
    proofHash: '#APL-M3-8902',
    receiptImageUrl: '/receipt_apple_macbook.svg',
    receiptOcrAccuracy: 100.0,
    registeredCustodian: 'Devin Vance',
    custodianEmail: 'devin@custody.io',
    supportPath: 'AppleCare Support Portal & Genius Bar',
    orderNumber: '#W9812903',
    supportEmail: 'applecare-claims@apple.com',
    merchantSupportEmail: 'store-soho@apple.com',
    auditEvents: [
      {
        id: 'm1',
        title: 'AppleCare Direct API Link Synced',
        timestamp: 'Dec 20, 2023',
        type: 'registered',
      },
    ],
  },
];

export default function App() {
  const [items, setItems] = useState<VaultItem[]>(DEFAULT_ITEMS);
  const [subscription, setSubscription] = useState<SubscriptionState>({
    plan: 'free',
    isEntitled: false,
    activeItemsCount: 3,
    itemCount: 3,
    maxFreeItems: 3,
    apiKeyPreview: 'test_OAHnTjVUPYvUSapPhEoSLMDbGwR',
  });
  const [currentUser, setCurrentUser] = useState<UserSession>({
    id: 'usr-1',
    name: 'Devin Vance',
    email: 'devin@custody.io',
    phone: '+1 (555) 234-8901',
    role: 'admin',
    token: 'jwt-auth-token',
  });
  // Active first page is the Login Page as requested
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'vault' | 'expiring' | 'claims' | 'paywall' | 'logs' | 'settings'
  >('vault');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [inspectingReceiptItem, setInspectingReceiptItem] = useState<VaultItem | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Sync with backend on startup
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [itemsRes, subRes] = await Promise.all([
        fetch('/api/vault/items'),
        fetch('/api/revenuecat/status'),
      ]);

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        if (itemsData.items && itemsData.items.length > 0) {
          setItems(itemsData.items);
        }
      }

      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData);
      }
    } catch (err) {
      console.log('Using local client state');
    }
  };

  const handleItemExtracted = (newItem: VaultItem) => {
    setItems((prev) => [newItem, ...prev]);
    setSubscription((sub) => ({
      ...sub,
      activeItemsCount: (sub.activeItemsCount ?? 3) + 1,
      itemCount: (sub.itemCount ?? 3) + 1,
    }));
    setSelectedItem(newItem);

    // Persist to server
    fetch('/api/vault/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).catch((err) => console.log('Stored locally in memory', err));
  };

  const handleUpgradeSuccess = () => {
    setSubscription((sub) => ({
      ...sub,
      plan: 'pro',
      isEntitled: true,
      entitlementId: 'pro_shield',
    }));
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.merchant.toLowerCase().includes(q) ||
      item.serialNumber.toLowerCase().includes(q) ||
      item.model.toLowerCase().includes(q)
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
        <LoginPage
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthenticated(true);
          }}
          subscription={subscription}
          onOpenPaywall={() => setIsPaywallOpen(true)}
          onInspectDraft={() => {
            const sony = items.find((i) => i.id.includes('sony')) || items[0];
            setInspectingReceiptItem(sony);
          }}
        />

        <PaywallModal
          isOpen={isPaywallOpen}
          onClose={() => setIsPaywallOpen(false)}
          subscription={subscription}
          onSuccessUpgrade={handleUpgradeSuccess}
        />

        <ReceiptInspectorModal
          item={inspectingReceiptItem}
          onClose={() => setInspectingReceiptItem(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
      {/* 1. Left Persistent Sidebar */}
      <Sidebar
        currentTab={activeTab}
        onSelectTab={(tab: string) => {
          setActiveTab(tab as any);
          setSelectedItem(null);
        }}
        subscription={{
          ...subscription,
          activeItemsCount: items.length,
        }}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        currentUser={currentUser}
        onSwitchUser={(role: 'admin' | 'auditor' | 'member') =>
          setCurrentUser((prev) => ({ ...prev, role }))
        }
        criticalCount={items.filter((i) => i.daysRemaining <= 7).length}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* 2. Main Content View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenScanModal={() => setIsScanModalOpen(true)}
          items={items}
          onSelectItem={(item) => {
            setSelectedItem(item);
            setActiveTab('vault');
          }}
          currentUser={currentUser}
          onLogout={() => setIsAuthenticated(false)}
        />

        {/* Dynamic Route Body */}
        <main className="flex-1 pb-16">
          {selectedItem ? (
            /* Selected Item Full Detail View (Mockup 1) */
            <ItemDetailView
              item={selectedItem}
              subscription={subscription}
              onBack={() => setSelectedItem(null)}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onInspectReceipt={(item) => setInspectingReceiptItem(item)}
            />
          ) : activeTab === 'vault' ? (
            /* Primary Dashboard View (Mockup 2) */
            <DashboardView
              items={filteredItems}
              subscription={subscription}
              onSelectItem={(item) => setSelectedItem(item)}
              onDraftClaim={(item) => {
                if (subscription.plan === 'free') {
                  setIsPaywallOpen(true);
                } else {
                  setSelectedItem(item);
                }
              }}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onOpenScanModal={() => setIsScanModalOpen(true)}
              onInspectReceipt={(item) => setInspectingReceiptItem(item)}
            />
          ) : activeTab === 'expiring' ? (
            /* Expiring Tab */
            <div className="p-6 max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Expiring Warranties & Decaying Capital</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Proactive timeline for items reaching end-of-coverage within 30 days.
                  </p>
                </div>
                <button
                  onClick={() => setIsScanModalOpen(true)}
                  className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                >
                  Add Receipt
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items
                  .filter((i) => i.daysRemaining <= 30)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-5 rounded-xl border border-rose-200/80 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                            {item.daysRemaining} DAYS REMAINING
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-1">{item.title}</h3>
                          <p className="text-xs text-slate-500">
                            {item.merchant} • Purchased {item.purchaseDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-extrabold text-rose-600">
                            ${item.subtotal.toFixed(2)}
                          </span>
                          <p className="text-[10px] text-slate-400">At Immediate Risk</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => setInspectingReceiptItem(item)}
                          className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                        >
                          View Receipt
                        </button>
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Draft Claim Notice</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : activeTab === 'claims' ? (
            /* Claims Tab */
            <div className="p-6 max-w-7xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Automated Legal Claims & Return Notices</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI-drafted dispute and statutory repair letters citing timestamped receipt proofs.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-800">
                      Sony WH-1000XM5 Replacement Notice (Magnuson-Moss Citations)
                    </span>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Ready to Dispatch
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-mono bg-slate-50 p-4 rounded-lg border border-slate-200">
                  RE: Warranty Claim & Replacement Request - Sony WH-1000XM5 [Order #BBY01-89312]<br />
                  TO: claims-support@sony.com | CC: customer.service@bestbuy.com<br /><br />
                  "Under the Magnuson-Moss Warranty Act (15 U.S.C. § 2301 et seq.) and UCC § 2-314, I hereby request expedited warranty replacement or factory repair with prepaid logistics return shipping labels..."
                </p>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      const sony = items.find((i) => i.id.includes('sony')) || items[0];
                      setSelectedItem(sony);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    Open in Full Claim Drafter
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'logs' ? (
            /* Cryptographic Audit Ledger */
            <div className="p-6 max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Zero-Knowledge Cryptographic Ledger</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Immutable local audit logs with SHA-256 tamper-evident proof hashes.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Proof Verification: 100% Valid</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-left">Timestamp</th>
                      <th className="p-3 text-left">Event Description</th>
                      <th className="p-3 text-left">Asset / S/N</th>
                      <th className="p-3 text-left">Cryptographic Hash</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-600">{item.purchaseDate}</td>
                        <td className="p-3 font-sans font-semibold text-slate-900">
                          Optical Receipt Seal & Policy Anchoring
                        </td>
                        <td className="p-3 text-indigo-700">{item.serialNumber}</td>
                        <td className="p-3 text-slate-600">{item.proofHash}</td>
                        <td className="p-3">
                          <span className="text-emerald-700 font-sans font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Settings Tab */
            <div className="p-6 max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Vault & Security Settings</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Local encryption keys, RevenueCat subscription entitlements, and data sovereignty.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">RevenueCat Subscription Gateway</h3>
                  <p className="text-slate-500">
                    Live API integration status: <span className="font-mono text-indigo-700">test_OAHnTjVUPYvUSapPhEoSLMDbGwR</span>
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-800">
                      Current Plan: {subscription.plan.toUpperCase()}
                    </span>
                    <button
                      onClick={() => setIsPaywallOpen(true)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg"
                    >
                      Configure Subscription
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Local AES-256-GCM Encryption</h3>
                  <p className="text-slate-500">
                    All receipts and invoice payloads are encrypted at rest using local machine keys. Zero external tracking.
                  </p>
                  <div className="mt-2 text-emerald-700 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Encryption Key: Derived via PBKDF2 with 100,000 iterations</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. Global Modals */}
      {/* Modal 1: Camera & File Capture */}
      <CameraCaptureModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onItemExtracted={handleItemExtracted}
        subscription={subscription}
        currentCount={items.length}
        onOpenPaywall={() => {
          setIsScanModalOpen(false);
          setIsPaywallOpen(true);
        }}
      />

      {/* Modal 2: RevenueCat Paywall (Mockup 3) */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        subscription={subscription}
        onSuccessUpgrade={handleUpgradeSuccess}
      />

      {/* Modal 3: Receipt & OCR Proof Inspector */}
      <ReceiptInspectorModal
        item={inspectingReceiptItem}
        onClose={() => setInspectingReceiptItem(null)}
      />
    </div>
  );
}
