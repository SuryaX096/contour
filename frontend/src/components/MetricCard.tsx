import React from 'react';

interface Props {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export const MetricCard: React.FC<Props> = ({ title, value, subtext, icon, badge }) => {
  return (
    <div className="card p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold font-mono text-slate-100">{value}</div>
        {badge}
      </div>
      {subtext && <div className="text-xs text-slate-500 mt-2">{subtext}</div>}
    </div>
  );
};
