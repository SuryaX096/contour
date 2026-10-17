import React from 'react';
import { DecisionOutcome } from '../types';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface Props {
  outcome?: DecisionOutcome | string;
  size?: 'sm' | 'md' | 'lg';
}

export const DecisionBadge: React.FC<Props> = ({ outcome, size = 'md' }) => {
  if (!outcome) {
    return <span className="text-slate-500 font-mono text-xs">UNSET</span>;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }[size];

  if (outcome === 'APPROVE') {
    return (
      <span className={`badge badge-approve ${sizeClasses} gap-1.5`}>
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        APPROVE
      </span>
    );
  }

  if (outcome === 'BLOCK') {
    return (
      <span className={`badge badge-block ${sizeClasses} gap-1.5`}>
        <XCircle className="w-4 h-4 text-rose-400" />
        BLOCK
      </span>
    );
  }

  return (
    <span className={`badge badge-insufficient ${sizeClasses} gap-1.5`}>
      <AlertTriangle className="w-4 h-4 text-amber-400" />
      INSUFFICIENT_EVIDENCE
    </span>
  );
};
