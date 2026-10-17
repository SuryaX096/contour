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

      let nodeColor = '#000000'; // Service default black
      let nodeShape = 'round-rectangle';
      let textColor = '#ffffff';

      if (n.type === 'Evidence') {
        nodeShape = 'ellipse';
        const st = n.properties?.status;
        if (st === 'PASSED') {
          nodeColor = '#16a34a'; // Green
          textColor = '#ffffff';
        } else if (st === 'INCOMPATIBLE' || st === 'FAILED') {
          nodeColor = '#dc2626'; // Red
          textColor = '#ffffff';
        } else {
          nodeColor = '#facc15'; // Yellow
          textColor = '#000000';
        }
      } else if (n.type === 'Rule') {
        nodeColor = '#1f2937';
        nodeShape = 'diamond';
        textColor = '#ffffff';
      } else if (n.type === 'Claim') {
        nodeColor = '#0284c7';
        nodeShape = 'hexagon';
        textColor = '#ffffff';
      } else if (n.type === 'Scenario') {
        nodeColor = '#9333ea';
        nodeShape = 'star';
        textColor = '#ffffff';
      }

      elements.push({
        data: {
          id: n.id,
          label: n.label || n.id,
          type: n.type,
          nodeColor,
          textColor,
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
            'color': 'data(textColor)',
            'font-size': '11px',
            'font-weight': 'bold',
            'font-family': 'Roboto Condensed, Arial Narrow, sans-serif',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'ellipsis',
            'text-max-width': '100',
            'width': '65px',
            'height': '35px',
            'background-color': 'data(nodeColor)',
            'border-width': '2px',
            'border-color': '#000000'
          }
        },
        {
          selector: 'node.Service',
          style: {
            'background-color': '#000000',
            'border-color': '#000000',
            'color': '#ffffff',
            'shape': 'round-rectangle',
            'width': '95px',
            'height': '42px'
          }
        },
        {
          selector: 'node.Evidence',
          style: {
            'shape': 'ellipse',
            'width': '52px',
            'height': '52px'
          }
        },
        {
          selector: 'node.Rule',
          style: {
            'shape': 'diamond',
            'width': '46px',
            'height': '46px',
            'background-color': '#1f2937',
            'border-color': '#000000'
          }
        },
        {
          selector: 'node.Claim',
          style: {
            'shape': 'hexagon',
            'width': '55px',
            'height': '40px',
            'background-color': '#000000',
            'border-color': '#000000'
          }
        },
        {
          selector: 'node.selected-ctx',
          style: {
            'border-width': '4px',
            'border-color': '#ca8a04',
            'underlay-color': '#facc15',
            'underlay-padding': '4px',
            'underlay-opacity': 0.6
          }
        },
        {
          selector: 'node.omitted-ctx',
          style: {
            'opacity': 0.4,
            'border-style': 'dashed',
            'border-color': '#6b7280'
          }
        },
        {
          selector: 'node.cex-ctx',
          style: {
            'border-width': '4px',
            'border-color': '#dc2626',
            'background-color': '#dc2626',
            'underlay-color': '#ef4444',
            'underlay-padding': '6px',
            'underlay-opacity': 0.6
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2.5,
            'line-color': '#000000',
            'target-arrow-color': '#000000',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '9px',
            'font-weight': 'bold',
            'font-family': 'Roboto Condensed, Arial Narrow, sans-serif',
            'color': '#000000',
            'text-rotation': 'autorotate',
            'text-margin-y': -8
          }
        },
        {
          selector: 'edge.CONTRADICTS',
          style: {
            'line-color': '#dc2626',
            'target-arrow-color': '#dc2626',
            'width': 3.5,
            'line-style': 'dashed'
          }
        },
        {
          selector: 'edge.DEPENDS_ON',
          style: {
            'line-color': '#000000',
            'target-arrow-color': '#000000',
            'width': 2.5
          }
        },
        {
          selector: 'edge.SUPPORTS',
          style: {
            'line-color': '#16a34a',
            'target-arrow-color': '#16a34a',
            'width': 2.5
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
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white border-2 border-black p-1.5 rounded-lg shadow-brutal">
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-black hover:bg-gray-100 rounded transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-black hover:bg-gray-100 rounded transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          onClick={handleFit}
          className="p-1.5 text-black hover:bg-gray-100 rounded transition"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          onClick={handleResetLayout}
          className="p-1.5 text-black hover:bg-gray-100 rounded transition"
          title="Reset Layout"
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Visual Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-black uppercase text-black mt-3 px-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-black border-2 border-black inline-block" />
          <span>Service (Black)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-green-600 border-2 border-black inline-block" />
          <span>Evidence Pass (Green)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-black inline-block" />
          <span>Evidence Fail (Red)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 border-2 border-black inline-block" />
          <span>Evidence Warning (Yellow)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border-2 border-yellow-500 bg-yellow-100 inline-block" />
          <span>Selected Context</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border-2 border-red-600 bg-red-100 inline-block" />
          <span>Counterexample</span>
        </div>
      </div>
    </div>
  );
};
