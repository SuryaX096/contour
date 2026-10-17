import React from 'react';
import { HealthData } from '../types';
import { Database, RefreshCw, Cpu, Layers } from 'lucide-react';

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
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg tracking-wider text-slate-100">CONTOUR</span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-700/50 text-indigo-300 font-mono">v1.0.0</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              "Don't just make a decision. Test whether the evidence behind it is sufficient."
            </p>
          </div>
        </div>

        {/* System Telemetry & Reset Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs">
            <Database className={`w-3.5 h-3.5 ${health?.graph_db_connected ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span className="text-slate-400 font-mono">FalkorDB:</span>
            <span className={`font-mono font-semibold ${health?.graph_db_connected ? 'text-emerald-400' : 'text-rose-400'}`}>
              {health?.graph_db_connected ? 'ONLINE' : 'OFFLINE'}
            </span>
            {health?.graph_db_connected && (
              <span className="text-slate-500 font-mono">({health.node_count} nodes)</span>
            )}
          </div>

          <button
            onClick={onSeedReset}
            disabled={isSeeding}
            className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            title="Reset and reload deterministic synthetic release graph"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto flex items-center gap-1 mt-3 overflow-x-auto border-t border-slate-900 pt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
