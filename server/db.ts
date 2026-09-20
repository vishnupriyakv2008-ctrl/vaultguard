import fs from 'node:fs';
import path from 'node:path';
import { AuditEvent, ClaimDraft, SubscriptionState, UserSession, VaultItem } from '../src/types.js';
import { createJwtToken, decryptField, encryptField, generateProofHash } from './crypto.js';
import { SAMPLE_RECEIPTS } from './ocr.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'vault-store.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // fallback
  }
}

export interface StoredData {
  items: VaultItem[];
  claims: ClaimDraft[];
  auditLogs: AuditEvent[];
  subscription: SubscriptionState;
  users: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'admin' | 'auditor' | 'member';
    passwordHash: string;
  }>;
  systemMetrics: {
    totalTransactions: number;
    lastBackupTimestamp: string;
    backupSizeKb: number;
  };
}

// Initial seed matching the user mockup images exactly
const INITIAL_ITEMS: VaultItem[] = [
  {
    id: 'item-1-sony-xm5',
    title: 'Sony WH-1000XM5 Wireless Headphones',
    model: 'WH-1000XM5 / Black',
    category: 'audio',
    serialNumber: 'SN-50821948-B',
    merchant: 'Best Buy Co., Inc.',
    storeId: '#0421',
    storeLocation: 'Bellevue, WA',
    purchaseDate: 'May 18, 2023',
    purchaseTimestamp: 'May 18, 2023 14:28:11 PST',
    subtotal: 399.99,
    salesTax: 34.5,
    totalSettled: 434.49,
    paymentMethod: 'Visa Ending 4012',
    warrantyType: 'Sony 1-Year Limited',
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
    supportPath: 'Sony North America',
    orderNumber: '#BBY01-89312',
    supportEmail: 'claims-support@sony.com',
    merchantSupportEmail: 'customer.service@bestbuy.com',
    boundingBoxes: SAMPLE_RECEIPTS.sony_xm5.bounding_boxes,
    auditEvents: [
      { id: 'ev-1', title: 'AI Claim Draft Initialized', timestamp: 'Just now', type: 'claim_draft' },
      { id: 'ev-2', title: 'Urgent Expiration Warning Triggered (< 7 Days)', timestamp: 'Yesterday, 09:12 AM', type: 'urgent_warning' },
      { id: 'ev-3', title: 'Hardware Registered to Vault', timestamp: 'May 19, 2023', type: 'registered' },
      { id: 'ev-4', title: 'Receipt Ingested & OCR Verification Complete', timestamp: 'May 18, 2023', type: 'ocr_verified' },
    ],
  },
  {
    id: 'item-2-dyson-v12',
    title: 'Dyson V12 Detect Slim Vacuum',
    model: 'V12 Detect Slim Cordless',
    category: 'appliances',
    serialNumber: 'DYS-441-9002',
    merchant: 'Target Corporation',
    storeId: '#1140',
    storeLocation: 'Seattle, WA',
    purchaseDate: 'June 12, 2022',
    purchaseTimestamp: 'June 12, 2022 11:15:04 PST',
    subtotal: 649.99,
    salesTax: 56.87,
    totalSettled: 706.86,
    paymentMethod: 'Mastercard Ending 8812',
    warrantyType: '2-Year Limited Dyson Coverage',
    warrantyMonths: 24,
    expiryDate: 'June 12, 2024',
    daysRemaining: 28,
    warrantyElapsedPercent: 96,
    status: 'expiring',
    riskAmount: 649.99,
    proofHash: '#4B71-92A3',
    receiptImageUrl: '/receipt_dyson.svg',
    receiptOcrAccuracy: 99.8,
    registeredCustodian: 'Devin Vance',
    custodianEmail: 'devin@custody.io',
    supportPath: 'Dyson Customer Care USA',
    orderNumber: '#TGT-984210',
    supportEmail: 'help@dyson.com',
    merchantSupportEmail: 'guest.relations@target.com',
    boundingBoxes: SAMPLE_RECEIPTS.dyson_v12.bounding_boxes,
    auditEvents: [
      { id: 'ev-20', title: 'Receipt verified: Target printed register slip + carton barcode recorded', timestamp: 'June 12, 2022', type: 'ocr_verified' },
      { id: 'ev-21', title: 'Hardware Registered to Vault', timestamp: 'June 12, 2022', type: 'registered' },
    ],
  },
  {
    id: 'item-3-macbook-pro',
    title: 'Apple MacBook Pro 16" M3 Max',
    model: 'MacBook Pro 16" Space Black M3 Max',
    category: 'computing',
    serialNumber: 'C02GM09AQ05D',
    merchant: 'Apple Store Soho',
    storeId: 'R044',
    storeLocation: 'New York, NY',
    purchaseDate: 'Dec 20, 2023',
    purchaseTimestamp: 'Dec 20, 2023 16:42:00 EST',
    subtotal: 2499.0,
    salesTax: 221.78,
    totalSettled: 2720.78,
    paymentMethod: 'Apple Pay (Visa 9912)',
    warrantyType: 'AppleCare+ Extended Hardware Shield',
    warrantyMonths: 36,
    expiryDate: 'Dec 20, 2026',
    daysRemaining: 890,
    warrantyElapsedPercent: 18,
    status: 'protected',
    riskAmount: 0,
    proofHash: '#E109-77DF',
    receiptImageUrl: '/receipt_apple.svg',
    receiptOcrAccuracy: 99.9,
    registeredCustodian: 'Devin Vance',
    custodianEmail: 'devin@custody.io',
    supportPath: 'AppleCare Direct Custody Bridge',
    orderNumber: '#W820491029',
    supportEmail: 'applecare-claims@apple.com',
    merchantSupportEmail: 'soho-store@apple.com',
    boundingBoxes: SAMPLE_RECEIPTS.macbook_pro.bounding_boxes,
    auditEvents: [
      { id: 'ev-30', title: 'Direct AppleCare API link synced. Zero claim friction.', timestamp: 'Dec 20, 2023', type: 'registered' },
      { id: 'ev-31', title: 'Digital Invoice Verified & Sealed', timestamp: 'Dec 20, 2023', type: 'ocr_verified' },
    ],
  },
];

