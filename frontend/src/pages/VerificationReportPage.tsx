import React, { useState } from 'react';
import { VerificationCertificate } from '../types';
import { StatusPill } from '../components/StatusPill';
import { CertificateModal } from '../components/CertificateModal';
import { ShieldCheck, FileJson, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';

interface Props {
  certificate: VerificationCertificate | null;
}

export const VerificationReportPage: React.FC<Props> = ({ certificate }) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  if (!certificate) {
    return (
      <div className="card p-12 text-center bg-white border-2 border-black shadow-brutal text-black">
        <Shield className="w-12 h-12 mx-auto text-black mb-3 stroke-[2.5]" />
        <h3 className="text-xl font-black uppercase tracking-tight text-black font-sans">
          No Verification Certificate Issued
        </h3>
        <p className="text-xs text-gray-700 font-bold mt-1 uppercase tracking-tight">
          Complete an evaluation and counterexample search cycle to generate a machine-readable audit certificate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Certificate Header Banner */}
      <div className="card p-6 bg-white border-2 border-black shadow-brutal">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-black uppercase tracking-wider bg-yellow-300 px-2 py-0.5 rounded border border-black">
              FORMAL AUDIT RECORD
            </span>
            <h2 className="text-xl font-black text-black uppercase tracking-tight mt-1 font-sans flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-green-700 stroke-[3]" />
              Certificate ID: {certificate.certificate_id}
            </h2>
            <div className="mt-1 text-xs text-gray-800 font-mono font-bold">
              Issued At: {certificate.created_at} | Decision Ref: {certificate.decision_id}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusPill status={certificate.status} />
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary text-xs flex items-center gap-2 border-2 border-black font-black uppercase tracking-tight shadow-brutal"
            >
              <FileJson className="w-4 h-4 text-yellow-300 stroke-[2.5]" />
              <span>View / Download Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verification Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 bg-white border-2 border-black shadow-brutal space-y-4">
          <h3 className="text-sm font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
            Verification Specifications & Scope
          </h3>
          <div className="space-y-2 text-xs font-mono font-bold">
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-700 uppercase">Policy Identifier:</span>
              <span className="text-black">{certificate.policy_id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-700 uppercase">Policy Version:</span>
              <span className="text-black">{certificate.policy_version}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-700 uppercase">Verification Method:</span>
              <span className="text-black bg-yellow-300 px-2 py-0.5 rounded border border-black">{certificate.verification_method}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-700 uppercase">Z3 Solver Status:</span>
              <span className="text-green-800 bg-green-100 px-2 py-0.5 rounded border border-green-700">{certificate.solver_status}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-700 uppercase">Search Completeness:</span>
              <span className="text-green-800 font-black">{certificate.search_complete ? 'EXHAUSTIVE WITHIN SCOPE' : 'PARTIAL'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-700 uppercase">Context SHA-256 Hash:</span>
              <span className="text-black truncate max-w-[200px]">{certificate.selected_context_hash}</span>
            </div>
          </div>
        </div>

        {/* Explicit Assumptions */}
        <div className="card p-6 bg-white border-2 border-black shadow-brutal space-y-4">
          <h3 className="text-sm font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
            Modeled Assumptions & Axioms
          </h3>
          <ul className="space-y-2 text-xs text-black font-bold font-sans">
            {certificate.assumptions.map((asm, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0 mt-0.5 stroke-[3]" />
                <span>{asm}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Explicit System Limitations */}
      <div className="card p-6 bg-yellow-50 border-2 border-black shadow-brutal space-y-3">
        <h3 className="text-sm font-black text-black uppercase tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-700 stroke-[3]" />
          Mandatory Verification Limitations & Boundaries
        </h3>
        <p className="text-xs text-gray-800 font-bold uppercase tracking-tight">
          In compliance with the CONTOUR specification, verification claims are strictly qualified and mathematically bounded:
        </p>
        <ul className="space-y-2 text-xs text-black font-bold font-sans mt-2">
          {certificate.limitations.map((lim, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-red-600 font-mono font-black text-sm">•</span>
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
