import React from 'react';
import { HealthData } from '../types';
import { Database, RefreshCw, Layers, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

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
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'graph', label: 'EVIDENCE GRAPH' },
    { id: 'compiler', label: 'CONTEXT COMPILER' },
    { id: 'counterexample', label: 'COUNTEREXAMPLE LAB' },
    { id: 'comparison', label: 'DECISION COMPARISON' },
    { id: 'certificate', label: 'VERIFICATION REPORT' },
    { id: 'benchmark', label: 'BENCHMARK' },
  ];

  return (
    <header className="border-b-2 border-black bg-white sticky top-0 z-50 px-6 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-black text-white border-2 border-black flex items-center justify-center shadow-brutal">
            <Layers className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tighter text-black font-sans uppercase">
                CONTOUR
              </span>
              <span className="text-[11px] font-black px-2 py-0.5 rounded bg-black text-white border border-black uppercase tracking-wider">
                PRO v1.0
              </span>
            </div>
            <p className="text-xs text-gray-700 font-bold uppercase tracking-tight hidden sm:block">
              Graph-native Decision Reliability Compiler
            </p>
          </div>
        </div>

        {/* Telemetry & Actions */}
        <div className="flex items-center gap-3">
          {/* FalkorDB Live Pill */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border-2 border-black font-bold text-xs shadow-brutal ${
            health?.graph_db_connected ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
          }`}>
            <span className={`inline-block w-2.5 h-2.5 rounded-full border border-black ${
              health?.graph_db_connected ? 'bg-green-600 animate-pulse' : 'bg-red-600'
            }`} />
            <span className="text-black font-extrabold uppercase">FALKORDB:</span>
            <span className={`uppercase font-black ${health?.graph_db_connected ? 'text-green-700' : 'text-red-700'}`}>
              {health?.graph_db_connected ? 'ONLINE' : 'OFFLINE'}
            </span>
            {health?.graph_db_connected && (
              <span className="text-black font-mono text-[11px]">({health.node_count} nodes)</span>
            )}
          </div>

          <button
            onClick={onSeedReset}
            disabled={isSeeding}
            className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 border-2 border-black shadow-brutal font-extrabold uppercase"
            title="Reset and reload deterministic release graph"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-red-600' : 'text-black'}`} />
            <span>RESET DEMO</span>
          </button>
        </div>
      </div>

      {/* Bold Narrow Segmented Navigation Tabs */}
      <div className="max-w-7xl mx-auto mt-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-black rounded-md border-2 border-black transition-all whitespace-nowrap uppercase tracking-tight ${
                  isActive
                    ? 'bg-black text-white shadow-brutal'
                    : 'bg-white text-black hover:bg-yellow-200'
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
