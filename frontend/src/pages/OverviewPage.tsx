import React from 'react';
import { DecisionResponse, CounterexampleSearchResponse, ContextRepairResponse, VerificationCertificate } from '../types';
import { MetricCard } from '../components/MetricCard';
import { DecisionBadge } from '../components/DecisionBadge';
import { StatusPill } from '../components/StatusPill';
import { Play, Search, Wrench, Shield, ArrowRight, Activity, Cpu, Layers, Sparkles } from 'lucide-react';

interface Props {
  baselineDecision: DecisionResponse | null;
  counterexampleData: CounterexampleSearchResponse | null;
  repairData: ContextRepairResponse | null;
  certificate: VerificationCertificate | null;
  onRunBaseline: () => void;
  onRunSearch: () => void;
  onRunRepair: () => void;
  isLoading: boolean;
}

export const OverviewPage: React.FC<Props> = ({
  baselineDecision,
  counterexampleData,
  repairData,
  certificate,
  onRunBaseline,
  onRunSearch,
  onRunRepair,
  isLoading
}) => {
  const currentOutcome = repairData ? repairData.revised_outcome : baselineDecision?.outcome;

  return (
    <div className="space-y-6">
      {/* High-Contrast Hero Banner */}
      <div className="card p-7 bg-white border-2 border-black shadow-brutal">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-yellow-300 border-2 border-black text-black text-xs font-black tracking-tight uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SOFTWARE RELEASE READINESS DOMAIN</span>
            </div>
            <h1 className="text-3xl font-black text-black tracking-tighter uppercase font-sans">
              payment-service:v2.4.0 Gating Verification
            </h1>
            <p className="text-sm text-gray-800 font-bold max-w-2xl leading-snug tracking-tight">
              CONTOUR evaluates whether a reduced evidence context preserves the release decision, searches for hidden dependency counterexamples, and verifies formal reliability boundaries.
            </p>
          </div>

          {/* Decision Comparison Card */}
          <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-lg border-2 border-black shadow-sm">
            <div>
              <span className="text-xs text-black font-extrabold uppercase block mb-1">Baseline Decision:</span>
              <DecisionBadge outcome={baselineDecision?.outcome} size="sm" />
            </div>
            <ArrowRight className="w-5 h-5 text-black hidden sm:block stroke-[3]" />
            <div>
              <span className="text-xs text-black font-extrabold uppercase block mb-1">Repaired Decision:</span>
              <DecisionBadge outcome={currentOutcome} size="sm" />
            </div>
            <div className="border-l-2 border-black pl-4">
              <span className="text-xs text-black font-extrabold uppercase block mb-1">Verification Status:</span>
              <StatusPill status={certificate?.status} />
            </div>
          </div>
        </div>

        {/* Guided Action Buttons: Black, Yellow, Red */}
        <div className="mt-6 pt-6 border-t-2 border-black flex flex-wrap items-center gap-3">
          <button
            onClick={onRunBaseline}
            disabled={isLoading}
            className="btn btn-primary text-xs flex items-center gap-2 border-2 border-black font-black uppercase tracking-tight shadow-brutal"
          >
            <Play className="w-4 h-4 fill-current text-green-400" />
            <span>1. Evaluate Baseline Context</span>
          </button>

          <button
            onClick={onRunSearch}
            disabled={isLoading || !baselineDecision}
            className={`btn btn-warning text-xs flex items-center gap-2 border-2 border-black font-black uppercase tracking-tight shadow-brutal ${
              baselineDecision ? '' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <Search className="w-4 h-4 text-black stroke-[3]" />
            <span>2. Run Counterexample Search (Level 2 & 3)</span>
          </button>

          <button
            onClick={onRunRepair}
            disabled={isLoading || !counterexampleData || counterexampleData.counterexamples_found.length === 0}
            className={`btn btn-danger text-xs flex items-center gap-2 border-2 border-black font-black uppercase tracking-tight shadow-brutal ${
              counterexampleData && counterexampleData.counterexamples_found.length > 0
                ? 'animate-bounce'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <Wrench className="w-4 h-4 text-yellow-300 stroke-[3]" />
            <span>3. Execute Context Repair & Certify</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid (Black, Yellow, Red, Green) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="SELECTED EVIDENCE"
          value={baselineDecision ? `${baselineDecision.selected_evidence_ids.length}` : '—'}
          subtext={baselineDecision ? `Reduced from ${baselineDecision.context_cost.total_graph_evidence_count} total records` : 'Awaiting baseline evaluation'}
          icon={<Layers className="w-5 h-5 text-black" />}
          badge={
            baselineDecision && (
              <span className="text-xs font-black font-mono text-black bg-yellow-300 px-2.5 py-0.5 rounded border-2 border-black uppercase">
                -{baselineDecision.context_cost.reduction_percentage}% COST
              </span>
            )
          }
        />

        <MetricCard
          title="SCENARIOS TESTED"
          value={counterexampleData ? `${counterexampleData.scenarios_tested}` : '0'}
          subtext={counterexampleData?.completeness_metadata?.search_scope || 'Declared finite scenario space'}
          icon={<Search className="w-5 h-5 text-black stroke-[3]" />}
          badge={
            counterexampleData && (
              <span className="text-xs font-black font-mono text-white bg-red-600 px-2.5 py-0.5 rounded border-2 border-black uppercase">
                {counterexampleData.counterexamples_found.length} CEX FOUND
              </span>
            )
          }
        />

        <MetricCard
          title="FORMAL SOLVER (LEVEL 3)"
          value={certificate ? certificate.solver_status : 'STANDBY'}
          subtext="Z3 SMT first-order constraint solver"
          icon={<Cpu className="w-5 h-5 text-green-700 stroke-[2.5]" />}
          badge={
            <span className="text-xs font-black font-mono text-white bg-green-700 px-2.5 py-0.5 rounded border-2 border-black uppercase">
              SMT-LIB
            </span>
          }
        />

        <MetricCard
          title="CONTEXT REPAIR STATUS"
          value={repairData ? 'REPAIRED (1 ITER)' : 'UNREPAIRED'}
          subtext={repairData ? `Decision revised: ${repairData.previous_outcome} → ${repairData.revised_outcome}` : 'No counterexample applied yet'}
          icon={<Activity className="w-5 h-5 text-red-600 stroke-[3]" />}
          badge={
            repairData && (
              <span className="text-xs font-black font-mono text-white bg-red-600 px-2.5 py-0.5 rounded border-2 border-black uppercase">
                REVISED
              </span>
            )
          }
        />
      </div>

      {/* Verification Pipeline Architecture */}
      <div className="card p-6 bg-white border-2 border-black shadow-brutal">
        <h2 className="text-lg font-black text-black tracking-tight uppercase mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-black stroke-[3]" />
          <span>VERIFICATION PIPELINE ARCHITECTURE</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 p-5 rounded-lg border-2 border-black shadow-sm">
            <div className="text-xs font-black tracking-tight text-black uppercase mb-1.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black inline-block"></span>
              STAGE 1: CONTEXT COMPILATION
            </div>
            <p className="text-gray-900 text-xs font-bold leading-normal">
              Extracts a minimal evidence subgraph from FalkorDB required to satisfy mandatory release policy rules. Explicitly tracks omitted dependencies.
            </p>
          </div>

          <div className="bg-red-50 p-5 rounded-lg border-2 border-black shadow-sm">
            <div className="text-xs font-black tracking-tight text-red-800 uppercase mb-1.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-black inline-block"></span>
              STAGE 2: COUNTEREXAMPLE SEARCH
            </div>
            <p className="text-gray-900 text-xs font-bold leading-normal">
              Enumerates bounded scenarios in isolated memory. Employs Microsoft Z3 SMT solver to formally prove whether omitted dependencies violate policy axioms.
            </p>
          </div>

          <div className="bg-green-50 p-5 rounded-lg border-2 border-black shadow-sm">
            <div className="text-xs font-black tracking-tight text-green-800 uppercase mb-1.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600 border border-black inline-block"></span>
              STAGE 3: REPAIR & CERTIFICATION
            </div>
            <p className="text-gray-900 text-xs font-bold leading-normal">
              Expands the context with missing dependency paths, recomputes the deterministic decision, and produces an auditable SHA-256 signed verification record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