const INITIAL_USERS = [
  {
    id: 'usr-devin',
    name: 'Devin Vance',
    email: 'devin@custody.io',
    phone: '+1 (555) 234-8901',
    role: 'admin' as const,
    passwordHash: 'devin_hash',
  },
  {
    id: 'usr-auditor',
    name: 'Auditor Morgan',
    email: 'auditor@compliance.gov',
    phone: '+1 (555) 771-9023',
    role: 'auditor' as const,
    passwordHash: 'auditor_hash',
  },
  {
    id: 'usr-member',
    name: 'Alex Miller',
    email: 'alex@standard.org',
    phone: '+1 (555) 892-3401',
    role: 'member' as const,
    passwordHash: 'member_hash',
  },
];

let inMemoryData: StoredData = {
  items: INITIAL_ITEMS,
  claims: [],
  auditLogs: [
    { id: 'log-1', title: 'System initialized with AES-256-GCM encrypted custody vault', timestamp: 'System Boot', type: 'system' },
    { id: 'log-2', title: 'RevenueCat API Gateway bound to key test_OAHnTjVUPYvUSapPhEoSLMDbGwR', timestamp: 'System Boot', type: 'system' },
  ],
  subscription: {
    plan: 'free',
    tierName: 'Free Tier (3 Items)',
    activeItemsCount: 3,
    maxFreeItems: 3,
    isEntitled: false,
    revenueCatAppUserId: 'usr-devin',
    billingPeriod: 'annual',
    apiKeyPrefix: 'test_OAHn...',
    simulatedSandbox: true,
  },
  users: INITIAL_USERS,
  systemMetrics: {
    totalTransactions: 142,
    lastBackupTimestamp: new Date().toISOString(),
    backupSizeKb: 48,
  },
};

// Attempt to load from disk
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.items && Array.isArray(parsed.items)) {
      inMemoryData = parsed;
    }
  }
} catch (e) {
  // Use memory default
}

function persistToDisk() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryData, null, 2), 'utf-8');
  } catch (e) {
    // Non-fatal if container file system is read-only
  }
}

