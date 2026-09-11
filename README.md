# H O R I Z O N

> **Zero-Knowledge Private Credit & Risk Underwriting Protocol on Midnight Network**  
> *Prove you qualify for a loan without ever revealing your income, debt obligations, or financial numbers.*

[![Midnight Testnet](https://img.shields.io/badge/Midnight-Preview%20Testnet-blue.svg)](https://preview.midnightexplorer.com)
[![Compact Compiler](https://img.shields.io/badge/Compact%20Compiler-v0.34.0-emerald.svg)](https://github.com/midnight-ntwrk)
[![Proof Server](https://img.shields.io/badge/Proof%20Server-Docker%20:6300-purple.svg)](https://ghcr.io/midnight-ntwrk/proof-server)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)

---

## 🌟 Executive Overview

**Horizon** is a decentralized private lending protocol engineered natively for the **Midnight Network**. 

In conventional DeFi protocols (such as Aave or Compound), loans require massive overcollateralization (130%–200%) because the smart contract cannot assess borrower creditworthiness. Conversely, traditional financial underwriting demands intrusive KYC and total disclosure of private bank statements, exposing individuals and institutions to surveillance and data breaches.

**Horizon breaks this trilemma using Midnight's Dual-Ledger Architecture:**
* **Borrowers** evaluate their creditworthiness locally on client hardware, producing zero-knowledge proofs (zk-SNARKs) that prove their income, debt-to-income (DTI) ratio, and collateral satisfy the lender's risk parameters.
* **Lenders** establish transparent, risk-weighted liquidity pools with customizable underwriting rules.
* **Smart Contracts** verify mathematical inequalities in zero knowledge: **zero raw financial numbers ever touch the public ledger or leave the borrower's machine**.

---

## 🔬 The Public vs. Private Ledger Model

Midnight's dual-ledger model makes Horizon possible by strictly delineating public on-chain settlement from shielded client-side computation:

```
┌───────────────────────────────────────────────┬───────────────────────────────────────────────┐
│           PUBLIC LEDGER STATE                 │            SHIELDED WITNESS STATE             │
│        (Visible to anyone on Explorer)        │           (Strictly on Client Device)         │
├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ • Lender risk thresholds (min income, max DTI)│ • Borrower's actual annual income             │
│ • Available pool liquidity (NIGHT tokens)     │ • Borrower's existing liabilities & debts     │
│ • Loan lifecycle status (Active/Repaid/etc.)  │ • Borrower's computed debt-to-income ratio    │
│ • Collateral locked in escrow                 │ • Cryptographic blinding salt (256-bit)       │
│ • Public loan amount, term, and interest rate │ • Underlying reason for loan approval/denial │
│ • Repayment transaction hashes and timestamps  │ • Private credit score / repayment history    │
└───────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

---

## ⚡ Verified Testnet Deployment Information

Horizon is deployed and operating live on the **Midnight Preview Testnet**:

| Parameter | Live Value |
| :--- | :--- |
| **Network** | `Midnight Preview` (Substrate v2) |
| **Block Height** | `#815,539+` |
| **Deployed Contract Address** | [`0x9f32540f9f75d91dd1353deae6419b6c531ebff2428bb3567edcfccb580541ee`](https://preview.midnightexplorer.com/contracts/0x9f32540f9f75d91dd1353deae6419b6c531ebff2428bb3567edcfccb580541ee) |
| **Deploy Transaction Hash** | [`0x4b11e7924f3a8063da27c49093c432a8c7a3ed26cb29ea8bce009b4ec54cee26`](https://preview.midnightexplorer.com/transactions/0x4b11e7924f3a8063da27c49093c432a8c7a3ed26cb29ea8bce009b4ec54cee26) |
| **Live Explorer REST API** | `https://preview-service-v2-01.midnightexplorer.com/api/v1` |
| **Local Proof Server** | `http://127.0.0.1:6300` (`ghcr.io/midnight-ntwrk/proof-server:latest`) |

---

## 📐 Compact Smart Contract Architecture

The contract is written in Compact (`src/contracts/horizon.compact`) and compiled via `compactc` into ZKIR (Zero-Knowledge Intermediate Representation) and cryptographic circuit keys:

### 1. Circuit Overview
1. **`createLendingPool`**: Lenders register liquidity and define public underwriting constraints (`min_income`, `max_debt_to_income_bps`, `min_collateral_ratio_bps`, `interest_rate_bps`, `term_duration`).
2. **`submitFinancialSnapshot`**: Borrowers commit locally to their financial snapshot:
   $$C = \text{persistentHash}(\text{FinancialSnapshot})$$
   Only the 32-byte cryptographic hash is disclosed and stored on-chain.
3. **`requestLoan`**: Evaluates real zero-knowledge inequalities against pool thresholds:
   * $\text{Income} \ge \text{min\_income}$
   * $\text{DTI} \le \text{max\_debt\_to\_income\_bps}$
   * $\text{CR} \ge \text{min\_collateral\_ratio\_bps}$
   * $(C_{\text{dep}} \cdot 10000)_{128} \ge (L_{\text{req}} \cdot \text{CR})_{128}$
4. **`repayLoan`**: Processes loan debt amortization and collateral escrow unlock without division:
   $$(R_{\text{total}} \cdot 10000)_{128} \ge (L \cdot (10000 + r_{\text{bps}}))_{128}$$
5. **`liquidate`**: Permissionless liquidation callable by anyone if a loan remains unpaid past its on-chain due date ($\text{timestamp} > \text{due\_date}$).

---

## 🚀 Quickstart & Installation

### Prerequisites
* **Node.js**: v20.x or higher
* **Docker Desktop**: Required to run the official Midnight Proof Server container
* **Lace Wallet (Midnight Edition)**: Chrome / Brave browser extension configured for `Midnight Preview`

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/SIDDHUX9/horizon.git
cd horizon
npm install
```

### 2. Start the Midnight Proof Server (Docker)
In a separate terminal or background process:
```bash
docker run -d -p 6300:6300 ghcr.io/midnight-ntwrk/proof-server:latest
```
Verify the server is healthy:
```bash
curl http://127.0.0.1:6300/
# Returns HTTP 200 OK
```

### 3. Compile the Compact Smart Contract
Compiles `src/contracts/horizon.compact` into TypeScript bindings, 10 circuit keys, and 10 ZKIR modules:
```bash
npm run compile:compact
```

### 4. Generate Real ZK Proofs Locally
Connects to the running Midnight Proof Server on port 6300, computes real witnesses, and prints out the cryptographic proof hash:
```bash
npm run prove:real
```

### 5. Execute Full Loan Lifecycle Against Blockchain
Runs an automated end-to-end lifecycle (Pool Creation $\rightarrow$ Snapshot $\rightarrow$ Loan Disbursement $\rightarrow$ Repayment) generating authentic transaction hashes:
```bash
npm run lifecycle:run
```

### 6. Run the Web Application
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🖥️ Web Application Tour

The Horizon web frontend is designed with a warm luxury editorial aesthetic and includes 7 specialized views:

1. **Editorial Landing Page**
   * High-contrast editorial typography with a refined `H O R I Z O N` navbar brand.
   * Visual comparison of public ledger state vs. private shielded state.
   * Direct CTAs for Borrowers and Lenders.

2. **Lender Hub**
   * Deposit NIGHT tokens into transparent risk-weighted pools.
   * Set custom minimum income floor, maximum DTI ratio, minimum collateral ratio, and APR.
   * Track aggregate pool yield, active principal, and utilization without seeing individual borrower metrics.

3. **Borrower ZK Studio**
   * **Client-Side Financial Snapshot Generator**: Enter income and liabilities to compute a local 256-bit salted commitment.
   * **Live Network Request Auditor**: Real-time traffic monitor confirming **zero bytes of raw financial data** ever leave the browser.
   * **Real ZK Proof Generation**: Connects to the local proof server with authentic progress tracking.

4. **Active Loans & Repay Terminal**
   * View public loan state, collateral escrow balance, accrued interest, and maturity date.
   * Authenticated borrowers can inspect their locally decrypted snapshot.
   * Single-click repayment with instant collateral unlock upon debt satisfaction.

5. **Permissionless Liquidation Terminal**
   * Interactive protocol time controls (`+10 Days`, `+35 Days`) for testing loan default dynamics.
   * Execute permissionless liquidation on expired debt, automatically returning seized collateral to pool liquidity.

6. **Midnight Explorer & Transparency View**
   * Live block height and timestamp streaming directly from the Midnight Preview testnet indexer.
   * Side-by-side comparison of on-chain public data vs. confidential shielded state.
   * Direct deep-links to block explorer transactions on `preview.midnightexplorer.com`.

7. **Compact Contract & ZKIR Inspector**
   * Browse live syntax-highlighted Compact smart contract code.
   * Inspect the generated ZKIR files and circuit proving keys.

---

## 🔒 Security & Privacy Guarantees

* **Mathematical Zero Leakage:** The proof server only receives polynomial representations of the inequalities. The verifier only receives a boolean validity confirmation.
* **Non-Divisive Arithmetic:** All ratio and percentage comparisons are cross-multiplied into `Uint<128>` fields to prevent rounding errors or floating-point manipulation.
* **Salted Commitments:** Every financial snapshot is blinded with 256 bits of cryptographically secure random entropy ($\rho$), preventing dictionary and rainbow table attacks.
* **Permissionless Insolvency Clearing:** Liquidation is strictly enforced by contract timestamp logic ($\text{current\_time} > \text{due\_date}$), eliminating centralized liquidator gatekeepers.

---

## 📁 Repository Structure

```
horizon/
├── src/
│   ├── components/                 # React UI components
│   │   ├── EditorialLandingPage.tsx# Warm luxury landing page & navbar
│   │   ├── LenderHub.tsx           # Pool creation & liquidity management
│   │   ├── BorrowerStudio.tsx      # Private snapshot & ZK loan request
│   │   ├── LoanDetailTerminal.tsx  # Active debt amortization & repay
│   │   ├── LiquidationTerminal.tsx # Permissionless default liquidator
│   │   ├── TransparencyExplorer.tsx# Dual-ledger viewer & live explorer links
│   │   ├── ContractCodeViewer.tsx  # Compact source & ZKIR viewer
│   │   ├── Header.tsx              # Protocol header & time controls
│   │   └── WalletModal.tsx         # Lace Wallet connection modal
│   ├── contracts/                  # Smart contracts & runtime bindings
│   │   ├── horizon.compact         # Production Compact smart contract
│   │   ├── horizonSimulator.ts     # Protocol state manager & arithmetic
│   │   ├── deployed-contract.json  # Real testnet deployment record
│   │   └── compiled/               # compactc compiled keys & ZKIR
│   │       ├── contract/           # TypeScript runtime bindings
│   │       ├── keys/               # 10 circuit proving & verifying keys
│   │       └── zkir/               # 10 ZKIR circuit definition files
│   ├── services/                   # Wallet & blockchain services
│   │   ├── laceWallet.ts           # Midnight Lace wallet DApp connector
│   │   └── midnightLiveIndexer.ts  # Live Midnight Preview REST/Indexer API
│   ├── types/
│   │   └── horizon.ts              # Core protocol TypeScript declarations
│   ├── App.tsx                     # Main application controller
│   └── index.css                   # Tailwind & custom luxury styling
├── scripts/                        # Automation & testing scripts
│   ├── compile-compact.js          # Compact compilation runner
│   ├── generate-real-proof.js      # Authentic proof server generation test
│   ├── deploy-midnight.js          # Midnight Preview deployment script
│   └── execute-lifecycle.js        # Full 4-step on-chain lifecycle test
├── WHITEPAPER.md                   # Formal mathematical whitepaper
├── projectdetails.md               # Original protocol specifications
├── package.json                    # Project scripts & dependencies
└── vite.config.ts                  # Vite build configuration
```

---

## 🚀 Deploy to Production (Vercel)

Horizon Protocol is ready for instant one-click deployment on Vercel:

### Option 1: Vercel CLI
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy directly to production
vercel --prod
```

### Option 2: Vercel Dashboard (GitHub Git Integration)
1. Push your changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "Deploy Horizon Protocol to production"
   git push origin main
   ```
2. Navigate to [vercel.com/new](https://vercel.com/new).
3. Import your repository.
4. Framework Preset will automatically detect **Vite**.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**.

The bundled `vercel.json` automatically manages client-side SPA routing (`/whitepaper`, `/borrow`, `/lend`, `/explorer`, etc.) and sets production security and caching headers.

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

*Built with passion for the Midnight Network ecosystem. Zero-knowledge privacy for sovereign decentralized finance.*
