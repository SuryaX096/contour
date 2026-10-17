import React, { useState, useEffect } from 'react';
import {
  HealthData,
  GraphData,
  DecisionResponse,
  CounterexampleSearchResponse,
  ContextRepairResponse,
  VerificationCertificate
} from './types';
import {
  fetchHealth,
  seedDemoData,
  fetchGraph,
  evaluateDecision,
  searchCounterexamples,
  repairContext,
  fetchCertificate
} from './api/client';
import { Header } from './components/Header';
import { OverviewPage } from './pages/OverviewPage';
import { GraphExplorerPage } from './pages/GraphExplorerPage';
import { CompilerPage } from './pages/CompilerPage';
import { CounterexampleLabPage } from './pages/CounterexampleLabPage';
import { DecisionComparisonPage } from './pages/DecisionComparisonPage';
import { VerificationReportPage } from './pages/VerificationReportPage';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [health, setHealth] = useState<HealthData | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [baselineDecision, setBaselineDecision] = useState<DecisionResponse | null>(null);
  const [counterexampleData, setCounterexampleData] = useState<CounterexampleSearchResponse | null>(null);
  const [repairData, setRepairData] = useState<ContextRepairResponse | null>(null);
  const [certificate, setCertificate] = useState<VerificationCertificate | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setErrorMsg(null);
      const h = await fetchHealth();
      setHealth(h);
      const g = await fetchGraph();
      setGraphData(g);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to CONTOUR backend.');
    }
  };

  const handleSeedReset = async () => {
    try {
      setIsSeeding(true);
      setErrorMsg(null);
      await seedDemoData();
      setBaselineDecision(null);
      setCounterexampleData(null);
      setRepairData(null);
      setCertificate(null);
      await loadInitialData();
    } catch (err: any) {
      setErrorMsg(`Reset failed: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleRunBaseline = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const dec = await evaluateDecision({
        root_entity: 'service:payment-service:v2.4.0',
        policy_id: 'policy:release-readiness:v1',
        policy_version: '1.0.0',
        context_budget: 5
      });
      setBaselineDecision(dec);
      // Fetch initial certificate
      const g = await fetchGraph();
      setGraphData(g);
    } catch (err: any) {
      setErrorMsg(`Baseline evaluation error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSearch = async () => {
    if (!baselineDecision) return;
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await searchCounterexamples({
        decision_id: baselineDecision.decision_id,
        max_scenarios: 20,
        include_formal_solver: true
      });
      setCounterexampleData(res);
      setActiveTab('counterexample');
    } catch (err: any) {
      setErrorMsg(`Search error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunRepair = async () => {
    if (!baselineDecision || !counterexampleData || counterexampleData.counterexamples_found.length === 0) return;
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const targetCex = counterexampleData.counterexamples_found[0];
      const res = await repairContext({
        decision_id: baselineDecision.decision_id,
        counterexample_id: targetCex.scenario_id
      });
      setRepairData(res);

      // Load updated certificate
      const cert = await fetchCertificate(res.certificate_id);
      setCertificate(cert);

      // Refresh graph view with repaired nodes/edges
      const g = await fetchGraph();
      setGraphData(g);

      setActiveTab('comparison');
    } catch (err: any) {
      setErrorMsg(`Repair error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        onSeedReset={handleSeedReset}
        isSeeding={isSeeding}
      />

      {errorMsg && (
        <div className="max-w-7xl mx-auto w-full px-6 pt-4">
          <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-lg flex items-center justify-between text-xs font-mono text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={loadInitialData}
              className="text-xs underline hover:text-white flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry Connection
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto w-full px-6 py-6 flex-1">
        {activeTab === 'overview' && (
          <OverviewPage
            baselineDecision={baselineDecision}
            counterexampleData={counterexampleData}
            repairData={repairData}
            certificate={certificate}
            onRunBaseline={handleRunBaseline}
            onRunSearch={handleRunSearch}
            onRunRepair={handleRunRepair}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'graph' && (
          <GraphExplorerPage
            graphData={graphData}
            baselineDecision={baselineDecision}
            counterexampleData={counterexampleData}
          />
        )}

        {activeTab === 'compiler' && (
          <CompilerPage baselineDecision={baselineDecision} />
        )}

        {activeTab === 'counterexample' && (
          <CounterexampleLabPage
            baselineDecision={baselineDecision}
            counterexampleData={counterexampleData}
            repairData={repairData}
            onRunSearch={handleRunSearch}
            onRunRepair={handleRunRepair}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'comparison' && (
          <DecisionComparisonPage
            baselineDecision={baselineDecision}
            repairData={repairData}
          />
        )}

        {activeTab === 'certificate' && (
          <VerificationReportPage certificate={certificate} />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkPage />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        CONTOUR — Graph-Native Decision Reliability Compiler • Powered by FalkorDB, Z3 SMT Solver & Cytoscape.js
      </footer>
    </div>
  );
};

export default App;
