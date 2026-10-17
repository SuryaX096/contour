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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-tight bg-green-100 text-green-900 border-2 border-green-700 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
          VERIFIED WITHIN DECLARED SCOPE
        </span>
      );
    case 'COUNTEREXAMPLE_FOUND':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-tight bg-red-100 text-red-900 border-2 border-red-700 shadow-sm">
          <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
          COUNTEREXAMPLE FOUND
        </span>
      );
    case 'INSUFFICIENT_EVIDENCE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-tight bg-yellow-100 text-yellow-900 border-2 border-yellow-700 shadow-sm">
          <ShieldX className="w-3.5 h-3.5 text-yellow-700" />
          INSUFFICIENT EVIDENCE
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-tight bg-gray-100 text-black border-2 border-black shadow-sm">
          <HelpCircle className="w-3.5 h-3.5 text-black" />
          {status}
        </span>
      );
  }
};
