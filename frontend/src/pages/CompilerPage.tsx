import React from 'react';
import { DecisionResponse } from '../types';
import { Layers, CheckCircle2, AlertCircle, Hash, Info, FileCode } from 'lucide-react';

interface Props {
  baselineDecision: DecisionResponse | null;
}

export const CompilerPage: React.FC<Props> = ({ baselineDecision }) => {
  if (!baselineDecision) {
    return (
      <div className="card p-12 text-center text-slate-400">
        <Layers className="w-10 h-10 mx-auto text-slate-600 mb-3" />
        <h3 className="text-base font-bold text-slate-200">No Compiled Context Active</h3>
        <p className="text-xs text-slate-500 mt-1">Run baseline decision evaluation from the Overview page to compile context.</p>
      </div>
    );
  }

  const cost = baselineDecision.context_cost;

  return (
    <div className="space-y-6">
      {/* Context Telemetry Header */}
      <div className="card p-6 bg-slate-900 border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
              CONTEXT COMPILATION METRICS
            </span>
            <h2 className="text-lg font-bold font-mono text-slate-100">
              Candidate Subgraph Selection: {baselineDecision.subject}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <Hash className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono text-slate-300 truncate max-w-md">{baselineDecision.context_hash}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-slate-500">Selected / Total Evidence</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {cost.selected_evidence_count} / {cost.total_graph_evidence_count}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Context Reduction</div>
              <div className="text-xl font-bold font-mono text-indigo-400">
                {cost.reduction_percentage}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Est. Context Tokens</div>
              <div className="text-xl font-bold font-mono text-purple-400">
                ~{cost.estimated_token_count}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-md bg-indigo-950/40 border border-indigo-900/50 flex items-start gap-2.5 text-xs text-indigo-300">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p>
            Transparency Notice: Context reduction employs explicit dependency graph reachability heuristics. In accordance with system specification, this candidate context is not claimed to be globally information-theoretically minimal.
          </p>
        </div>
      </div>

      {/* Evidence Selection Breakdown Table */}
      <div className="card p-6">
        <h3 className="text-sm font-bold font-mono text-slate-100 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          Selected Evidence & Explicit Rationale ({baselineDecision.selected_evidence_ids.length} records)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Evidence ID</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Selection Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {baselineDecision.evidence_paths.map((p) => (
                <tr key={p.evidence_id} className="hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 text-indigo-400 font-semibold">{p.evidence_id}</td>
                  <td className="py-2.5 px-3">{p.title}</td>
                  <td className="py-2.5 px-3 text-slate-400">{p.source_type}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-emerald-400 font-semibold">{p.status}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans">{p.selection_reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Omitted Graph Nodes Manifest */}
      <div className="card p-6 border-slate-800">
        <h3 className="text-sm font-bold font-mono text-slate-100 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Omitted Evidence Records Manifest ({baselineDecision.omitted_evidence_ids.length} records)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          The following evidence records exist in the full FalkorDB model but were pruned from the initial candidate context. The counterexample engine searches these omissions for potential decision changes.
        </p>

        <div className="flex flex-wrap gap-2">
          {baselineDecision.omitted_evidence_ids.map((id) => (
            <span
              key={id}
              className={`px-2.5 py-1 rounded text-xs font-mono border ${
                id.includes('fraud')
                  ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {id} {id.includes('fraud') && '(CRITICAL DEFECT)'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
