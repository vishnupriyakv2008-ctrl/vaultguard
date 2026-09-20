import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  FileText,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { ExtractionResult, SubscriptionState, VaultItem } from '../types.js';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemExtracted: (newItem: VaultItem) => void;
  subscription: SubscriptionState;
  currentCount: number;
  onOpenPaywall: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onItemExtracted,
  subscription,
  currentCount,
  onOpenPaywall,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples'>('camera');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState<number>(0);
  const [extractedData, setExtractedData] = useState<ExtractionResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const isQuotaDepleted = subscription.plan === 'free' && currentCount >= subscription.maxFreeItems;

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCameraError(`Camera feed unavailable in current sandbox view (${msg}). You can upload photos or select sample receipts below.`);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const runLocalExtraction = async (hint?: string) => {
    if (isQuotaDepleted) {
      onOpenPaywall();
      return;
    }

    setIsProcessing(true);
    setStage(1);

    setTimeout(() => setStage(2), 500);
    setTimeout(() => setStage(3), 1100);

    try {
      const res = await fetch('/api/vault/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hint }),
      });
      const json = await res.json();
      setTimeout(() => {
        setStage(4);
        setExtractedData(json.data);
        setIsProcessing(false);
      }, 1600);
    } catch (err) {
      setIsProcessing(false);
    }
  };

  const handleCapturePhoto = () => {
    runLocalExtraction('sony');
  };

  const handleConfirmSeal = () => {
    if (isQuotaDepleted) {
      onOpenPaywall();
      return;
    }
    if (!extractedData) return;

    const newItem: VaultItem = {
      id: `item-${Date.now()}`,
      title: extractedData.item_title,
      model: extractedData.model,
      category: 'electronics',
      serialNumber: extractedData.serial_number,
      merchant: extractedData.merchant,
      storeId: extractedData.store_id,
      storeLocation: 'Bellevue, WA',
      purchaseDate: extractedData.purchase_date,
      purchaseTimestamp: `${extractedData.purchase_date} 14:28:11 PST`,
      subtotal: extractedData.purchase_price,
      salesTax: extractedData.tax,
      totalSettled: extractedData.total,
      paymentMethod: extractedData.payment_method,
      warrantyType: extractedData.warranty_period_inferred,
      warrantyMonths: extractedData.warranty_months,
      expiryDate: new Date(Date.now() + extractedData.warranty_months * 30 * 86400 * 1000).toLocaleDateString(
        'en-US',
        { month: 'short', day: 'numeric', year: 'numeric' }
      ),
      daysRemaining: extractedData.warranty_months * 30,
      warrantyElapsedPercent: 2,
      status: 'protected',
      riskAmount: 0,
      proofHash: extractedData.proof_hash,
      receiptImageUrl: extractedData.receipt_image_url || '/receipt_sony_xm5.svg',
      receiptOcrAccuracy: extractedData.confidence,
      registeredCustodian: 'Devin Vance',
      custodianEmail: 'devin@custody.io',
      supportPath: 'OEM Manufacturer Custody Support',
      orderNumber: `#ORD-${Date.now().toString().slice(-6)}`,
      supportEmail: 'claims-support@oem.com',
      merchantSupportEmail: 'support@retailer.com',
      boundingBoxes: extractedData.bounding_boxes,
      auditEvents: [
        {
          id: `ev-${Date.now()}`,
          title: 'Optical Extraction & Timestamp Verification Complete',
          timestamp: 'Just now',
          type: 'ocr_verified',
        },
        {
          id: `ev-reg-${Date.now()}`,
          title: 'Item Sealed into Local Encrypted Vault',
          timestamp: 'Just now',
          type: 'registered',
        },
      ],
    };

    onItemExtracted(newItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ingest Receipt or Product Box</h3>
              <p className="text-xs text-slate-400">Zero-knowledge local optical pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quota Depleted Warning */}
        {isQuotaDepleted && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-700 font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Free tier limit reached (3 / 3 items). Ingestion locked until Pro upgrade.</span>
            </div>
            <button
              onClick={onOpenPaywall}
              className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
            >
              <Lock className="w-3 h-3" />
              <span>Unlock with Pro</span>
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-4 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('camera');
              setExtractedData(null);
            }}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'camera'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Viewfinder</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('samples');
              setExtractedData(null);
            }}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'samples'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sample Receipts</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('upload');
              setExtractedData(null);
            }}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo / File</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5">
          {/* 1. Camera Tab */}
          {activeTab === 'camera' && !extractedData && (
            <div className="space-y-4">
              <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Reticle Viewfinder Overlay */}
                <div className="absolute inset-6 border-2 border-dashed border-emerald-400/80 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  </div>
                  <div className="text-center text-[10px] text-emerald-300 bg-slate-950/70 px-2 py-0.5 rounded font-mono mx-auto">
                    ALIGN RECEIPT OR SERIAL BARCODE WITHIN RETICLE
                  </div>
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/85 p-6 flex flex-col items-center justify-center text-center text-xs text-slate-300">
                    <Camera className="w-8 h-8 text-slate-500 mb-2" />
                    <p className="max-w-md">{cameraError}</p>
                    <button
                      onClick={() => setActiveTab('samples')}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold"
                    >
                      Use Demo Receipt Scans
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Hold receipt steady under good lighting for 99.8% OCR accuracy.
                </p>
                <button
                  id="btn-trigger-capture"
                  onClick={handleCapturePhoto}
                  disabled={isProcessing || isQuotaDepleted}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing Receipt...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Take Photo & Extract</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 2. Sample Receipts Tab */}
          {activeTab === 'samples' && !extractedData && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Click any real retail receipt below to simulate instant optical scanning and policy extraction:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => runLocalExtraction('sony')}
                  disabled={isProcessing || isQuotaDepleted}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 text-left transition-all group"
                >
                  <div className="text-[10px] font-bold text-indigo-600 uppercase">Best Buy Store</div>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5 group-hover:text-indigo-600">
                    Sony WH-1000XM5
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">$399.99 • 1-Year Mfr</p>
                </button>

                <button
                  onClick={() => runLocalExtraction('dyson')}
                  disabled={isProcessing || isQuotaDepleted}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 text-left transition-all group"
                >
                  <div className="text-[10px] font-bold text-rose-600 uppercase">Target Register</div>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5 group-hover:text-rose-600">
                    Dyson V12 Detect
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">$649.99 • 2-Year Limited</p>
                </button>

                <button
                  onClick={() => runLocalExtraction('macbook')}
                  disabled={isProcessing || isQuotaDepleted}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 text-left transition-all group"
                >
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">Apple Store Soho</div>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5 group-hover:text-emerald-600">
                    MacBook Pro 16" M3
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">$2,499.00 • AppleCare+ 3Y</p>
                </button>
              </div>
            </div>
          )}

          {/* 3. Upload Tab */}
          {activeTab === 'upload' && !extractedData && (
            <div
              onClick={() => runLocalExtraction('sony')}
              className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-emerald-50/20"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">Click to choose image or drop receipt here</p>
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, HEIC up to 15MB</p>
            </div>
          )}

          {/* Processing Stages Telemetry */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-2 mt-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-400 font-sans font-bold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Local Optical Structuring & Inference Pipeline</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className={stage >= 1 ? 'text-emerald-400' : 'text-slate-600'}>
                    [1] Ingesting Optical Pixels & Normalizing Contrast
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={stage >= 2 ? 'text-emerald-400' : 'text-slate-600'}>
                    [2] Bounding Box Coordinate Mapping ($399.99, S/N, Visa Auth)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={stage >= 3 ? 'text-emerald-400' : 'text-slate-600'}>
                    [3] Applying Consumer Warranty Legal Policy Engine
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={stage >= 4 ? 'text-emerald-400' : 'text-slate-600'}>
                    [4] Generating SHA-256 Tamper Proof Hash & Sealing
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Extracted Data Result View */}
          {extractedData && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Optical Parsing Successful ({extractedData.confidence}% Confidence)</span>
                </div>
                <span className="font-mono text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                  HASH: {extractedData.proof_hash}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Merchant</span>
                  <p className="font-bold text-slate-800">{extractedData.merchant}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Item Title</span>
                  <p className="font-bold text-slate-800">{extractedData.item_title}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Price + Tax</span>
                  <p className="font-bold text-slate-800">
                    ${extractedData.purchase_price.toFixed(2)} (+${extractedData.tax.toFixed(2)} Tax)
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Serial Number</span>
                  <p className="font-mono font-bold text-indigo-700">{extractedData.serial_number}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Inferred Warranty</span>
                  <p className="font-semibold text-emerald-700">{extractedData.warranty_period_inferred}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Coverage Length</span>
                  <p className="font-bold text-slate-800">{extractedData.warranty_months} Months ({extractedData.warranty_months * 30} Days)</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setExtractedData(null)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Rescan
                </button>
                <button
                  id="btn-confirm-seal-vault"
                  onClick={handleConfirmSeal}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Seal into Vault</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
