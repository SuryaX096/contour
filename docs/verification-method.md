# CONTOUR — Verification Methodology & Formal Specifications

## 1. Three Levels of Verification

CONTOUR distinguishes and implements three tiers of verification rigor:

### LEVEL 1 — Decision Agreement
Compares the deterministic decision $D(S, P)$ produced over the compiled candidate context $S$ against the reference decision $D(G, P)$ over the full known evidence graph $G$:
$$D(S, P) = D(G, P)$$
*Limitation*: Agreement on a baseline context does not prove that omitted dependencies are harmless.

### LEVEL 2 — Bounded Counterexample Search
Enumerates scenarios from a declared finite scenario space $\Omega$:
$$\forall \omega \in \Omega, \quad D(S \cup \omega, P) \stackrel{?}{=} D(S, P)$$
If a scenario $\omega^*$ causes $D(S \cup \omega^*, P) \neq D(S, P)$, $\omega^*$ is a candidate counterexample.
*Reporting Requirement*: If no counterexample is found within $\Omega$, CONTOUR reports:
`"No counterexample found within the tested scope."`
It never claims: `"No counterexample exists anywhere."`

### LEVEL 3 — Formal SMT Verification with Z3
Encodes the finite policy $P$ and context $S$ into first-order SMT formulas.
Axiom:
$$\text{approve} \iff (\text{crit\_deps\_compat} \land \text{tests\_pass} \land \text{sec\_pass} \land \text{no\_conflicts} \land \text{no\_stale})$$
Given scenario assumptions $\Phi_{\omega}$, Z3 evaluates:
$$\text{Check}(\Phi_{\omega} \land \text{approve} = \text{true})$$
- If `unsat`: Approval is formally impossible under the scenario; release MUST be blocked.
- If `sat`: A satisfying assignment is generated.

---

## 2. Context Repair Algorithm

```
Algorithm 1: Counterexample-Guided Context Repair (CEGCR)
---------------------------------------------------------
Input : Root entity E_root, Baseline Context S_0, Policy P, Validated Counterexample CEX
Output: Repaired Context S_repaired, Revised Decision D_new, Audit Certificate Cert

1: Identify target dependency D_target and evidence E_omitted from CEX
2: Retrieve shortest dependency path Pi = (E_root -> ... -> D_target -> E_omitted) from FalkorDB
3: Construct expanded context:
      S_repaired = S_0 U Nodes(Pi) U Edges(Pi)
4: Re-evaluate policy:
      D_new, Constraints = Evaluate(S_repaired, P)
5: Verify with Z3:
      SolverStatus = Z3_Verify(D_new, S_repaired, P)
6: Record repair iteration in FalkorDB:
      CREATE (CEX)-[:REPAIRS {iteration: 1}]->(Decision)
7: Generate VerificationCertificate(Cert)
8: Return S_repaired, D_new, Cert
```

---

## 3. Explicit Certificate Status Definitions

- `VERIFIED_WITHIN_DECLARED_SCOPE`: Baseline decision is APPROVE and exhaustive search over declared finite scenario space produced zero counterexamples.
- `COUNTEREXAMPLE_FOUND`: A validated scenario changed the outcome (typically from APPROVE to BLOCK), forcing context repair.
- `INSUFFICIENT_EVIDENCE`: Mandatory evidence records are missing, preventing approval.
- `INCONCLUSIVE`: Search limits or timeouts prevented complete evaluation.
- `VERIFICATION_FAILED`: Internal solver or evaluation exception encountered.
