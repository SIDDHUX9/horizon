export enum LoanStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REPAID = 'REPAID',
  DEFAULTED = 'DEFAULTED',
  LIQUIDATED = 'LIQUIDATED'
}

export interface LendingPool {
  pool_id: string; // 32-byte hex
  lender: string; // 32-byte hex / address
  min_income: bigint; // Minimum income floor
  max_debt_to_income_bps: number; // e.g. 4000 = 40.00%
  min_collateral_ratio_bps: number; // e.g. 15000 = 150.00%
  interest_rate_bps: number; // e.g. 500 = 5.00%
  term_duration: bigint; // in seconds or blocks
  pool_liquidity: bigint; // NIGHT tokens
  total_deposited: bigint;
  total_lent: bigint;
  created_at: number;
}

export interface Loan {
  loan_id: string;
  pool_id: string;
  borrower: string;
  loan_amount: bigint; // Principal in NIGHT
  collateral_locked: bigint; // Collateral in NIGHT
  interest_rate_bps: number;
  start_time: bigint;
  due_date: bigint;
  status: LoanStatus;
  total_repaid: bigint;
  snapshot_commitment: string; // 32-byte hash
}

export interface RepaymentEvent {
  repayment_id: string;
  loan_id: string;
  payer: string;
  amount: bigint;
  timestamp: bigint;
  tx_hash: string;
}

// Confidential Financial Snapshot (Private Witness - NEVER on public ledger)
export interface FinancialSnapshot {
  actual_income: bigint;
  existing_debt: bigint;
  computed_dti_ratio: number; // Basis points
  computed_collateral_ratio: number; // Basis points
  salt: string; // 32-byte hex secret blinding factor
}

export interface ZKProofTrace {
  circuit_name: 'requestLoan' | 'submitFinancialSnapshot' | 'createLendingPool' | 'repayLoan' | 'liquidate';
  witness_commitment: string;
  prover_key: string;
  verifier_key: string;
  checks: {
    description: string;
    lhs: string | number;
    operator: '>=' | '<=' | '==' | '>';
    rhs: string | number;
    passed: boolean;
    is_private_check: boolean;
  }[];
  is_valid: boolean;
  timestamp: number;
  proof_hash: string;
}

export interface ExplorerTransaction {
  tx_hash: string;
  block_height: number;
  circuit: string;
  caller: string;
  timestamp: number;
  public_data: Record<string, string | number | boolean>;
  hidden_private_data: Record<string, string>;
  proof_verified: boolean;
}
