import React from 'react';
import { DecisionResponse, ContextRepairResponse } from '../types';
import { DecisionBadge } from '../components/DecisionBadge';
import { GitCompare, Wrench, Layers } from 'lucide-react';

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
      <div className="card p-12 text-center bg-white border-2 border-black shadow-brutal text-black">
        <GitCompare className="w-12 h-12 mx-auto text-black mb-3 stroke-[2.5]" />
        <h3 className="text-xl font-black uppercase tracking-tight text-black font-sans">
          No Context Repair Record Available
        </h3>
        <p className="text-xs text-gray-700 font-bold mt-1 uppercase tracking-tight">
          Execute context repair in the Counterexample Lab to see side-by-side decision comparisons and repair step traces.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Side-by-Side Comparison Header */}
      <div className="card p-6 bg-white border-2 border-black shadow-brutal">
        <div className="flex items-center gap-3 mb-4">
          <GitCompare className="w-6 h-6 text-black stroke-[3]" />
          <h2 className="text-xl font-black uppercase tracking-tight text-black font-sans">
            Decision Evolution: Pre-Repair vs Post-Repair
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Baseline Decision */}
          <div className="p-5 rounded-lg bg-yellow-50 border-2 border-black shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-black uppercase tracking-tight">
                Initial Modeled Context
              </span>
              <DecisionBadge outcome={repairData.previous_outcome} size="sm" />
            </div>
            <div className="text-xs text-gray-800 font-bold uppercase tracking-tight">
              Selected Evidence Count: <span className="font-mono text-black font-black">{baselineDecision.selected_evidence_ids.length}</span>
            </div>
            <div className="text-xs text-gray-800 font-bold uppercase tracking-tight">
              Evaluation Status: <span className="font-mono text-black font-black">INCOMPLETE (Omitted Critical Dependency)</span>
            </div>
          </div>

          {/* Repaired Decision */}
          <div className="p-5 rounded-lg bg-red-50 border-2 border-black shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-red-900 uppercase tracking-tight">
                Repaired Context Subgraph
              </span>
              <DecisionBadge outcome={repairData.revised_outcome} size="sm" />
            </div>
            <div className="text-xs text-gray-800 font-bold uppercase tracking-tight">
              Selected Evidence Count: <span className="font-mono text-black font-black">{repairData.expanded_context_cost.selected_evidence_count}</span>
            </div>
            <div className="text-xs text-gray-800 font-bold uppercase tracking-tight">
              Evaluation Status: <span className="font-mono text-red-700 font-black">REVISED UNDER MANDATORY RULE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Added Evidence and Dependency Path */}
      <div className="card p-6 bg-white border-2 border-black shadow-brutal">
        <h3 className="text-base font-black uppercase tracking-tight text-black mb-4 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-red-600 stroke-[3]" />
          Evidence Incorporated via Counterexample-Guided Repair
        </h3>

        <div className="space-y-3">
          {repairData.added_evidence_ids.map((id) => (
            <div key={id} className="p-4 rounded-lg bg-red-50 border-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="badge badge-block font-mono text-xs font-black">REPAIRED NODE</span>
                <span className="font-mono text-xs text-black font-black">{id}</span>
              </div>
              <span className="text-xs text-red-700 font-mono font-black uppercase">STATUS: INCOMPATIBLE</span>
            </div>
          ))}
        </div>
      </div>

      {/* Repair Step Trace */}
      <div className="card p-6 bg-white border-2 border-black shadow-brutal">
        <h3 className="text-base font-black uppercase tracking-tight text-black mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-black stroke-[3]" />
          Deterministic Repair Execution Trace
        </h3>

        <div className="space-y-3">
          {repairData.repair_trace.map((trace) => (
            <div key={trace.step} className="p-4 rounded-lg bg-gray-50 border-2 border-black flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-black text-white font-mono font-black text-xs flex items-center justify-center shrink-0 border border-black">
                {trace.step}
              </span>
              <div className="space-y-1">
                <div className="text-xs font-mono font-black text-black uppercase">{trace.action}</div>
                <div className="text-xs text-gray-800 font-bold">{trace.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
