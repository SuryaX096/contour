import React, { useState } from 'react';
import { GraphData, DecisionResponse, CounterexampleSearchResponse } from '../types';
import { CytoscapeGraph } from '../components/CytoscapeGraph';
import { NodeDetailsModal } from '../components/NodeDetailsModal';
import { Layers, ShieldAlert } from 'lucide-react';

interface Props {
  graphData: GraphData | null;
  baselineDecision: DecisionResponse | null;
  counterexampleData: CounterexampleSearchResponse | null;
}

export const GraphExplorerPage: React.FC<Props> = ({
  graphData,
  baselineDecision,
  counterexampleData
}) => {
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [showOnlySelected, setShowOnlySelected] = useState<boolean>(false);
  const [highlightCex, setHighlightCex] = useState<boolean>(true);

  const selectedEvidenceIds = baselineDecision?.selected_evidence_ids || [];
  const omittedEvidenceIds = baselineDecision?.omitted_evidence_ids || [];
  
  const cexEvidenceIds: string[] = [];
  if (counterexampleData && counterexampleData.counterexamples_found.length > 0) {
    counterexampleData.counterexamples_found.forEach(cex => {
      cexEvidenceIds.push(...cex.supporting_evidence_ids);
    });
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="card p-5 bg-white border-2 border-black shadow-brutal flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-black text-white flex items-center justify-center border-2 border-black shadow-sm">
            <Layers className="w-6 h-6 text-yellow-400 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-tight text-black font-sans">
              Interactive Evidence Graph (Cytoscape.js)
            </h2>
            <p className="text-xs text-gray-700 font-bold uppercase tracking-tight">
              Live persistent graph loaded directly from FalkorDB. Click any node to inspect properties and provenance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setHighlightCex(!highlightCex)}
            className={`btn text-xs py-2 px-4 flex items-center gap-2 border-2 border-black font-black uppercase tracking-tight shadow-brutal ${
              highlightCex ? 'bg-red-600 text-white' : 'bg-white text-black hover:bg-yellow-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 stroke-[3]" />
            <span>Highlight Counterexample Path</span>
          </button>
        </div>
      </div>

      {/* Main Graph Visualization */}
      <CytoscapeGraph
        graphData={graphData}
        selectedEvidenceIds={selectedEvidenceIds}
        omittedEvidenceIds={showOnlySelected ? omittedEvidenceIds : []}
        counterexampleEvidenceIds={highlightCex ? cexEvidenceIds : []}
        onSelectNode={(node) => setSelectedNode(node)}
      />

      {/* Node Details Drawer */}
      <NodeDetailsModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
};
