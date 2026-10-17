import React from 'react';
import { DecisionResponse, CounterexampleSearchResponse, ContextRepairResponse, VerificationCertificate } from '../types';
import { MetricCard } from '../components/MetricCard';
import { DecisionBadge } from '../components/DecisionBadge';
import { StatusPill } from '../components/StatusPill';
import { Play, Search, Wrench, Shield, ArrowRight, Activity, Cpu, Layers } from 'lucide-react';

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
      {/* Top Banner / Hero */}
      <div className="card p-6 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border-indigo-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
              DEMONSTRATION DOMAIN: SOFTWARE RELEASE READINESS
            </span>
            <h1 className="text-2xl font-bold text-slate-100 font-mono">
              payment-service:v2.4.0 Gating Verification
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              CONTOUR evaluates whether a reduced evidence context preserves the release decision, searches for hidden dependency counterexamples, and verifies formal reliability boundaries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-slate-950/80 p-4 rounded-lg border border-slate-800">
            <div>
              <span className="text-xs text-slate-500 block">Baseline Decision:</span>
              <DecisionBadge outcome={baselineDecision?.outcome} size="sm" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
            <div>
              <span className="text-xs text-slate-500 block">Current/Repaired Decision:</span>
              <DecisionBadge outcome={currentOutcome} size="sm" />
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-xs text-slate-500 block">Verification Status:</span>
              <StatusPill status={certificate?.status} />
            </div>
          </div>
        </div>

        {/* Guided Interactive Stepper Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
          <button
            onClick={onRunBaseline}
            disabled={isLoading}
            className="btn btn-primary text-xs flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>1. Evaluate Baseline Context</span>
          </button>

          <button
            onClick={onRunSearch}
            disabled={isLoading || !baselineDecision}
            className="btn btn-secondary text-xs flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            <span>2. Run Counterexample Search (Level 2 & 3)</span>
          </button>

          <button
            onClick={onRunRepair}
            disabled={isLoading || !counterexampleData || counterexampleData.counterexamples_found.length === 0}
            className="btn btn-danger text-xs flex items-center gap-2"
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
          subtext={baselineDecision ? `Reduced from ${baselineDecision.context_cost.total_graph_evidence_count} total evidence records` : 'Awaiting baseline evaluation'}
          icon={<Layers className="w-4 h-4" />}
          badge={
            baselineDecision && (
              <span className="text-xs font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
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
              <span className="text-xs font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
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
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              SMT-LIB
            </span>
          }
        />

        <MetricCard
          title="Context Repair Status"
          value={repairData ? 'REPAIRED (1 ITER)' : 'UNREPAIRED'}
          subtext={repairData ? `Decision revised: ${repairData.previous_outcome} → ${repairData.revised_outcome}` : 'No counterexample applied yet'}
          icon={<Activity className="w-4 h-4" />}
          badge={
            repairData && (
              <span className="text-xs font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                REVISED
              </span>
            )
          }
        />
      </div>

      {/* Scenario Walkthrough Narrative */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-slate-100 font-mono mb-3">
          Verification Pipeline Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-slate-300">
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            <div className="text-indigo-400 font-bold mb-1">STAGE 1: CONTEXT COMPILATION</div>
            <p className="text-slate-400 font-sans text-xs">
              Extracts a minimal evidence subgraph from FalkorDB required to satisfy mandatory release policy rules. Tracks omitted dependencies.
            </p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            <div className="text-purple-400 font-bold mb-1">STAGE 2: COUNTEREXAMPLE SEARCH</div>
            <p className="text-slate-400 font-sans text-xs">
              Enumerates bounded scenarios in isolated memory. Employs the Z3 SMT solver to formally prove whether omitted dependencies violate policy axioms.
            </p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            <div className="text-emerald-400 font-bold mb-1">STAGE 3: REPAIR & CERTIFICATION</div>
            <p className="text-slate-400 font-sans text-xs">
              Expands the context with missing dependency paths, recomputes the deterministic decision, and produces an auditable verification record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
