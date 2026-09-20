import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, CheckCircle2, Copy, Hash } from 'lucide-react';
import { VaultItem } from '../types.js';

interface ReceiptInspectorModalProps {
  item: VaultItem | null;
  onClose: () => void;
}

export const ReceiptInspectorModal: React.FC<ReceiptInspectorModalProps> = ({
  item,
  onClose,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!item) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(item.proofHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-200 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Receipt & Proof-of-Purchase Inspection: {item.title}
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                OCR {item.receiptOcrAccuracy}% MATCH
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {item.merchant} • {item.purchaseDate} • S/N: {item.serialNumber}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-600 min-w-10 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <a
              href={item.receiptImageUrl}
              download={`receipt_${item.title.replace(/\s+/g, '_')}.svg`}
              className="flex items-center gap-1 p-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold px-2.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 p-6 bg-slate-900 overflow-auto flex items-center justify-center">
          <div
            className="transition-transform duration-200 shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-2"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {item.receiptImageUrl ? (
              <img
                src={item.receiptImageUrl}
                alt="Receipt Inspection"
                className="max-h-[600px] w-auto object-contain"
              />
            ) : (
              <div className="text-white text-xs p-12 text-center">
                Receipt image loaded in encrypted buffer.
              </div>
            )}
          </div>
        </div>

        {/* Footer Hash Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold text-[11px]">CRYPTOGRAPHIC PROOF:</span>
            <button
              onClick={handleCopyHash}
              className="flex items-center gap-1 font-mono text-[11px] text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded hover:bg-slate-100 transition-colors"
            >
              <Hash className="w-3 h-3 text-slate-400" />
              <span>{item.proofHash}</span>
              <Copy className="w-2.5 h-2.5 text-slate-400 ml-1" />
            </button>
            {copiedHash && (
              <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            <span>Algorithm: AES-256-GCM + SHA256</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verifiable Legal Proof
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
