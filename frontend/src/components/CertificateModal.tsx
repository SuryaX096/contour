import React, { useState } from 'react';
import { VerificationCertificate } from '../types';
import { X, Copy, Download, Check, ShieldCheck } from 'lucide-react';

interface Props {
  certificate: VerificationCertificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<Props> = ({ certificate, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!certificate) return null;

  const jsonStr = JSON.stringify(certificate, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${certificate.certificate_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-mono font-bold text-slate-100 text-sm">
              VERIFICATION CERTIFICATE: {certificate.certificate_id}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs">
          <div className="mb-4 grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 block">Decision ID:</span>
              <span className="text-slate-200">{certificate.decision_id}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Status:</span>
              <span className="text-indigo-400 font-semibold">{certificate.status}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Baseline vs Final:</span>
              <span className="text-slate-200">{certificate.baseline_decision} → {certificate.final_decision}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Context Hash:</span>
              <span className="text-slate-400 truncate block">{certificate.selected_context_hash}</span>
            </div>
          </div>

          <label className="text-xs font-semibold text-slate-400 block mb-1">Audit Record JSON Payload</label>
          <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
            {jsonStr}
          </pre>
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900/50">
          <button
            onClick={handleCopy}
            className="btn btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
