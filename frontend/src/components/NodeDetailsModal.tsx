import React from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, Shield, Clock } from 'lucide-react';

interface Props {
  node: any | null;
  onClose: () => void;
}

export const NodeDetailsModal: React.FC<Props> = ({ node, onClose }) => {
  if (!node) return null;

  const props = node.properties || {};

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-900 border-l border-slate-800 shadow-2xl p-6 z-50 overflow-y-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">{node.type}</span>
          <h3 className="text-base font-bold text-slate-100 font-mono mt-0.5 break-all">{node.id}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {props.title && (
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Title</label>
            <div className="text-sm font-medium text-slate-200">{props.title}</div>
          </div>
        )}

        {props.status && (
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Status</label>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold ${
              props.status === 'PASSED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
              props.status === 'INCOMPATIBLE' || props.status === 'FAILED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
              'bg-amber-950 text-amber-400 border border-amber-800'
            }`}>
              {props.status}
            </span>
          </div>
        )}

        {props.validity_status && (
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Validity SLA</label>
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${
              props.validity_status === 'VALID' ? 'bg-slate-800 text-slate-300' : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}>
              {props.validity_status}
            </span>
          </div>
        )}

        {props.source_type && (
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Source Type</label>
            <div className="text-xs font-mono text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">{props.source_type}</div>
          </div>
        )}

        {props.timestamp && (
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Timestamp</label>
            <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {props.timestamp}
            </div>
          </div>
        )}

        {/* Payload / Raw Data */}
        {props.payload && (
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Payload / Execution Metrics</label>
            <pre className="text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800 text-slate-300 overflow-x-auto max-h-48">
              {JSON.stringify(props.payload, null, 2)}
            </pre>
          </div>
        )}

        {/* Metadata */}
        {props.metadata && Object.keys(props.metadata).length > 0 && (
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Provenance Metadata</label>
            <pre className="text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800 text-slate-400 overflow-x-auto max-h-48">
              {JSON.stringify(props.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
