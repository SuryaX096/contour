import React, { useState } from 'react';
import { VerificationCertificate } from '../types';
import { StatusPill } from '../components/StatusPill';
import { CertificateModal } from '../components/CertificateModal';
import { ShieldCheck, FileJson, AlertTriangle, Shield, CheckCircle2, Download, Copy } from 'lucide-react';

interface Props {
  certificate: VerificationCertificate | null;
}

export const VerificationReportPage: React.FC<Props> = ({ certificate }) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  if (!certificate) {
    return (
      <div className="card p-12 text-center text-slate-500">
        <Shield className="w-10 h-10 mx-auto text-slate-700 mb-3" />
        <h3 className="text-base font-bold text-slate-300">No Verification Certificate Issued</h3>
        <p className="text-xs text-slate-500 mt-1">
          Complete an evaluation and counterexample search cycle to generate a machine-readable audit certificate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Certificate Header Banner */}
      <div className="card p-6 bg-slate-900 border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
              FORMAL AUDIT RECORD
            </span>
            <h2 className="text-lg font-bold font-mono text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Certificate ID: {certificate.certificate_id}
            </h2>
            <div className="mt-1 text-xs text-slate-400 font-mono">
              Issued At: {certificate.created_at} | Decision Ref: {certificate.decision_id}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusPill status={certificate.status} />
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary text-xs flex items-center gap-2"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>View / Download Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verification Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-bold font-mono text-slate-100 border-b border-slate-800 pb-2">
            Verification Specifications & Scope
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Policy Identifier:</span>
              <span className="text-slate-200">{certificate.policy_id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Policy Version:</span>
              <span className="text-slate-200">{certificate.policy_version}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Verification Method:</span>
              <span className="text-indigo-400 font-semibold">{certificate.verification_method}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Z3 Solver Status:</span>
              <span className="text-cyan-400 font-semibold">{certificate.solver_status}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Search Completeness:</span>
              <span className="text-emerald-400 font-semibold">{certificate.search_complete ? 'EXHAUSTIVE WITHIN SCOPE' : 'PARTIAL'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Context SHA-256 Hash:</span>
              <span className="text-slate-400 truncate max-w-[200px]">{certificate.selected_context_hash}</span>
            </div>
          </div>
        </div>

        {/* Explicit Assumptions */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-bold font-mono text-slate-100 border-b border-slate-800 pb-2">
            Modeled Assumptions & Axioms
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 font-sans">
            {certificate.assumptions.map((asm, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{asm}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Explicit System Limitations */}
      <div className="card p-6 border-amber-900/50 bg-amber-950/10 space-y-3">
        <h3 className="text-sm font-bold font-mono text-amber-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Mandatory Verification Limitations & Boundaries
        </h3>
        <p className="text-xs text-slate-400">
          In compliance with the CONTOUR specification, verification claims are strictly qualified and mathematically bounded:
        </p>
        <ul className="space-y-2 text-xs text-slate-300 font-sans mt-2">
          {certificate.limitations.map((lim, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-amber-500 font-mono font-bold">•</span>
              <span>{lim}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Certificate Viewer Modal */}
      <CertificateModal
        certificate={certificate}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};
