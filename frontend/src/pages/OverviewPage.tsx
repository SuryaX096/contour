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
      {/* Apple Pro Hero Banner */}
      <div className="card p-7 bg-gradient-to-br from-slate-900/90 via-indigo-950/20 to-slate-900/90 border-white/[0.08] relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-[11px] font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Software Release Readiness Domain</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
              payment-service:v2.4.0 Gating Verification
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              CONTOUR evaluates whether a reduced evidence context preserves the release decision, searches for hidden dependency counterexamples, and verifies formal reliability boundaries.
            </p>
          </div>

          {/* Decision State Card */}
          <div className="flex flex-wrap items-center gap-4 bg-white/[0.03] backdrop-blur-xl p-4 rounded-2xl border border-white/[0.08] shadow-inner">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Baseline Decision</span>
              <DecisionBadge outcome={baselineDecision?.outcome} size="sm" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
            <div>
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Repaired Decision</span>
              <DecisionBadge outcome={currentOutcome} size="sm" />
            </div>
            <div className="border-l border-white/[0.08] pl-4">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Verification Status</span>
              <StatusPill status={certificate?.status} />
            </div>
          </div>
        </div>

        {/* Guided Interactive 3-Step Pipeline Controls */}
        <div className="mt-7 pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={onRunBaseline}
            disabled={isLoading}
            className="btn btn-primary text-xs flex items-center gap-2 shadow-lg"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>1. Evaluate Baseline Context</span>
          </button>

          <button
            onClick={onRunSearch}
            disabled={isLoading || !baselineDecision}
            className={`btn btn-secondary text-xs flex items-center gap-2 ${
              baselineDecision ? 'hover:border-purple-400/40 hover:text-purple-300' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-purple-400" />
            <span>2. Run Counterexample Search (Level 2 & 3)</span>
          </button>

          <button
            onClick={onRunRepair}
            disabled={isLoading || !counterexampleData || counterexampleData.counterexamples_found.length === 0}
            className={`btn btn-danger text-xs flex items-center gap-2 ${
              counterexampleData && counterexampleData.counterexamples_found.length > 0
                ? 'animate-pulse'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>3. Execute Context Repair & Certify</span>
          </button>
        </div>
      </div>

      {/* Primary Telemetry Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Selected Evidence"
          value={baselineDecision ? `${baselineDecision.selected_evidence_ids.length}` : '—'}
          subtext={baselineDecision ? `Reduced from ${baselineDecision.context_cost.total_graph_evidence_count} total records` : 'Awaiting baseline evaluation'}
          icon={<Layers className="w-4 h-4" />}
          badge={
            baselineDecision && (
              <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-400/30">
                -{baselineDecision.context_cost.reduction_percentage}% cost
              </span>
            )
          }
        />

        <MetricCard
          title="Scenarios Tested"
          value={counterexampleData ? `${counterexampleData.scenarios_tested}` : '0'}
          subtext={counterexampleData?.completeness_metadata?.search_scope || 'Declared finite scenario space'}
          icon={<Search className="w-4 h-4" />}
          badge={
            counterexampleData && (
              <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-400/30">
                {counterexampleData.counterexamples_found.length} CEX found
              </span>
            )
          }
        />

        <MetricCard
          title="Formal Solver (Level 3)"
          value={certificate ? certificate.solver_status : 'STANDBY'}
          subtext="Z3 SMT first-order constraint solver"
          icon={<Cpu className="w-4 h-4 text-cyan-400" />}
          badge={
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-400/30">
              SMT-LIB
            </span>
          }
        />

        <MetricCard
          title="Context Repair Status"
          value={repairData ? 'REPAIRED (1 ITER)' : 'UNREPAIRED'}
          subtext={repairData ? `Decision revised: ${repairData.previous_outcome} → ${repairData.revised_outcome}` : 'No counterexample applied yet'}
          icon={<Activity className="w-4 h-4 text-emerald-400" />}
          badge={
            repairData && (
              <span className="text-[11px] font-mono text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-400/30">
                REVISED
              </span>
            )
          }
        />
      </div>

      {/* Verification Pipeline Architecture Cards */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-white tracking-tight mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span>Verification Pipeline Architecture</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/[0.02] hover:bg-white/[0.04] p-5 rounded-xl border border-white/[0.06] transition-colors">
            <div className="text-[11px] font-bold tracking-wider text-indigo-400 uppercase font-sans mb-1.5">
              STAGE 1: CONTEXT COMPILATION
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Extracts a minimal evidence subgraph from FalkorDB required to satisfy mandatory release policy rules. Explicitly tracks omitted dependencies.
            </p>
          </div>

          <div className="bg-white/[0.02] hover:bg-white/[0.04] p-5 rounded-xl border border-white/[0.06] transition-colors">
            <div className="text-[11px] font-bold tracking-wider text-purple-400 uppercase font-sans mb-1.5">
              STAGE 2: COUNTEREXAMPLE SEARCH
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Enumerates bounded scenarios in isolated memory. Employs Microsoft Z3 SMT solver to formally prove whether omitted dependencies violate policy axioms.
            </p>
          </div>

          <div className="bg-white/[0.02] hover:bg-white/[0.04] p-5 rounded-xl border border-white/[0.06] transition-colors">
            <div className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase font-sans mb-1.5">
              STAGE 3: REPAIR & CERTIFICATION
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Expands the context with missing dependency paths, recomputes the deterministic decision, and produces an auditable SHA-256 signed verification record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
