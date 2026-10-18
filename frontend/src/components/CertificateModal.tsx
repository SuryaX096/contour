import React, { useState, useEffect } from 'react';
import { VerificationCertificate } from '../types';
import { X, Copy, Download, Check, ShieldCheck } from 'lucide-react';

interface Props {
  certificate: VerificationCertificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<Props> = ({ certificate, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-2 border-black rounded-lg w-full max-w-3xl max-h-[85vh] flex flex-col shadow-brutal text-black cursor-default"
      >
        <div className="p-4 border-b-2 border-black flex items-center justify-between bg-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-green-700 stroke-[3]" />
            <h3 className="font-sans font-black text-black text-base uppercase tracking-tight">
              VERIFICATION CERTIFICATE: {certificate.certificate_id}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-black hover:bg-red-500 hover:text-white p-1.5 rounded-md border-2 border-black transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs bg-white">
          <div className="mb-4 grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-lg border-2 border-black">
            <div>
              <span className="text-gray-600 block uppercase font-bold">Decision ID:</span>
              <span className="text-black font-black">{certificate.decision_id}</span>
            </div>
            <div>
              <span className="text-gray-600 block uppercase font-bold">Status:</span>
              <span className="text-green-800 font-black">{certificate.status}</span>
            </div>
            <div>
              <span className="text-gray-600 block uppercase font-bold">Policy Ref:</span>
              <span className="text-black font-bold">{certificate.policy_id} (v{certificate.policy_version})</span>
            </div>
            <div>
              <span className="text-gray-600 block uppercase font-bold">Solver Status:</span>
              <span className="text-green-800 font-black">{certificate.solver_status}</span>
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between text-xs font-sans font-black uppercase text-black">
            <span>Machine-Readable Cryptographic JSON Record:</span>
            <span>SHA-256 Validated</span>
          </div>
          <pre className="p-4 bg-gray-50 rounded-lg border-2 border-black text-black overflow-x-auto text-xs leading-relaxed max-h-96 font-bold">
            {jsonStr}
          </pre>
        </div>

        <div className="p-4 border-t-2 border-black flex flex-wrap items-center justify-end gap-3 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleCopy}
            className="btn btn-secondary text-xs flex items-center gap-1.5 border-2 border-black font-black uppercase tracking-tight shadow-brutal"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-700 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY JSON'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-primary text-xs flex items-center gap-1.5 border-2 border-black font-black uppercase tracking-tight shadow-brutal"
          >
            <Download className="w-3.5 h-3.5 text-yellow-300 stroke-[2.5]" />
            <span>DOWNLOAD AUDIT CERTIFICATE</span>
          </button>
          <button
            onClick={onClose}
            className="btn bg-gray-200 text-black hover:bg-gray-300 text-xs flex items-center gap-1.5 border-2 border-black font-black uppercase tracking-tight shadow-brutal"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>CLOSE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
