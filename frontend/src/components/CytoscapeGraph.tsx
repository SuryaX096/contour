import React, { useEffect, useRef } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { GraphData } from '../types';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface Props {
  graphData: GraphData | null;
  selectedEvidenceIds?: string[];
  omittedEvidenceIds?: string[];
  counterexampleEvidenceIds?: string[];
  onSelectNode?: (nodeProps: any) => void;
}

export const CytoscapeGraph: React.FC<Props> = ({
  graphData,
  selectedEvidenceIds = [],
  omittedEvidenceIds = [],
  counterexampleEvidenceIds = [],
  onSelectNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    // Convert graph nodes to Cytoscape elements
    const elements: any[] = [];

    graphData.nodes.forEach((n) => {
      const isSelected = selectedEvidenceIds.includes(n.id);
      const isOmitted = omittedEvidenceIds.includes(n.id);
      const isCex = counterexampleEvidenceIds.includes(n.id) || n.id.includes('fraud');

      let nodeColor = '#3b82f6'; // Service default
      let nodeShape = 'round-rectangle';

      if (n.type === 'Evidence') {
        nodeShape = 'ellipse';
        const st = n.properties?.status;
        if (st === 'PASSED') nodeColor = '#10b981';
        else if (st === 'INCOMPATIBLE' || st === 'FAILED') nodeColor = '#f43f5e';
        else nodeColor = '#f59e0b';
      } else if (n.type === 'Rule') {
        nodeColor = '#a855f7';
        nodeShape = 'diamond';
      } else if (n.type === 'Claim') {
        nodeColor = '#06b6d4';
        nodeShape = 'hexagon';
      } else if (n.type === 'Scenario') {
        nodeColor = '#ec4899';
        nodeShape = 'star';
      }

      elements.push({
        data: {
          id: n.id,
          label: n.label || n.id,
          type: n.type,
          isSelected,
          isOmitted,
          isCex,
          properties: n.properties
        },
        classes: `${n.type} ${isSelected ? 'selected-ctx' : ''} ${isOmitted ? 'omitted-ctx' : ''} ${isCex ? 'cex-ctx' : ''}`
      });
    });

    graphData.edges.forEach((e) => {
      elements.push({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.type,
          type: e.type,
          properties: e.properties
        },
        classes: e.type
      });
    });

    // Destroy existing instance
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#f8fafc',
            'font-size': '10px',
            'font-family': 'JetBrains Mono, monospace',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'ellipsis',
            'text-max-width': '100',
            'width': '65px',
            'height': '35px',
            'background-color': '#1e293b',
            'border-width': '2px',
            'border-color': '#475569'
          }
        },
        {
          selector: 'node.Service',
          style: {
            'background-color': '#1e3a8a',
            'border-color': '#3b82f6',
            'shape': 'round-rectangle',
            'width': '90px',
            'height': '40px'
          }
        },
        {
          selector: 'node.Evidence',
          style: {
            'shape': 'ellipse',
            'width': '50px',
            'height': '50px',
            'background-color': '#064e3b',
            'border-color': '#10b981'
          }
        },
        {
          selector: 'node.Rule',
          style: {
            'shape': 'diamond',
            'width': '45px',
            'height': '45px',
            'background-color': '#581c87',
            'border-color': '#a855f7'
          }
        },
        {
          selector: 'node.Claim',
          style: {
            'shape': 'hexagon',
            'width': '55px',
            'height': '40px',
            'background-color': '#155e75',
            'border-color': '#06b6d4'
          }
        },
        {
          selector: 'node.selected-ctx',
          style: {
            'border-width': '3px',
            'border-color': '#6366f1',
            'underlay-color': '#6366f1',
            'underlay-padding': '4px',
            'underlay-opacity': 0.4
          }
        },
        {
          selector: 'node.omitted-ctx',
          style: {
            'opacity': 0.35,
            'border-style': 'dashed',
            'border-color': '#64748b'
          }
        },
        {
          selector: 'node.cex-ctx',
          style: {
            'border-width': '4px',
            'border-color': '#f43f5e',
            'background-color': '#881337',
            'underlay-color': '#f43f5e',
            'underlay-padding': '6px',
            'underlay-opacity': 0.5
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#334155',
            'target-arrow-color': '#334155',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '8px',
            'font-family': 'JetBrains Mono, monospace',
            'color': '#94a3b8',
            'text-rotation': 'autorotate',
            'text-margin-y': -8
          }
        },
        {
          selector: 'edge.CONTRADICTS',
          style: {
            'line-color': '#f43f5e',
            'target-arrow-color': '#f43f5e',
            'width': 3,
            'line-style': 'dashed'
          }
        },
        {
          selector: 'edge.DEPENDS_ON',
          style: {
            'line-color': '#38bdf8',
            'target-arrow-color': '#38bdf8',
            'width': 2.5
          }
        },
        {
          selector: 'edge.SUPPORTS',
          style: {
            'line-color': '#10b981',
            'target-arrow-color': '#10b981'
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 40,
        spacingFactor: 1.2
      }
    });

    cy.on('tap', 'node', (evt) => {
      const nodeData = evt.target.data();
      if (onSelectNode) {
        onSelectNode(nodeData);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [graphData, selectedEvidenceIds, omittedEvidenceIds, counterexampleEvidenceIds, onSelectNode]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit();
  const handleResetLayout = () => {
    cyRef.current?.layout({ name: 'breadthfirst', directed: true, padding: 40 }).run();
  };

  return (
    <div className="relative w-full">
      <div id="cy-container" ref={containerRef} />
      
      {/* Floating Graph Toolbar */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 p-1.5 rounded-lg shadow-lg backdrop-blur">
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetLayout}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Reset Layout"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Visual Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-2 px-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-900 border border-blue-500 inline-block" />
          <span>Service</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-900 border border-emerald-500 inline-block" />
          <span>Evidence (Pass)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-900 border border-rose-500 inline-block" />
          <span>Evidence (Incompat/Fail)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rotate-45 bg-purple-900 border border-purple-500 inline-block" />
          <span>Rule</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-indigo-500 inline-block" />
          <span>Selected Context</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-dashed border-slate-600 opacity-40 inline-block" />
          <span>Omitted Context</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-rose-500 bg-rose-950 inline-block" />
          <span>Counterexample</span>
        </div>
      </div>
    </div>
  );
};
