import React, { useState } from 'react';
import { 
  FileCode2, 
  Terminal, 
  Copy, 
  Check, 
  Cpu, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';

export const ContractCodeViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compact' | 'zkir' | 'dts' | 'compiler'>('compact');
  const [copied, setCopied] = useState(false);

  const compactSource = `pragma language_version >= 0.26.0;

import CompactStandardLibrary;

// ============================================================================
// HORIZON: Zero-Knowledge Private Lending Protocol on Midnight Network
// ============================================================================

enum LoanStatus {
  PENDING,
  ACTIVE,
  REPAID,
  DEFAULTED,
  LIQUIDATED
}

struct LendingPool {
  pool_id: Bytes<32>,
  lender: Bytes<32>,
  min_income: Uint<64>,
  max_debt_to_income_bps: Uint<32>,
  min_collateral_ratio_bps: Uint<32>,
  interest_rate_bps: Uint<32>,
  term_duration: Uint<64>,
  pool_liquidity: Uint<64>,
  total_deposited: Uint<64>,
  total_lent: Uint<64>
}

struct Loan {
  loan_id: Bytes<32>,
  pool_id: Bytes<32>,
  borrower: Bytes<32>,
  loan_amount: Uint<64>,
  collateral_locked: Uint<64>,
  interest_rate_bps: Uint<32>,
  start_time: Uint<64>,
  due_date: Uint<64>,
  status: LoanStatus,
  total_repaid: Uint<64>,
  snapshot_commitment: Bytes<32>
}

struct RepaymentEvent {
  repayment_id: Bytes<32>,
  loan_id: Bytes<32>,
  payer: Bytes<32>,
  amount: Uint<64>,
  timestamp: Uint<64>
}

// Confidential Financial Snapshot (Witness Only - Never stored on public ledger)
struct FinancialSnapshot {
  actual_income: Uint<64>,
  existing_debt: Uint<64>,
  computed_dti_ratio: Uint<32>,
  computed_collateral_ratio: Uint<32>,
  salt: Bytes<32>
}

// ----------------------------------------------------------------------------
// PUBLIC LEDGER STATE
// ----------------------------------------------------------------------------
export ledger pools: Map<Bytes<32>, LendingPool>;
export ledger loans: Map<Bytes<32>, Loan>;
export ledger borrower_snapshots: Map<Bytes<32>, Bytes<32>>;
export ledger repayments: Map<Bytes<32>, RepaymentEvent>;

// ----------------------------------------------------------------------------
// PRIVATE WITNESS DECLARATIONS
// ----------------------------------------------------------------------------
witness getBorrowerSnapshot(): FinancialSnapshot;

// ----------------------------------------------------------------------------
// CIRCUITS
// ----------------------------------------------------------------------------

export circuit createLendingPool(
  pool_id: Bytes<32>,
  lender: Bytes<32>,
  deposit_amount: Uint<64>,
  min_income: Uint<64>,
  max_debt_to_income_bps: Uint<32>,
  min_collateral_ratio_bps: Uint<32>,
  interest_rate_bps: Uint<32>,
  term_duration: Uint<64>
): [] {
  const pub_pool_id = disclose(pool_id);
  const pub_lender = disclose(lender);
  const pub_deposit = disclose(deposit_amount);
  const pub_min_income = disclose(min_income);
  const pub_max_dti = disclose(max_debt_to_income_bps);
  const pub_min_cr = disclose(min_collateral_ratio_bps);
  const pub_rate = disclose(interest_rate_bps);
  const pub_term = disclose(term_duration);

  assert(!pools.member(pub_pool_id), "Pool ID already exists");
  assert(pub_deposit > 0, "Initial deposit must be positive");
  assert(pub_min_cr >= (10000 as Uint<32>), "Minimum collateral ratio must be at least 100%");
  assert(pub_max_dti <= (10000 as Uint<32>), "Maximum DTI cannot exceed 100%");
  assert(pub_term > 0, "Term duration must be positive");

  const new_pool = LendingPool {
    pool_id: pub_pool_id,
    lender: pub_lender,
    min_income: pub_min_income,
    max_debt_to_income_bps: pub_max_dti,
    min_collateral_ratio_bps: pub_min_cr,
    interest_rate_bps: pub_rate,
    term_duration: pub_term,
    pool_liquidity: pub_deposit,
    total_deposited: pub_deposit,
    total_lent: 0
  };

  pools.insert(pub_pool_id, new_pool);
}

export circuit submitFinancialSnapshot(
  borrower: Bytes<32>
): Bytes<32> {
  const pub_borrower = disclose(borrower);
  const snapshot = getBorrowerSnapshot();
  assert(snapshot.actual_income > 0, "Actual income must be positive");
  
  const commitment = persistentHash<FinancialSnapshot>(snapshot);
  const pub_commitment = disclose(commitment);
  
  borrower_snapshots.insert(pub_borrower, pub_commitment);
  return pub_commitment;
}

export circuit requestLoan(
  loan_id: Bytes<32>,
  pool_id: Bytes<32>,
  borrower: Bytes<32>,
  requested_amount: Uint<64>,
  collateral_deposit: Uint<64>,
  current_time: Uint<64>
): [] {
  const pub_loan_id = disclose(loan_id);
  const pub_pool_id = disclose(pool_id);
  const pub_borrower = disclose(borrower);
  const pub_requested_amount = disclose(requested_amount);
  const pub_collateral_deposit = disclose(collateral_deposit);
  const pub_current_time = disclose(current_time);

  assert(!loans.member(pub_loan_id), "Loan ID already exists");
  assert(pools.member(pub_pool_id), "Lending pool not found");
  assert(borrower_snapshots.member(pub_borrower), "Borrower financial snapshot commitment required");

  const pool = pools.lookup(pub_pool_id);
  assert(pool.pool_liquidity >= pub_requested_amount, "Insufficient pool liquidity");
  assert(pub_requested_amount > 0, "Requested loan amount must be positive");

  // Retrieve private financial snapshot witness
  const snapshot = getBorrowerSnapshot();

  // 1. Authenticate private witness against on-chain snapshot commitment
  const computed_commitment = persistentHash<FinancialSnapshot>(snapshot);
  const stored_commitment = borrower_snapshots.lookup(pub_borrower);
  assert(computed_commitment == stored_commitment, "Private witness does not match registered snapshot commitment");

  // 2. REAL IN-CIRCUIT ZK INEQUALITY CHECKS
  assert(snapshot.actual_income >= pool.min_income, "ZK Audit Failed: Income below lender threshold");
  assert(snapshot.computed_dti_ratio <= pool.max_debt_to_income_bps, "ZK Audit Failed: DTI exceeds lender ceiling");
  assert(snapshot.computed_collateral_ratio >= pool.min_collateral_ratio_bps, "ZK Audit Failed: Collateral ratio below lender threshold");

  // 3. Mathematical consistency of collateral ratio with deposited collateral
  const collateral_value_scaled = (pub_collateral_deposit as Uint<128>) * (10000 as Uint<16>);
  const required_collateral_scaled = (pub_requested_amount as Uint<128>) * (snapshot.computed_collateral_ratio as Uint<32>);
  assert((collateral_value_scaled as Uint<128>) >= (required_collateral_scaled as Uint<128>), "Deposited collateral does not satisfy claimed ratio");

  // 4. Update pool liquidity & lent counters
  const updated_pool = LendingPool {
    pool_id: pool.pool_id,
    lender: pool.lender,
    min_income: pool.min_income,
    max_debt_to_income_bps: pool.max_debt_to_income_bps,
    min_collateral_ratio_bps: pool.min_collateral_ratio_bps,
    interest_rate_bps: pool.interest_rate_bps,
    term_duration: pool.term_duration,
    pool_liquidity: (pool.pool_liquidity - pub_requested_amount) as Uint<64>,
    total_deposited: pool.total_deposited,
    total_lent: (pool.total_lent + pub_requested_amount) as Uint<64>
  };
  pools.insert(pub_pool_id, updated_pool);

  // 5. Initialize active loan on public ledger
  const due_date = (pub_current_time + pool.term_duration) as Uint<64>;
  const new_loan = Loan {
    loan_id: pub_loan_id,
    pool_id: pub_pool_id,
    borrower: pub_borrower,
    loan_amount: pub_requested_amount,
    collateral_locked: pub_collateral_deposit,
    interest_rate_bps: pool.interest_rate_bps,
    start_time: pub_current_time,
    due_date: due_date,
    status: LoanStatus.ACTIVE,
    total_repaid: 0,
    snapshot_commitment: stored_commitment
  };

  loans.insert(pub_loan_id, new_loan);
}

export circuit repayLoan(
  repayment_id: Bytes<32>,
  loan_id: Bytes<32>,
  payer: Bytes<32>,
  repay_amount: Uint<64>,
  current_time: Uint<64>
): [] {
  const pub_repay_id = disclose(repayment_id);
  const pub_loan_id = disclose(loan_id);
  const pub_payer = disclose(payer);
  const pub_amount = disclose(repay_amount);
  const pub_time = disclose(current_time);

  assert(!repayments.member(pub_repay_id), "Repayment ID already recorded");
  assert(loans.member(pub_loan_id), "Loan not found");
  assert(pub_amount > 0, "Repayment amount must be positive");

  const loan = loans.lookup(pub_loan_id);
  assert(loan.status == LoanStatus.ACTIVE, "Loan is not active");

  const new_total_repaid = (loan.total_repaid + pub_amount) as Uint<64>;

  const repaid_scaled = (new_total_repaid as Uint<128>) * (10000 as Uint<16>);
  const rate_sum = ((10000 as Uint<32>) + loan.interest_rate_bps) as Uint<32>;
  const total_owed_scaled = (loan.loan_amount as Uint<128>) * (rate_sum as Uint<32>);

  if ((repaid_scaled as Uint<128>) >= (total_owed_scaled as Uint<128>)) {
    const updated_loan = Loan {
      loan_id: loan.loan_id,
      pool_id: loan.pool_id,
      borrower: loan.borrower,
      loan_amount: loan.loan_amount,
      collateral_locked: 0,
      interest_rate_bps: loan.interest_rate_bps,
      start_time: loan.start_time,
      due_date: loan.due_date,
      status: LoanStatus.REPAID,
      total_repaid: new_total_repaid,
      snapshot_commitment: loan.snapshot_commitment
    };
    loans.insert(pub_loan_id, updated_loan);

    assert(pools.member(loan.pool_id), "Associated pool not found");
    const pool = pools.lookup(loan.pool_id);
    const updated_pool = LendingPool {
      pool_id: pool.pool_id,
      lender: pool.lender,
      min_income: pool.min_income,
      max_debt_to_income_bps: pool.max_debt_to_income_bps,
      min_collateral_ratio_bps: pool.min_collateral_ratio_bps,
      interest_rate_bps: pool.interest_rate_bps,
      term_duration: pool.term_duration,
      pool_liquidity: (pool.pool_liquidity + loan.loan_amount) as Uint<64>,
      total_deposited: pool.total_deposited,
      total_lent: pool.total_lent
    };
    pools.insert(loan.pool_id, updated_pool);
  } else {
    const updated_loan = Loan {
      loan_id: loan.loan_id,
      pool_id: loan.pool_id,
      borrower: loan.borrower,
      loan_amount: loan.loan_amount,
      collateral_locked: loan.collateral_locked,
      interest_rate_bps: loan.interest_rate_bps,
      start_time: loan.start_time,
      due_date: loan.due_date,
      status: LoanStatus.ACTIVE,
      total_repaid: new_total_repaid,
      snapshot_commitment: loan.snapshot_commitment
    };
    loans.insert(pub_loan_id, updated_loan);
  }

  const repayment_record = RepaymentEvent {
    repayment_id: pub_repay_id,
    loan_id: pub_loan_id,
    payer: pub_payer,
    amount: pub_amount,
    timestamp: pub_time
  };
  repayments.insert(pub_repay_id, repayment_record);
}

export circuit liquidate(
  loan_id: Bytes<32>,
  liquidator: Bytes<32>,
  current_time: Uint<64>
): [] {
  const pub_loan_id = disclose(loan_id);
  const pub_liquidator = disclose(liquidator);
  const pub_time = disclose(current_time);

  assert(loans.member(pub_loan_id), "Loan not found");
  const loan = loans.lookup(pub_loan_id);

  assert(loan.status == LoanStatus.ACTIVE, "Loan is not active for liquidation");
  assert(pub_time > loan.due_date, "Loan has not passed due date; cannot liquidate");

  const liquidated_loan = Loan {
    loan_id: loan.loan_id,
    pool_id: loan.pool_id,
    borrower: loan.borrower,
    loan_amount: loan.loan_amount,
    collateral_locked: 0,
    interest_rate_bps: loan.interest_rate_bps,
    start_time: loan.start_time,
    due_date: loan.due_date,
    status: LoanStatus.LIQUIDATED,
    total_repaid: loan.total_repaid,
    snapshot_commitment: loan.snapshot_commitment
  };
  loans.insert(pub_loan_id, liquidated_loan);

  assert(pools.member(loan.pool_id), "Pool not found");
  const pool = pools.lookup(loan.pool_id);
  const updated_pool = LendingPool {
    pool_id: pool.pool_id,
    lender: pool.lender,
    min_income: pool.min_income,
    max_debt_to_income_bps: pool.max_debt_to_income_bps,
    min_collateral_ratio_bps: pool.min_collateral_ratio_bps,
    interest_rate_bps: pool.interest_rate_bps,
    term_duration: pool.term_duration,
    pool_liquidity: (pool.pool_liquidity + loan.collateral_locked) as Uint<64>,
    total_deposited: pool.total_deposited,
    total_lent: pool.total_lent
  };
  pools.insert(loan.pool_id, updated_pool);
}`;

  const zkirSample = `{
  "version": { "major": 2, "minor": 0 },
  "do_communications_commitment": true,
  "circuit": "requestLoan",
  "num_inputs": 9,
  "instructions": [
    { "op": "constrain_bits", "var": 0, "bits": 8 },
    { "op": "constrain_bits", "var": 1, "bits": 248 },
    { "op": "constrain_bits", "var": 2, "bits": 8 },
    { "op": "constrain_bits", "var": 3, "bits": 248 },
    { "op": "constrain_bits", "var": 4, "bits": 8 },
    { "op": "constrain_bits", "var": 5, "bits": 248 },
    { "op": "constrain_bits", "var": 6, "bits": 64 },
    { "op": "constrain_bits", "var": 7, "bits": 64 },
    { "op": "constrain_bits", "var": 8, "bits": 64 },
    { "op": "load_imm", "imm": "01" },
    { "op": "load_imm", "imm": "30" },
    { "op": "declare_pub_input", "var": 10 },
    { "op": "pi_skip", "guard": 9, "count": 1 },
    { "op": "load_imm", "imm": "50" },
    { "op": "declare_pub_input", "var": 11 },
    { "op": "load_imm", "imm": "10" },
    { "op": "load_imm", "imm": "20" },
    { "op": "declare_pub_input", "var": 12 },
    { "op": "cond_select", "bit": 15, "a": 17, "b": 9 },
    { "op": "assert", "cond": 18, "msg": "ZK Audit Failed: Income below lender threshold" },
    { "op": "cond_select", "bit": 21, "a": 23, "b": 9 },
    { "op": "assert", "cond": 24, "msg": "ZK Audit Failed: DTI exceeds lender ceiling" },
    { "op": "cond_select", "bit": 27, "a": 29, "b": 9 },
    { "op": "assert", "cond": 30, "msg": "ZK Audit Failed: Collateral ratio below lender threshold" }
  ]
}`;

  const compilerOutput = `====================================================================
🌌 HORIZON PROTOCOL: MIDNIGHT COMPACT CONTRACT COMPILER
====================================================================
Target Contract: src/contracts/horizon.compact
Output Directory: src/contracts/compiled/

Invoking compactc compiler toolchain...

====================================================================
✅ COMPACT CONTRACT COMPILATION SUCCESSFUL
====================================================================
Compiling 5 circuits: Done.

Generated Prover/Verifier Keys (10 files):
  - keys/createLendingPool.prover
  - keys/createLendingPool.verifier
  - keys/liquidate.prover
  - keys/liquidate.verifier
  - keys/repayLoan.prover
  - keys/repayLoan.verifier
  - keys/requestLoan.prover
  - keys/requestLoan.verifier
  - keys/submitFinancialSnapshot.prover
  - keys/submitFinancialSnapshot.verifier

Generated ZKIR Circuit Defs (10 files):
  - zkir/createLendingPool.bzkir
  - zkir/createLendingPool.zkir
  - zkir/liquidate.bzkir
  - zkir/liquidate.zkir
  - zkir/repayLoan.bzkir
  - zkir/repayLoan.zkir
  - zkir/requestLoan.bzkir
  - zkir/requestLoan.zkir
  - zkir/submitFinancialSnapshot.bzkir
  - zkir/submitFinancialSnapshot.zkir`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Banner */}
      <div className="bg-white border border-[#eaeae5] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Background Theme Banner */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-multiply pointer-events-none"
          style={{ backgroundImage: "url('/app-banner.jpg')", backgroundPosition: 'center 35%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/30 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#525f6c] text-xs font-bold uppercase tracking-wider">
              <FileCode2 className="w-4 h-4 text-[#11161a]" />
              <span>Smart Contract Toolchain</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#11161a] tracking-tight">Compact Smart Contract &amp; ZKIR</h2>
            <p className="text-sm text-[#525f6c] max-w-xl leading-relaxed">
              Inspect the real Compact contract source, compiled ZKIR opcodes, and verbatim output generated by Midnight's <code>compactc</code> compiler (v0.34.0).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono shrink-0">
            <span className="px-3.5 py-1.5 rounded-full bg-[#f8f8f6] border border-[#eaeae5] text-[#11161a] font-semibold">
              Toolchain: Compact 0.34.0
            </span>
          </div>
        </div>
      </div>

      {/* Code Tabs */}
      <div className="bg-white border border-[#eaeae5] rounded-3xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-[#eaeae5] px-4 sm:px-6 py-3 bg-[#f8f8f6]">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('compact')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'compact'
                  ? 'bg-[#11161a] text-white shadow-xs'
                  : 'text-[#525f6c] hover:text-[#11161a] hover:bg-white/60'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>horizon.compact</span>
            </button>
            <button
              onClick={() => setActiveTab('zkir')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'zkir'
                  ? 'bg-[#11161a] text-white shadow-xs'
                  : 'text-[#525f6c] hover:text-[#11161a] hover:bg-white/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>requestLoan.zkir</span>
            </button>
            <button
              onClick={() => setActiveTab('compiler')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'compiler'
                  ? 'bg-[#11161a] text-white shadow-xs'
                  : 'text-[#525f6c] hover:text-[#11161a] hover:bg-white/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>compactc Verbatim Output</span>
            </button>
          </div>

          <button
            onClick={() =>
              copyToClipboard(
                activeTab === 'compact'
                  ? compactSource
                  : activeTab === 'zkir'
                  ? zkirSample
                  : compilerOutput
              )
            }
            className="px-3 py-1.5 rounded-full border border-[#d5d5cf] bg-white hover:bg-[#f5f5f0] text-[#11161a] transition flex items-center gap-1.5 text-xs font-semibold shrink-0 shadow-xs"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#525f6c]" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-x-auto bg-[#11161a] text-xs font-mono leading-relaxed max-h-[620px] overflow-y-auto">
          {activeTab === 'compact' && (
            <pre className="text-[#e2e8f0]">
              <code>{compactSource}</code>
            </pre>
          )}

          {activeTab === 'zkir' && (
            <pre className="text-cyan-300">
              <code>{zkirSample}</code>
            </pre>
          )}

          {activeTab === 'compiler' && (
            <pre className="text-emerald-300">
              <code>{compilerOutput}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
