"""
Standalone CLI script to execute the 100-case evaluation benchmark and report metrics.
"""

import sys
import json
from pathlib import Path

# Add backend to python path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir / "backend"))

from app.api.benchmark import run_benchmark_suite

def main():
    print("=====================================================================")
    print(" CONTOUR EVALUATION BENCHMARK SUITE — 100 DETERMINISTIC TEST CASES")
    print("=====================================================================")
    
    summary = run_benchmark_suite(num_cases=100)
    
    print("\n--- BENCHMARK RESULTS ---")
    print(f"Total Test Scenarios Evaluated       : {summary.total_cases}")
    print(f"Fixed Random Seed                    : {summary.fixed_seed}")
    print(f"Full-Graph Agreement (Compiler)      : {summary.full_graph_agreement_compiler}%")
    print(f"Full-Graph Agreement (After Repair)  : {summary.full_graph_agreement_after_repair}%")
    print(f"Omission Detection Rate              : {summary.omission_detection_rate}%")
    print(f"Valid Counterexample Rate            : {summary.valid_counterexample_rate}%")
    print(f"False Positive Rate                  : {summary.false_positive_counterexample_rate}%")
    print(f"Average Context Reduction            : {summary.avg_context_reduction_pct}%")
    print(f"Average Baseline Tokens              : {summary.avg_tokens_baseline}")
    print(f"Average Compiler Tokens              : {summary.avg_tokens_compiler}")
    print(f"Average Decision Evaluation Runtime  : {summary.avg_eval_time_ms} ms")
    print("\nCategory Distribution:")
    for cat, count in summary.categories.items():
        print(f"  • {cat:<35}: {count} cases")
    print("=====================================================================")

if __name__ == "__main__":
    main()
