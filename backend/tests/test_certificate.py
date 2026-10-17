import pytest
from app.models.entities import DecisionOutcome, CertificateStatus
from app.verification.certificate import CertificateEngine

def test_certificate_generation_and_limitations():
    engine = CertificateEngine()
    cert = engine.generate_certificate(
        decision_id="dec-test-01",
        policy_id="policy:release-readiness:v1",
        policy_version="1.0.0",
        baseline_decision=DecisionOutcome.APPROVE,
        final_decision=DecisionOutcome.BLOCK,
        selected_evidence_ids=["e1", "e2"],
        omitted_evidence_ids=["e3"],
        dependency_paths=[{"path": ["svc:root", "dep:sub"]}],
        counterexamples_tested=5,
        counterexamples_found=1,
        context_repair_iterations=1,
        search_complete=True
    )

    assert cert.certificate_id.startswith("cert-")
    assert cert.status == CertificateStatus.COUNTEREXAMPLE_FOUND
    assert len(cert.limitations) >= 4
    assert any("not prove absence" in lim.lower() for lim in cert.limitations)
    assert len(cert.selected_context_hash) == 64
