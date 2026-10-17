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
    <div className="card p-5 flex flex-col justify-between group hover:border-white/[0.18] transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase font-sans">{title}</span>
        {icon && <div className="text-slate-400 group-hover:text-indigo-400 transition-colors">{icon}</div>}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold font-mono tracking-tight text-white">{value}</div>
        {badge}
      </div>
      {subtext && <div className="text-[11px] text-slate-400/80 mt-2.5 font-sans leading-relaxed">{subtext}</div>}
    </div>
  );
};
