import React from 'react';
import { DecisionResponse, CounterexampleSearchResponse, ContextRepairResponse } from '../types';
import { DecisionBadge } from '../components/DecisionBadge';
import { Search, ShieldAlert, Cpu, Wrench, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';

interface Props {
  baselineDecision: DecisionResponse | null;
  counterexampleData: CounterexampleSearchResponse | null;
  repairData: ContextRepairResponse | null;
  onRunSearch: () => void;
  onRunRepair: () => void;
  isLoading: boolean;
}

export const CounterexampleLabPage: React.FC<Props> = ({
  baselineDecision,
  counterexampleData,
  repairData,
  onRunSearch,
  onRunRepair,
  isLoading
}) => {
  return (
    <div className="space-y-6">
      {/* Control Console */}
      <div className="card p-6 bg-slate-900 border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider">
              VERIFICATION ENGINE — LEVEL 2 & LEVEL 3
            </span>
            <h2 className="text-lg font-bold font-mono text-slate-100">
              Bounded Counterexample Search & Z3 Solver Lab
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Searches the declared finite scenario space for decision-changing omissions and formally proves constraint invalidations using Z3 SMT.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRunSearch}
              disabled={isLoading || !baselineDecision}
              className="btn btn-primary text-xs flex items-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Run Counterexample Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Discovered Counterexamples Section */}
      {counterexampleData ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Search Results: {counterexampleData.search_status} ({counterexampleData.scenarios_tested} scenarios evaluated in {counterexampleData.duration_ms}ms)
            </h3>
          </div>

          {counterexampleData.counterexamples_found.length === 0 ? (
            <div className="card p-8 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
              <div className="font-mono text-sm text-slate-200">No counterexample found within the tested scope.</div>
              <div className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                (Note: In accordance with CONTOUR verification principles, this bounded result does not guarantee that no counterexample exists anywhere in the world).
              </div>
            </div>
          ) : (
            counterexampleData.counterexamples_found.map((cex) => (
              <div key={cex.scenario_id} className="card p-6 border-rose-900/60 bg-rose-950/20">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-rose-900/40">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-block text-xs">{cex.scenario_id}</span>
                      <h4 className="text-base font-bold text-slate-100 font-mono">{cex.scenario_name}</h4>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-mono">
                      <span className="text-slate-400">Search Method:</span>
                      <span className="text-cyan-400 font-semibold">{cex.search_method}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-400">Validation:</span>
                      <span className="text-emerald-400 font-semibold">{cex.validation_status}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Baseline</span>
                      <DecisionBadge outcome={cex.baseline_decision} size="sm" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Counterexample</span>
                      <DecisionBadge outcome={cex.scenario_decision} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="text-slate-400 block font-semibold mb-1">Violated Mandatory Policy Rules</span>
                    <ul className="space-y-1 text-rose-400">
                      {cex.policy_constraints_affected.map((rule) => (
                        <li key={rule} className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="text-slate-400 block font-semibold mb-1">Graph Dependency Path Traversed</span>
                    <div className="text-slate-300 break-all leading-relaxed">
                      {cex.dependency_path.join(' → ')}
                    </div>
                  </div>
                </div>

                {/* Context Repair Trigger */}
                <div className="mt-4 pt-4 border-t border-rose-900/30 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Ready to incorporate this omitted dependency path into the canonical context?
                  </div>
                  <button
                    onClick={onRunRepair}
                    disabled={isLoading}
                    className="btn btn-danger text-xs flex items-center gap-2"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Apply Context Repair for {cex.scenario_id}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="card p-12 text-center text-slate-500">
          <Search className="w-10 h-10 mx-auto text-slate-700 mb-3" />
          <div className="font-mono text-sm text-slate-300">Awaiting Counterexample Search</div>
          <div className="text-xs text-slate-500 mt-1">
            Click "Run Counterexample Search" to execute Level 2 bounded enumeration and Level 3 Z3 verification.
          </div>
        </div>
      )}
    </div>
  );
};
