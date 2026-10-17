import React, { useState } from 'react';
import { GraphData, DecisionResponse, CounterexampleSearchResponse } from '../types';
import { CytoscapeGraph } from '../components/CytoscapeGraph';
import { NodeDetailsModal } from '../components/NodeDetailsModal';
import { Layers, Eye, ShieldAlert, Filter } from 'lucide-react';

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
      <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100">Interactive Evidence Graph (Cytoscape.js)</h2>
            <p className="text-xs text-slate-400">
              Live persistent graph loaded directly from FalkorDB. Click any node to inspect properties and provenance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setHighlightCex(!highlightCex)}
            className={`btn text-xs py-1.5 px-3 flex items-center gap-1.5 ${
              highlightCex ? 'btn-danger' : 'btn-secondary'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
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
