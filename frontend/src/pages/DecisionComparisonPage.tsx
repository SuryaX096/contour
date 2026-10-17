import React from 'react';
import { DecisionResponse, ContextRepairResponse } from '../types';
import { DecisionBadge } from '../components/DecisionBadge';
import { GitCompare, ArrowRight, ShieldCheck, Wrench, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface Props {
  baselineDecision: DecisionResponse | null;
  repairData: ContextRepairResponse | null;
}

export const DecisionComparisonPage: React.FC<Props> = ({
  baselineDecision,
  repairData
}) => {
  if (!repairData || !baselineDecision) {
    return (
      <div className="card p-12 text-center text-slate-500">
        <GitCompare className="w-10 h-10 mx-auto text-slate-700 mb-3" />
        <h3 className="text-base font-bold text-slate-300">No Context Repair Record Available</h3>
        <p className="text-xs text-slate-500 mt-1">
          Execute context repair in the Counterexample Lab to see side-by-side decision comparisons and repair step traces.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Side-by-Side Comparison Header */}
      <div className="card p-6 bg-slate-900 border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <GitCompare className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold font-mono text-slate-100">
            Decision Evolution: Pre-Repair vs Post-Repair
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Baseline Decision */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-400 uppercase">
                Initial Modeled Context
              </span>
              <DecisionBadge outcome={repairData.previous_outcome} size="sm" />
            </div>
            <div className="text-xs text-slate-400">
              Selected Evidence Count: <span className="font-mono text-slate-200">{baselineDecision.selected_evidence_ids.length}</span>
            </div>
            <div className="text-xs text-slate-400">
              Evaluation Status: <span className="font-mono text-slate-200">INCOMPLETE (Omitted Critical Dependency)</span>
            </div>
          </div>

          {/* Repaired Decision */}
          <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-rose-400 uppercase">
                Repaired Context Subgraph
              </span>
              <DecisionBadge outcome={repairData.revised_outcome} size="sm" />
            </div>
            <div className="text-xs text-slate-400">
              Selected Evidence Count: <span className="font-mono text-slate-200">{repairData.expanded_context_cost.selected_evidence_count}</span>
            </div>
            <div className="text-xs text-slate-400">
              Evaluation Status: <span className="font-mono text-rose-300 font-semibold">REVISED UNDER MANDATORY RULE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Added Evidence and Dependency Path */}
      <div className="card p-6">
        <h3 className="text-sm font-bold font-mono text-slate-100 mb-4 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-indigo-400" />
          Evidence Incorporated via Counterexample-Guided Repair
        </h3>

        <div className="space-y-3">
          {repairData.added_evidence_ids.map((id) => (
            <div key={id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="badge badge-block font-mono text-xs">REPAIRED NODE</span>
                <span className="font-mono text-xs text-slate-200">{id}</span>
              </div>
              <span className="text-xs text-rose-400 font-mono">STATUS: INCOMPATIBLE</span>
            </div>
          ))}
        </div>
      </div>

      {/* Repair Step Trace */}
      <div className="card p-6">
        <h3 className="text-sm font-bold font-mono text-slate-100 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          Deterministic Repair Execution Trace
        </h3>

        <div className="space-y-3">
          {repairData.repair_trace.map((trace) => (
            <div key={trace.step} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 font-mono text-xs flex items-center justify-center shrink-0">
                {trace.step}
              </span>
              <div className="space-y-1">
                <div className="text-xs font-mono font-bold text-slate-200">{trace.action}</div>
                <div className="text-xs text-slate-400 font-sans">{trace.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
