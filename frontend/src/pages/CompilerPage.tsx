import React from 'react';
import { DecisionResponse } from '../types';
import { Layers, CheckCircle2, AlertCircle, Hash, Info } from 'lucide-react';

interface Props {
  baselineDecision: DecisionResponse | null;
}

export const CompilerPage: React.FC<Props> = ({ baselineDecision }) => {
  if (!baselineDecision) {
    return (
      <div className="card p-12 text-center bg-white border-2 border-black shadow-brutal text-black">
        <Layers className="w-12 h-12 mx-auto text-black mb-3 stroke-[2.5]" />
        <h3 className="text-xl font-black uppercase tracking-tight text-black">No Compiled Context Active</h3>
        <p className="text-xs text-gray-700 font-bold mt-1 uppercase tracking-tight">
          Run baseline decision evaluation from the Overview page to compile context.
        </p>
      </div>
    );
  }

  const cost = baselineDecision.context_cost;

  return (
    <div className="space-y-6">
      {/* Context Telemetry Header */}
      <div className="card p-6 bg-white border-2 border-black shadow-brutal">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-black uppercase tracking-wider bg-yellow-300 px-2 py-0.5 border border-black rounded">
              CONTEXT COMPILATION METRICS
            </span>
            <h2 className="text-xl font-black text-black uppercase tracking-tight mt-1 font-sans">
              Candidate Subgraph Selection: {baselineDecision.subject}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-700 font-bold">
              <Hash className="w-3.5 h-3.5 text-black" />
              <span className="font-mono text-black truncate max-w-md">{baselineDecision.context_hash}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-gray-600 font-black uppercase">Selected / Total</div>
              <div className="text-2xl font-black font-sans text-green-700">
                {cost.selected_evidence_count} / {cost.total_graph_evidence_count}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600 font-black uppercase">Cost Reduction</div>
              <div className="text-2xl font-black font-sans text-black">
                {cost.reduction_percentage}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600 font-black uppercase">Est. Tokens</div>
              <div className="text-2xl font-black font-sans text-red-600">
                ~{cost.estimated_token_count}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-md bg-yellow-100 border-2 border-black flex items-start gap-2.5 text-xs text-black font-bold uppercase tracking-tight">
          <Info className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
          <p>
            Transparency Notice: Context reduction employs explicit dependency graph reachability heuristics. In accordance with system specification, this candidate context is not claimed to be globally information-theoretically minimal.
          </p>
        </div>
      </div>

      {/* Evidence Selection Breakdown Table */}
      <div className="card p-6 bg-white border-2 border-black shadow-brutal">
        <h3 className="text-base font-black uppercase tracking-tight text-black mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-700 stroke-[3]" />
          Selected Evidence & Explicit Rationale ({baselineDecision.selected_evidence_ids.length} records)
        </h3>

        <div className="overflow-x-auto border-2 border-black rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black text-white border-b-2 border-black">
              <tr>
                <th className="py-2.5 px-3 uppercase font-black">Evidence ID</th>
                <th className="py-2.5 px-3 uppercase font-black">Title</th>
                <th className="py-2.5 px-3 uppercase font-black">Type</th>
                <th className="py-2.5 px-3 uppercase font-black">Status</th>
                <th className="py-2.5 px-3 uppercase font-black">Selection Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-black bg-white">
              {baselineDecision.evidence_paths.map((p) => (
                <tr key={p.evidence_id} className="hover:bg-yellow-50">
                  <td className="py-2.5 px-3 font-black text-black">{p.evidence_id}</td>
                  <td className="py-2.5 px-3 font-bold">{p.title}</td>
                  <td className="py-2.5 px-3 font-bold text-gray-700">{p.source_type}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-green-800 bg-green-100 border border-green-700 px-2 py-0.5 rounded font-black uppercase">{p.status}</span>
                  </td>
                  <td className="py-2.5 px-3 text-black font-sans font-bold">{p.selection_reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Omitted Graph Nodes Manifest */}
      <div className="card p-6 bg-white border-2 border-black shadow-brutal">
        <h3 className="text-base font-black uppercase tracking-tight text-black mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 stroke-[3]" />
          Omitted Evidence Records Manifest ({baselineDecision.omitted_evidence_ids.length} records)
        </h3>
        <p className="text-xs text-gray-800 font-bold mb-4 uppercase tracking-tight">
          The following evidence records exist in the full FalkorDB model but were pruned from the initial candidate context. The counterexample engine searches these omissions for potential decision changes.
        </p>

        <div className="flex flex-wrap gap-2">
          {baselineDecision.omitted_evidence_ids.map((id) => (
            <span
              key={id}
              className={`px-2.5 py-1 rounded text-xs font-mono font-black uppercase border-2 ${
                id.includes('fraud')
                  ? 'bg-red-600 text-white border-black shadow-sm'
                  : 'bg-gray-100 text-black border-black'
              }`}
            >
              {id} {id.includes('fraud') && '⚠️ (CRITICAL DEFECT)'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
