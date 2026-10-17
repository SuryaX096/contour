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
    <div className="card p-5 flex flex-col justify-between bg-white border-2 border-black rounded-lg shadow-brutal hover:shadow-brutal-lg transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black text-black tracking-tight uppercase font-sans">{title}</span>
        {icon && <div className="text-black">{icon}</div>}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-3xl font-black font-sans tracking-tighter text-black">{value}</div>
        {badge}
      </div>
      {subtext && <div className="text-xs text-gray-700 mt-2.5 font-bold leading-tight uppercase tracking-tight">{subtext}</div>}
    </div>
  );
};
