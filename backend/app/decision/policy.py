"""
Release Readiness Decision Policy Registry for CONTOUR.
Defines explicit, versioned policies and rules.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class ReleaseRule(BaseModel):
    id: str
    name: str
    description: str
    policy_version: str
    severity: str
    mandatory: bool
    enabled: bool

class DecisionPolicy(BaseModel):
    id: str
    version: str
    name: str
    description: str
    rules: List[ReleaseRule]

DEFAULT_RELEASE_POLICY = DecisionPolicy(
    id="policy:release-readiness:v1",
    version="1.0.0",
    name="Standard Software Release Readiness Policy",
    description="Deterministic verification policy for microservice release gating.",
    rules=[
        ReleaseRule(
            id="RULE_CRIT_DEP_COMPAT",
            name="Critical Dependency Compatibility",
            description="All critical dependencies must have a known compatible version.",
            policy_version="1.0.0",
            severity="CRITICAL",
            mandatory=True,
            enabled=True
        ),
        ReleaseRule(
            id="RULE_MANDATORY_TESTS_PASS",
            name="Mandatory Tests Passing",
            description="Mandatory unit and integration test suites must have status PASSED.",
            policy_version="1.0.0",
            severity="CRITICAL",
            mandatory=True,
            enabled=True
        ),
        ReleaseRule(
            id="RULE_SECURITY_AUDIT_PASS",
            name="Security Vulnerability Audit",
            description="Security vulnerability scans must be clean without critical issues.",
            policy_version="1.0.0",
            severity="CRITICAL",
            mandatory=True,
            enabled=True
        ),
        ReleaseRule(
            id="RULE_NO_CONFLICTING_EVIDENCE",
            name="Evidence Consistency Verification",
            description="Conflicting evidence records must not exist or be silently resolved.",
            policy_version="1.0.0",
            severity="CRITICAL",
            mandatory=True,
            enabled=True
        ),
        ReleaseRule(
            id="RULE_NO_STALE_EVIDENCE",
            name="Evidence Freshness SLA",
            description="All evaluated evidence must be fresh and not marked STALE.",
            policy_version="1.0.0",
            severity="HIGH",
            mandatory=True,
            enabled=True
        ),
        ReleaseRule(
            id="RULE_PERF_BENCHMARK_PASS",
            name="Performance SLA Benchmark",
            description="Performance benchmark latency must be within acceptable SLA.",
            policy_version="1.0.0",
            severity="HIGH",
            mandatory=False,
            enabled=True
        )
    ]
)

class PolicyRegistry:
    def __init__(self):
        self._policies: Dict[str, DecisionPolicy] = {
            DEFAULT_RELEASE_POLICY.id: DEFAULT_RELEASE_POLICY
        }

    def get_policy(self, policy_id: str, version: Optional[str] = None) -> Optional[DecisionPolicy]:
        policy = self._policies.get(policy_id)
        if policy and version and policy.version != version:
            return None
        return policy

    def register_policy(self, policy: DecisionPolicy) -> None:
        self._policies[policy.id] = policy

policy_registry = PolicyRegistry()
