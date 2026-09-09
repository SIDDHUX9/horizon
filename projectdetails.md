##horizon

#1. What This Is

A decentralized lending protocol where borrowers prove they qualify for a loan — sufficient income, acceptable debt-to-income ratio, adequate collateral, no defaults — without ever revealing their actual financial numbers to the lender, the contract, or anyone watching the chain. Lenders only ever see a cryptographic yes/no: this borrower satisfies my risk criteria.

The core insight this project sells to judges: normal on-chain lending (Aave, Compound, etc.) either requires full overcollateralization (because the protocol can't assess real creditworthiness) or requires KYC that exposes everything. Midnight lets you have risk-based underwriting without exposing the underlying financial data — this is a genuine unlock, not a cosmetic privacy feature bolted onto existing DeFi.

#2. Core Actors
Borrower — deposits collateral, submits a private financial snapshot, requests a loan against a lender's public criteria, repays over time
Lender — sets public risk thresholds (min income, max debt ratio, min collateral ratio) and a pool of NIGHT available to lend, never sees any borrower's actual numbers
Protocol/Contract — holds collateral in escrow, verifies proofs against thresholds, manages loan lifecycle and liquidation
#3. Data Model — Public vs. Private (this is the heart of the pitch)

Public ledger (visible to anyone, including on the explorer):

Lender's risk thresholds (e.g. "min collateral ratio: 150%, max debt-to-income: 40%")
Lender's available lending pool balance (NIGHT)
Loan status per loan ID: active / repaid / defaulted / liquidated
Collateral amount locked (NIGHT) per loan
Loan amount, interest rate, term
Repayment events (timestamp, amount) — proves activity without exposing why or from what income

Private state (never touches the public ledger, only exists as commitments + proofs):

Borrower's actual income figure
Borrower's actual existing debt obligations
Borrower's actual debt-to-income ratio
Borrower's internal credit history / repayment score (if you build the scoring mechanic)
The specific reason a loan was approved or rejected beyond pass/fail

This public/private split is what you put front and center in your README, demo video, and pitch — it's the single clearest way to show a judge "this could not be built the same way on a normal chain."

#4. Core Workflow — Loan Lifecycle

Step 1: Lender sets up a lending pool
Lender deposits NIGHT into a pool and defines public thresholds (min collateral ratio, max debt-to-income, min income floor). This is all public — anyone can see what a given lender requires, but not who applied or their numbers.

Step 2: Borrower prepares a financial snapshot (private)
Borrower's client locally assembles their financial data — income, existing debts, collateral ratio — and commits to it as a hash (similar in spirit to the Battleship board commitment, but numeric/comparative rather than positional). This snapshot never leaves the borrower's device in raw form.

Step 3: Borrower deposits collateral
Collateral (NIGHT) is locked into the contract's escrow — this part is public, since collateral custody has to be verifiable.

Step 4: Borrower requests a loan — requestLoan() circuit
The borrower's client generates a ZK proof that their private snapshot satisfies the lender's public thresholds (income ≥ floor, debt ratio ≤ ceiling, collateral ratio ≥ minimum) — without revealing the actual values, only that the inequality holds. The contract verifies the proof against the lender's stated thresholds and either approves or rejects the loan.

Step 5: Loan is disbursed
If approved, NIGHT is transferred from the lender's pool to the borrower. Loan terms (amount, rate, due date) become public state tied to a loan ID.

Step 6: Repayment
Borrower repays over time (single lump sum for MVP, or installments if time allows). Each repayment event is a public transaction, but it says nothing about the borrower's financial situation — just "loan #X, payment received."

Step 7: Loan closes — two paths

Full repayment → collateral released back to borrower, loan marked "repaid" publicly
Default / liquidation → if borrower misses payment deadline, lender (or anyone, permissionlessly) can trigger liquidate(), which seizes collateral and marks the loan "liquidated" publicly — again, without ever exposing why the borrower defaulted
5. Optional Advanced Mechanic (if your AI agents genuinely have runway): Private Credit History

Instead of every loan being a cold-start proof against static numbers, track a private repayment score:

Each successful on-time repayment updates the borrower's private credit score (via a witness function)
The borrower can later prove "my score is above threshold Z" to unlock better rates or higher borrowing limits from any lender in the protocol — without revealing the score itself or their full loan history
This is what makes the project feel like a real protocol rather than a one-shot underwriting demo — it's the differentiator most competing submissions won't attempt, since it requires private state that evolves over time rather than a single static commitment
6. Website / App Sub-Pages

1. Landing Page

Explains the core pitch in one screen: "Prove you qualify. Never reveal your numbers."
Visual diagram: public ledger vs. private state, side by side
CTA: Connect Lace Wallet

2. Lender Dashboard

Create a lending pool: deposit NIGHT, set thresholds (min income, max DTI, min collateral ratio, interest rate, loan term)
View existing pools you've created: available liquidity, active loans against your pool, aggregate repayment activity — all without seeing individual borrower data
Pool performance stats (default rate, total lent, total repaid) — public aggregate numbers only

3. Borrower Dashboard

Browse available lending pools with their public thresholds displayed
"Prepare Financial Snapshot" flow — local form (income, debts, collateral) that never submits raw data anywhere, only generates the commitment
Request loan against a chosen pool — triggers the proof generation + requestLoan() circuit call
View your active loans: amount owed, due date, repayment history
Make a repayment

4. Loan Detail Page

Per-loan view: status, collateral locked, amount, term, repayment history — all public fields
For the borrower specifically (authenticated view): their own private snapshot summary, locally decrypted, never re-exposed

5. Explorer / Transparency Page (this is your best demo asset)

Embedded or linked view into Midnight Explorer showing your contract's public transactions
Explicitly annotated: "Here's what's visible — loan status, collateral, repayments. Here's what's NOT visible — anywhere — income, debt, credit score."
This page exists specifically to make the privacy claim demonstrable on camera, not just asserted in text

6. Credit Score Page (if you build the advanced mechanic)

Borrower-only private view of their evolving score and history
"Prove eligibility" flow showing how a score threshold proof can unlock better terms without exposing the score

7. How It Works / Whitepaper Page

Technical explanation: dual-ledger model, witness functions, what a ZK proof is doing here in plain language
Architecture diagram: frontend → Compact contract → private state vs public ledger
This is your Communication-criterion asset — keep it clear and non-jargon-heavy, since a non-technical judge needs to follow it too

8. Test/Demo Mode Page (recommend including this deliberately)

A sandboxed flow letting a judge walk through the entire lifecycle themselves — create a mock pool, submit a snapshot, get approved/rejected, repay — using testnet tokens
This single page does more for your UX and Engineering scores than anything else, because it lets judges verify your claims themselves instead of trusting your demo video
7. What Makes This "Outsmart Others" Rather Than Just Another Lending Demo

Most competing submissions in this space will build a shallow version: hide a balance, show a lock icon, call it private lending. What separates yours:

The privacy claim is inequality-based, not just concealment-based — you're proving a comparison (income ≥ threshold) held true without revealing either number, which is a meaningfully harder and more interesting ZK pattern than just hiding a value
The Explorer/Transparency page makes the claim falsifiable — you're inviting scrutiny instead of just asserting privacy
The credit-history mechanic (if built) demonstrates evolving private state, not a one-time static proof — this is closer to how real underwriting works and shows deeper command of Midnight's model
A working test-mode judges can operate themselves removes the "trust the demo video" problem entirely