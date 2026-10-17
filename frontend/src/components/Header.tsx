import React from 'react';
import { HealthData } from '../types';
import { Database, RefreshCw, Layers, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: HealthData | null;
  onSeedReset: () => void;
  isSeeding: boolean;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  health,
  onSeedReset,
  isSeeding
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'graph', label: 'Evidence Graph' },
    { id: 'compiler', label: 'Context Compiler' },
    { id: 'counterexample', label: 'Counterexample Lab' },
    { id: 'comparison', label: 'Decision Comparison' },
    { id: 'certificate', label: 'Verification Report' },
    { id: 'benchmark', label: 'Benchmark' },
  ];

  return (
    <header className="border-b border-white/[0.07] bg-slate-950/75 backdrop-blur-2xl sticky top-0 z-50 px-6 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-indigo-500/20 to-purple-600/10 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-glow-indigo">
            <Layers className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-xl tracking-tight text-white font-sans">
                CONTOUR
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-indigo-300 uppercase tracking-wider">
                Pro 1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-normal hidden sm:block">
              Graph-native Decision Reliability Compiler
            </p>
          </div>
        </div>

        {/* Telemetry & Actions */}
        <div className="flex items-center gap-3">
          {/* FalkorDB Live Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-sm">
            <div className="relative flex items-center justify-center w-2.5 h-2.5">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${health?.graph_db_connected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${health?.graph_db_connected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </div>
            <span className="text-xs font-medium text-slate-300">FalkorDB</span>
            <span className={`text-[11px] font-semibold tracking-wide ${health?.graph_db_connected ? 'text-emerald-400' : 'text-rose-400'}`}>
              {health?.graph_db_connected ? 'CONNECTED' : 'OFFLINE'}
            </span>
            {health?.graph_db_connected && (
              <span className="text-[11px] text-slate-500 font-mono">({health.node_count} nodes)</span>
            )}
          </div>

          <button
            onClick={onSeedReset}
            disabled={isSeeding}
            className="btn btn-secondary text-xs py-1.5 px-3.5 rounded-full flex items-center gap-1.5"
            title="Reset and reload deterministic release graph"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Apple-style Segmented Control Navigation Tabs */}
      <div className="max-w-7xl mx-auto mt-3">
        <div className="inline-flex p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-lg overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-white/[0.12] text-white shadow-sm border border-white/[0.15]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
