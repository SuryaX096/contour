import React from 'react';
import { DecisionResponse, CounterexampleSearchResponse, ContextRepairResponse } from '../types';
import { DecisionBadge } from '../components/DecisionBadge';
import { Search, ShieldAlert, Wrench, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';

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
      <div className="card p-6 bg-white border-2 border-black shadow-brutal">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-black uppercase tracking-wider bg-yellow-300 px-2 py-0.5 rounded border border-black">
              VERIFICATION ENGINE — LEVEL 2 & LEVEL 3
            </span>
            <h2 className="text-xl font-black text-black uppercase tracking-tight mt-1 font-sans">
              Bounded Counterexample Search & Z3 Solver Lab
            </h2>
            <p className="text-xs text-gray-700 font-bold mt-1 uppercase tracking-tight">
              Searches the declared finite scenario space for decision-changing omissions and formally proves constraint invalidations using Z3 SMT.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRunSearch}
              disabled={isLoading || !baselineDecision}
              className="btn btn-warning text-xs flex items-center gap-2 border-2 border-black font-black uppercase tracking-tight shadow-brutal"
            >
              <Search className="w-4 h-4 text-black stroke-[3]" />
              <span>Run Counterexample Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Discovered Counterexamples Section */}
      {counterexampleData ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-black uppercase tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 stroke-[3]" />
              Search Results: {counterexampleData.search_status} ({counterexampleData.scenarios_tested} scenarios evaluated in {counterexampleData.duration_ms}ms)
            </h3>
          </div>

          {counterexampleData.counterexamples_found.length === 0 ? (
            <div className="card p-8 text-center bg-white border-2 border-black shadow-brutal text-black">
              <CheckCircle2 className="w-10 h-10 mx-auto text-green-700 mb-2 stroke-[3]" />
              <div className="font-sans font-black text-base uppercase tracking-tight text-black">
                No counterexample found within the tested scope.
              </div>
              <div className="text-xs text-gray-700 font-bold mt-1 max-w-md mx-auto uppercase">
                (Note: In accordance with CONTOUR verification principles, this bounded result does not guarantee that no counterexample exists anywhere in the world).
              </div>
            </div>
          ) : (
            counterexampleData.counterexamples_found.map((cex) => (
              <div key={cex.scenario_id} className="card p-6 bg-red-50 border-2 border-black shadow-brutal">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b-2 border-black">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-block text-xs font-black">{cex.scenario_id}</span>
                      <h4 className="text-lg font-black text-black uppercase tracking-tight font-sans">{cex.scenario_name}</h4>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-black uppercase">
                      <span className="text-gray-700">Method:</span>
                      <span className="text-black bg-yellow-300 px-2 py-0.5 rounded border border-black">{cex.search_method}</span>
                      <span className="text-black">|</span>
                      <span className="text-gray-700">Validation:</span>
                      <span className="text-green-800 bg-green-200 px-2 py-0.5 rounded border border-green-700">{cex.validation_status}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg border-2 border-black shadow-sm">
                    <div>
                      <span className="text-[10px] text-gray-600 font-black block uppercase">Baseline</span>
                      <DecisionBadge outcome={cex.baseline_decision} size="sm" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-black stroke-[3]" />
                    <div>
                      <span className="text-[10px] text-gray-600 font-black block uppercase">Counterexample</span>
                      <DecisionBadge outcome={cex.scenario_decision} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs font-mono">
                  <div className="bg-white p-4 rounded border-2 border-black">
                    <span className="text-black block font-black uppercase mb-1">Violated Mandatory Policy Rules</span>
                    <ul className="space-y-1 text-red-700 font-black">
                      {cex.policy_constraints_affected.map((rule) => (
                        <li key={rule} className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded border-2 border-black">
                    <span className="text-black block font-black uppercase mb-1">Graph Dependency Path Traversed</span>
                    <div className="text-black font-bold break-all leading-relaxed">
                      {cex.dependency_path.join(' → ')}
                    </div>
                  </div>
                </div>

                {/* Context Repair Trigger */}
                <div className="mt-4 pt-4 border-t-2 border-black flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-black font-extrabold uppercase">
                    Ready to incorporate this omitted dependency path into the canonical context?
                  </div>
                  <button
                    onClick={onRunRepair}
                    disabled={isLoading}
                    className="btn btn-danger text-xs flex items-center gap-2 border-2 border-black font-black uppercase tracking-tight shadow-brutal"
                  >
                    <Wrench className="w-4 h-4 stroke-[3]" />
                    <span>Apply Context Repair for {cex.scenario_id}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="card p-12 text-center bg-white border-2 border-black shadow-brutal text-black">
          <Search className="w-12 h-12 mx-auto text-black mb-3 stroke-[2.5]" />
          <div className="font-sans font-black text-lg uppercase tracking-tight text-black">Awaiting Counterexample Search</div>
          <div className="text-xs text-gray-700 font-bold mt-1 uppercase tracking-tight">
            Click "Run Counterexample Search" to execute Level 2 bounded enumeration and Level 3 Z3 verification.
          </div>
        </div>
      )}
    </div>
  );
};