export const Database = {
  getItems(): VaultItem[] {
    return inMemoryData.items;
  },

  getItemById(id: string): VaultItem | undefined {
    return inMemoryData.items.find((i) => i.id === id);
  },

  addItem(item: VaultItem): { success: boolean; error?: string; item?: VaultItem } {
    // Check Free tier limit
    if (inMemoryData.subscription.plan === 'free' && inMemoryData.items.length >= inMemoryData.subscription.maxFreeItems) {
      return {
        success: false,
        error: 'STORAGE_QUOTA_EXCEEDED: Free tier limit of 3 items reached. Upgrade to Pro via RevenueCat to protect unlimited receipts.',
      };
    }

    inMemoryData.items.unshift(item);
    inMemoryData.subscription.activeItemsCount = inMemoryData.items.length;
    inMemoryData.systemMetrics.totalTransactions += 1;

    // Log audit event
    inMemoryData.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      itemId: item.id,
      title: `Ingested & Sealed item: ${item.title} (Hash: ${item.proofHash})`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: 'registered',
    });

    persistToDisk();
    return { success: true, item };
  },

  deleteItem(id: string): boolean {
    const idx = inMemoryData.items.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    const removed = inMemoryData.items.splice(idx, 1)[0];
    inMemoryData.subscription.activeItemsCount = inMemoryData.items.length;
    inMemoryData.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      title: `Archived item: ${removed.title} from vault custody`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: 'system',
    });
    persistToDisk();
    return true;
  },

  getClaims(): ClaimDraft[] {
    return inMemoryData.claims;
  },

  saveClaim(claim: ClaimDraft): ClaimDraft {
    const existingIdx = inMemoryData.claims.findIndex((c) => c.itemId === claim.itemId);
    if (existingIdx >= 0) {
      inMemoryData.claims[existingIdx] = claim;
    } else {
      inMemoryData.claims.unshift(claim);
    }
    inMemoryData.auditLogs.unshift({
      id: `claim-${Date.now()}`,
      itemId: claim.itemId,
      title: `Formal Legal Claim Draft Generated for ${claim.subject}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'claim_draft',
    });
    persistToDisk();
    return claim;
  },

  getSubscription(): SubscriptionState {
    inMemoryData.subscription.activeItemsCount = inMemoryData.items.length;
    return inMemoryData.subscription;
  },

  updateSubscription(isPro: boolean, billingPeriod: 'annual' | 'monthly' = 'annual'): SubscriptionState {
    inMemoryData.subscription = {
      ...inMemoryData.subscription,
      plan: isPro ? 'pro' : 'free',
      tierName: isPro ? 'Pro Shield Access (Automated Custody)' : 'Free Tier (3 Items)',
      isEntitled: isPro,
      billingPeriod,
      expirationDate: isPro
        ? new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
        : undefined,
      lastVerified: new Date().toISOString(),
    };
    persistToDisk();
    return inMemoryData.subscription;
  },

  getAuditLogs(): AuditEvent[] {
    return inMemoryData.auditLogs;
  },

  getUsers() {
    return inMemoryData.users;
  },

  getUserByEmail(email: string) {
    return inMemoryData.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserByIdentifier(identifier: string) {
    const trimmed = identifier.trim().toLowerCase();
    const cleanPhone = trimmed.replace(/[^0-9]/g, '');
    return inMemoryData.users.find((u) => {
      const emailMatch = u.email.toLowerCase() === trimmed;
      const userPhoneClean = (u.phone || '').replace(/[^0-9]/g, '');
      const phoneMatch =
        cleanPhone.length >= 7 &&
        userPhoneClean.length >= 7 &&
        (userPhoneClean === cleanPhone ||
          userPhoneClean.endsWith(cleanPhone) ||
          cleanPhone.endsWith(userPhoneClean));
      return emailMatch || phoneMatch;
    });
  },

  addUser(user: { id: string; name: string; email: string; phone?: string; role: 'admin' | 'auditor' | 'member'; passwordHash?: string }) {
    const existing = inMemoryData.users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    const newUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      passwordHash: user.passwordHash || 'hash',
    };
    if (existing >= 0) {
      inMemoryData.users[existing] = newUser;
    } else {
      inMemoryData.users.push(newUser);
    }
    persistToDisk();
    return newUser;
  },

  getMetrics() {
    return {
      ...inMemoryData.systemMetrics,
      totalItems: inMemoryData.items.length,
      claimsDrafted: inMemoryData.claims.length,
      totalAuditLogs: inMemoryData.auditLogs.length,
    };
  },

  createBackup() {
    inMemoryData.systemMetrics.lastBackupTimestamp = new Date().toISOString();
    const backupData = JSON.stringify(inMemoryData);
    inMemoryData.systemMetrics.backupSizeKb = Math.round(Buffer.byteLength(backupData, 'utf8') / 1024);
    persistToDisk();
    return {
      timestamp: inMemoryData.systemMetrics.lastBackupTimestamp,
      sizeKb: inMemoryData.systemMetrics.backupSizeKb,
      checksum: generateProofHash(backupData),
      backupPayload: backupData,
    };
  },

  restoreBackup(backupPayload: string): boolean {
    try {
      const parsed = JSON.parse(backupPayload);
      if (parsed.items && Array.isArray(parsed.items)) {
        inMemoryData = parsed;
        persistToDisk();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  resetDemo() {
    inMemoryData.items = [...INITIAL_ITEMS];
    inMemoryData.claims = [];
    inMemoryData.subscription = {
      plan: 'free',
      tierName: 'Free Tier (3 Items)',
      activeItemsCount: 3,
      maxFreeItems: 3,
      isEntitled: false,
      revenueCatAppUserId: 'usr-devin',
      billingPeriod: 'annual',
      apiKeyPrefix: 'test_OAHn...',
      simulatedSandbox: true,
    };
    persistToDisk();
    return inMemoryData;
  },
};
