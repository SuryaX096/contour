import React from 'react';
import { X, Clock } from 'lucide-react';

interface Props {
  node: any | null;
  onClose: () => void;
}

export const NodeDetailsModal: React.FC<Props> = ({ node, onClose }) => {
  if (!node) return null;

  const props = node.properties || {};

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l-2 border-black shadow-2xl p-6 z-50 overflow-y-auto text-black">
      <div className="flex items-center justify-between pb-4 border-b-2 border-black">
        <div>
          <span className="text-xs font-black text-black uppercase tracking-wider bg-yellow-300 px-2 py-0.5 rounded border border-black">{node.type}</span>
          <h3 className="text-lg font-black text-black font-mono mt-1 break-all uppercase tracking-tight">{node.id}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-black hover:bg-gray-100 p-1.5 rounded-md border-2 border-black transition"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {props.title && (
          <div>
            <label className="text-xs font-black text-gray-700 uppercase tracking-tight block mb-1">Title</label>
            <div className="text-sm font-black text-black">{props.title}</div>
          </div>
        )}

        {props.status && (
          <div>
            <label className="text-xs font-black text-gray-700 uppercase tracking-tight block mb-1">Status</label>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-black uppercase tracking-tight border-2 ${
              props.status === 'PASSED' ? 'bg-green-100 text-green-900 border-green-700' :
              props.status === 'INCOMPATIBLE' || props.status === 'FAILED' ? 'bg-red-100 text-red-900 border-red-700' :
              'bg-yellow-100 text-yellow-900 border-yellow-700'
            }`}>
              {props.status}
            </span>
          </div>
        )}

        {props.validity_status && (
          <div>
            <label className="text-xs font-black text-gray-700 uppercase tracking-tight block mb-1">Validity SLA</label>
            <span className={`text-xs font-black uppercase px-2 py-0.5 rounded border ${
              props.validity_status === 'VALID' ? 'bg-gray-100 text-black border-black' : 'bg-yellow-100 text-yellow-900 border-yellow-700'
            }`}>
              {props.validity_status}
            </span>
          </div>
        )}

        {props.source_type && (
          <div>
            <label className="text-xs font-black text-gray-700 uppercase tracking-tight block mb-1">Source Type</label>
            <div className="text-xs font-mono font-bold text-black bg-gray-100 p-2 rounded border-2 border-black">{props.source_type}</div>
          </div>
        )}

        {props.timestamp && (
          <div>
            <label className="text-xs font-black text-gray-700 uppercase tracking-tight block mb-1">Timestamp</label>
            <div className="text-xs font-mono text-black font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-black" />
              {props.timestamp}
            </div>
          </div>
        )}

        {/* Payload / Raw Data */}
        {props.payload && (
          <div>
            <label className="text-xs font-black text-gray-700 uppercase tracking-tight block mb-1">Payload / Execution Metrics</label>
            <pre className="text-xs font-mono font-bold bg-gray-50 p-3 rounded border-2 border-black text-black overflow-x-auto max-h-48">
              {JSON.stringify(props.payload, null, 2)}
            </pre>
          </div>
        )}

        {/* Metadata */}
        {props.metadata && Object.keys(props.metadata).length > 0 && (
          <div>
            <label className="text-xs font-black text-gray-700 uppercase tracking-tight block mb-1">Provenance Metadata</label>
            <pre className="text-xs font-mono font-bold bg-gray-50 p-3 rounded border-2 border-black text-black overflow-x-auto max-h-48">
              {JSON.stringify(props.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
