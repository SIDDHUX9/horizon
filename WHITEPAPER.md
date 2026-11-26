# HORIZON PROTOCOL
## Zero-Knowledge Private Underwriting on Midnight — Design and Implementation Status

*Version 1.1 — Prototype Edition*  
*Repository: [SIDDHUX9/horizon](https://github.com/SIDDHUX9/horizon)*  
*Network target: Midnight Preview*  
*Deployment status: **not deployed / not verified***

---

## Status notice

This document distinguishes the Horizon **design** from the **current implementation**.

The Compact contract source, compiled keys, ZKIR, wallet connector, live indexer reads, and a Midnight.js 5 production client are real. The client is hard-gated behind an independently verified deployment record; because no deployment exists, it refuses to attach and no circuit call or transaction is submitted. The browser application exposes a local `localStorage` simulator only through explicit demo mode. Earlier documents advertised a verified deployment and prover benchmarks that could not be reproduced. Those claims have been removed.

No part of this document should be read as a statement that Horizon is audited, mainnet-ready, or safe for real funds.

---

## Abstract

Decentralized lending protocols generally require overcollateralization because public blockchains cannot evaluate borrower creditworthiness without exposing private financial data. Traditional underwriting solves that problem only by collecting intrusive disclosures and introducing centralized data custodians.

Horizon proposes a zero-knowledge underwriting model for Midnight's dual-ledger architecture. Borrowers keep income, debt, and derived ratios in a shielded witness domain. A Compact circuit enforces lender-published thresholds and publishes only the resulting state transition and a commitment. Lenders can verify eligibility as a boolean guarantee without observing the underlying numbers.

The repository already contains a substantive Compact contract with five circuits, real in-circuit inequality assertions, and a deployment-gated client with wrappers for all five circuits. Remaining work includes authoritative time, token custody, repayment economics, real deploy/proof submission, integration tests against a live deployment, and independently verified deployment.

---

## 1. Problem and design goals

### 1.1 Capital efficiency

Public lending protocols enforce:

$$
C_{\text{deposited}} \ge \mu \cdot L_{\text{borrowed}}, \quad \mu \in [1.25, 2.00]
$$

This protects lenders but traps capital and excludes borrowers without large existing balances.

### 1.2 Privacy

Off-chain KYC and centralized credit oracles introduce data custodians, censorable gatekeepers, and breach risk. Publishing raw financial data on a public ledger is not an acceptable alternative.

### 1.3 Goals

Horizon's design goals are:

1. Borrowers prove threshold satisfaction without disclosing raw values.
2. Lenders publish transparent, auditable pool parameters.
3. Underwriting inequalities are enforced by a Compact circuit.
4. Public state contains only commitments and loan lifecycle accounting.
5. Liquidation is deterministic and permissionless.
6. All claims about deployment and proof execution are independently verifiable.

---

## 2. Architecture

### 2.1 Intended layers

```
Borrower / Lender Client
  ├── wallet (DApp Connector)
  ├── private witness state
  ├── Compact runtime + compiled contract
  └── proof provider / proof server

Midnight Network
  ├── public dual ledger
  ├── consensus verification
  └── indexer / explorer
```

The current prototype implements the wallet connector, indexer reads, contract compilation artifacts, artifact serving with a pinned manifest hash, and a production client with circuit-call wrappers. The circuit-call path is gated off until a deployment is independently verified; the visible interactive protocol workflow is explicitly demo mode.

### 2.2 Public and private state

| Attribute | Intended location | Current implementation |
| :--- | :--- | :--- |
| Income and debt | Private witness | Browser form / simulator state |
| DTI and collateral ratio | Private witness | Browser form / simulator state |
| Blinding salt | Private witness | Browser-generated random bytes |
| Snapshot commitment | Public ledger | Compact `persistentHash` in contract; SHA-256 in simulator |
| Pool thresholds | Public ledger | Compact ledger map; simulated in UI |
| Pool liquidity | Public ledger | Integer accounting only; no NIGHT custody |
| Loan state | Public ledger | Compact ledger map; simulated in UI |
| Repayment records | Public ledger | Compact ledger map; simulated in UI |

### 2.3 Privacy boundary

The intended guarantee is that raw financial values remain in the witness and are never published. The demo keeps them in browser memory and `localStorage`; it does not transmit them. The production client prepares the witness in a password-protected browser-local store and relies on the Compact circuit to compute `persistentHash<FinancialSnapshot>`; it cannot be reached without a verified deployment. Neither path is evidence of a deployed zero-knowledge system today.

---

## 3. Cryptographic formulation

### 3.1 Snapshot commitment

A financial snapshot is modeled as:

$$
\mathcal{S} = \langle I, D, \text{DTI}, \text{CR}, \rho \rangle
$$

where $I$ is income, $D$ is existing debt, DTI and CR are basis-point ratios, and $\rho$ is a 32-byte blinding salt.

The Compact circuit computes:

$$
C_{\mathcal{S}} = \operatorname{persistentHash}(\mathcal{S})
$$

**Implementation note:** the demo simulator computes a SHA-256 digest of a colon-delimited string. This is incompatible with the Compact commitment and is shown only in demo mode. The production client passes the raw snapshot to the contract's witness; the circuit computes `persistentHash<FinancialSnapshot>` and stores that commitment. No production commitment has been broadcast because no deployment is verified.

### 3.2 Non-divisive inequalities

The circuit avoids division by cross-multiplying in `Uint<128>`:

$$
I \ge I_{\min}
$$

$$
\text{DTI} \le \text{DTI}_{\max}
$$

$$
\text{CR} \ge \text{CR}_{\min}
$$

$$
C_{\text{dep}} \cdot 10000 \ge L_{\text{req}} \cdot \text{CR}
$$

For repayment:

$$
\sum R \cdot 10000 \ge L \cdot (10000 + r_{\text{bps}})
$$

These relations are asserted in `src/contracts/horizon.compact` using Compact's unsigned integer operations.

### 3.3 Limits of the current guarantee

The circuit checks values supplied by the borrower's witness. It does not recompute DTI from independent proof of income or debt. The accurate claim is therefore:

> A borrower proves that self-declared private values satisfy the lender's thresholds and match a previously committed snapshot.

It is not accurate to claim verified income, verified employment, or an independently attested credit score.

---

## 4. Circuit specification

The Compact contract exposes five circuits.

### 4.1 `createLendingPool`

Initializes a lending pool and validates:

* positive deposit and term,
* minimum collateral ratio at least 10000 bps,
* maximum DTI at most 10000 bps.

### 4.2 `submitFinancialSnapshot`

Stores the public commitment derived from a private `FinancialSnapshot`. The current contract accepts an arbitrary borrower identifier and does not yet prove ownership of that identifier.

### 4.3 `requestLoan`

Recomputes the snapshot commitment and asserts equality with the stored commitment. It then checks income, DTI, collateral ratio, and collateral consistency inequalities, updates pool accounting, and creates an active loan record.

### 4.4 `repayLoan`

Accumulates repayments and evaluates the cross-multiplied solvency relation. On full repayment it marks the loan repaid and updates accounting. Current economics do not credit interest to the lender or refund overpayment.

### 4.5 `liquidate`

Allows permissionless liquidation when `current_time > due_date`, transitions the loan to liquidated, and returns collateral accounting to the pool. The current time input is caller-supplied and is not yet bound to a ledger clock.

---

## 5. Proof generation and compilation

### 5.1 Compilation

Use:

```bash
npm run compile:compact
```

The committed artifact directory contains:

* `contract/index.js` and `contract/index.d.ts`,
* `keys/<circuit>.prover`,
* `keys/<circuit>.verifier`,
* `zkir/<circuit>.zkir`,
* `zkir/<circuit>.bzkir`.

The ZK config provider convention uses `.bzkir` for ZKIR and `.prover` / `.verifier` for keys.

The compile script performs a safe compile check by default. It does not overwrite committed artifacts unless a complete key set is generated.

### 5.2 Proof server

The official proof server image is:

```bash
docker compose up -d horizon-proof-server
```

A proof server is required for real proving. The repository now provides `npm run preflight:proof` to check artifact integrity and proof-server reachability. It deliberately does not prove a Horizon circuit or fabricate a proof hash.

### 5.3 Benchmarks

No reproducible benchmark suite is included in this repository. Earlier latency and memory figures were unsupported and have been removed. Publish benchmarks only after a harness records end-to-end timings against a pinned proof-server version and hardware profile.

---

## 6. Security analysis

### 6.1 What is enforced today

The Compact source contains real assertions for the underwriting inequalities. The generated ZKIR contains the corresponding constraint operations. This is the strongest verified part of the project.

### 6.2 What is not yet enforced

* No NIGHT token custody: `coin`, `receive`, and `send` operations are absent.
* `current_time` is caller-supplied.
* Snapshot registration does not authenticate the borrower identifier.
* Pool parameter bounds are incomplete.
* Repayment and liquidation economics are incomplete.
* The browser cannot execute the compiled contract until a verified deployment exists.
* Automated integrity, gating, and script checks exist in `tests/` and CI, but there is no live-deployment integration suite and no third-party audit.

### 6.3 Deployment verification

The canonical deployment record is `src/contracts/deployed-contract.json`. Run:

```bash
npm run verify:deployment
```

The verifier queries the live Midnight Preview indexer and fails if the claimed contract address or deployment transaction cannot be found. The current record is explicitly `not-deployed`.

---

## 7. Roadmap

### Phase 1 — Integrity and client integration

* [x] Keep simulated state behind an explicit demo flag.
* [x] Integrate compiled contract bindings with a password-protected witness provider.
* [x] Use Compact-compatible commitments in the production client path (the circuit computes the hash).
* [x] Add circuit wrappers behind a verified-deployment gate.
* [x] Add automated artifact, gating, and script checks with CI.
* [ ] Replace simulated demo proving with production circuit calls against a verified deployment.
* [ ] Add live-deployment integration tests.

### Phase 2 — Protocol correctness

* Use an authoritative time source.
* Authenticate snapshot ownership.
* Add bounds and overflow-safe arithmetic.
* Implement real token custody and correct repayment/liquidation economics.

### Phase 3 — Production readiness

* Deploy a real backend for deploy endpoints or remove them.
* Verify deployment on-chain and publish only confirmed hashes.
* Add monitoring, incident process, and independent audit.
* Publish reproducible benchmarks.

---

## Conclusion

Horizon's core idea, Compact contract, compiled artifacts, and deployment-gated client are real and worth preserving. The project is not yet a production lending protocol. The path to mainnet is to deploy and independently verify the contract, exercise the client wrappers against that deployment, fix the protocol-level gaps, and let independently verified evidence support every public claim.

---

*© 2026 Horizon Protocol contributors. Published for the Midnight Network ecosystem.*
