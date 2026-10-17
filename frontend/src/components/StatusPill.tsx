import React from 'react';
import { CertificateStatus } from '../types';
import { ShieldCheck, ShieldAlert, ShieldX, HelpCircle } from 'lucide-react';

interface Props {
  status?: CertificateStatus | string;
}

export const StatusPill: React.FC<Props> = ({ status }) => {
  if (!status) return null;

  switch (status) {
    case 'VERIFIED_WITHIN_DECLARED_SCOPE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          VERIFIED WITHIN DECLARED SCOPE
        </span>
      );
    case 'COUNTEREXAMPLE_FOUND':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/60 text-rose-400 border border-rose-800">
          <ShieldAlert className="w-3.5 h-3.5" />
          COUNTEREXAMPLE FOUND
        </span>
      );
    case 'INSUFFICIENT_EVIDENCE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-400 border border-amber-800">
          <ShieldX className="w-3.5 h-3.5" />
          INSUFFICIENT EVIDENCE
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
          <HelpCircle className="w-3.5 h-3.5" />
          {status}
        </span>
      );
  }
};
