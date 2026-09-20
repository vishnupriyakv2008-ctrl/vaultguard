export type VaultItemStatus = 'critical' | 'expiring' | 'protected' | 'archived';

export interface AuditEvent {
  id: string;
  itemId?: string;
  title: string;
  timestamp: string;
  type: 'claim_draft' | 'urgent_warning' | 'registered' | 'ocr_verified' | 'tamper_check' | 'system';
}

export interface BoundingBox {
  label: string;
  color: string;
  top: number;
  left: number;
  width: number;
  height: number;
  value: string;
}

export interface VaultItem {
  id: string;
  title: string;
  model: string;
  category: 'electronics' | 'appliances' | 'computing' | 'home' | 'audio' | 'tools';
  serialNumber: string;
  merchant: string;
  storeId?: string;
  storeLocation: string;
  purchaseDate: string;
  purchaseTimestamp: string;
  subtotal: number;
  salesTax: number;
  totalSettled: number;
  paymentMethod: string;
  warrantyType: string;
  warrantyMonths: number;
  expiryDate: string;
  daysRemaining: number;
  warrantyElapsedPercent: number;
  status: VaultItemStatus;
  riskAmount: number;
  proofHash: string;
  receiptImageUrl?: string;
  receiptOcrAccuracy: number;
  notes?: string;
  registeredCustodian: string;
  custodianEmail: string;
  supportPath: string;
  orderNumber?: string;
  supportEmail: string;
  merchantSupportEmail: string;
  auditEvents: AuditEvent[];
  boundingBoxes?: BoundingBox[];
}

export interface ClaimDraft {
  id: string;
  itemId: string;
  legalVector: 'grace_period' | 'oem_repair';
  observations: string;
  toEmail: string;
  ccEmail: string;
  subject: string;
  formalNoticeBody: string;
  statutoryTerm: string;
  proofHash: string;
  createdAt: string;
  status: 'drafted' | 'ready_to_send' | 'filed';
}

export interface SubscriptionState {
  plan: 'free' | 'pro';
  tierName?: string;
  activeItemsCount?: number;
  itemCount?: number;
  maxFreeItems: number;
  isEntitled: boolean;
  revenueCatAppUserId?: string;
  billingPeriod?: 'annual' | 'monthly';
  expirationDate?: string;
  apiKeyPrefix?: string;
  apiKeyPreview?: string;
  lastVerified?: string;
  simulatedSandbox?: boolean;
  entitlementId?: string;
}

export interface TelemetryStep {
  step: number;
  title: string;
  detail: string;
  completed: boolean;
  active?: boolean;
}

export interface ExtractionResult {
  merchant: string;
  item_title: string;
  model: string;
  purchase_price: number;
  tax: number;
  total: number;
  payment_method: string;
  purchase_date: string;
  warranty_period_inferred: string;
  warranty_months: number;
  serial_number: string;
  store_id: string;
  confidence: number;
  proof_hash: string;
  receipt_image_url?: string;
  bounding_boxes: BoundingBox[];
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'auditor' | 'member';
  token: string;
}

export interface RegisteredAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'admin' | 'auditor' | 'member';
  createdAt: string;
}

export interface AdminMetrics {
  uptimeSeconds: number;
  averageLatencyMs: number;
  totalRequests: number;
  encryptedRecordsCount: number;
  integrityVerified: boolean;
  revenueCatConnected: boolean;
  revenueCatKey: string;
  dbEngine: string;
  encryptionStandard: string;
  activeSessions: number;
  backupStatus: {
    lastBackup: string;
    backupSizeKb: number;
    autoBackupEnabled: boolean;
  };
}
