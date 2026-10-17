import React from 'react';
import { DecisionOutcome } from '../types';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface Props {
  outcome?: DecisionOutcome | string;
  size?: 'sm' | 'md' | 'lg';
}

export const DecisionBadge: React.FC<Props> = ({ outcome, size = 'md' }) => {
  if (!outcome) {
    return <span className="text-gray-500 font-mono text-xs font-bold uppercase">UNSET</span>;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }[size];

  if (outcome === 'APPROVE') {
    return (
      <span className={`badge badge-approve ${sizeClasses} gap-1.5 font-black uppercase tracking-tight`}>
        <CheckCircle2 className="w-4 h-4 text-green-700" />
        APPROVE
      </span>
    );
  }

  if (outcome === 'BLOCK') {
    return (
      <span className={`badge badge-block ${sizeClasses} gap-1.5 font-black uppercase tracking-tight`}>
        <XCircle className="w-4 h-4 text-red-700" />
        BLOCK
      </span>
    );
  }

  return (
    <span className={`badge badge-insufficient ${sizeClasses} gap-1.5 font-black uppercase tracking-tight`}>
      <AlertTriangle className="w-4 h-4 text-yellow-700" />
      {outcome}
    </span>
  );
};
