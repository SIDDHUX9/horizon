import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  getBorrowerSnapshot(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, { actual_income: bigint,
                                                                                    existing_debt: bigint,
                                                                                    computed_dti_ratio: bigint,
                                                                                    computed_collateral_ratio: bigint,
                                                                                    salt: Uint8Array
                                                                                  }];
}

export type ImpureCircuits<PS> = {
  createLendingPool(context: __compactRuntime.CircuitContext<PS>,
                    pool_id_0: Uint8Array,
                    lender_0: Uint8Array,
                    deposit_amount_0: bigint,
                    min_income_0: bigint,
                    max_debt_to_income_bps_0: bigint,
                    min_collateral_ratio_bps_0: bigint,
                    interest_rate_bps_0: bigint,
                    term_duration_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  submitFinancialSnapshot(context: __compactRuntime.CircuitContext<PS>,
                          borrower_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, Uint8Array>>;
  requestLoan(context: __compactRuntime.CircuitContext<PS>,
              loan_id_0: Uint8Array,
              pool_id_0: Uint8Array,
              borrower_0: Uint8Array,
              requested_amount_0: bigint,
              collateral_deposit_0: bigint,
              current_time_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  repayLoan(context: __compactRuntime.CircuitContext<PS>,
            repayment_id_0: Uint8Array,
            loan_id_0: Uint8Array,
            payer_0: Uint8Array,
            repay_amount_0: bigint,
            current_time_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  liquidate(context: __compactRuntime.CircuitContext<PS>,
            loan_id_0: Uint8Array,
            liquidator_0: Uint8Array,
            current_time_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type ProvableCircuits<PS> = {
  createLendingPool(context: __compactRuntime.CircuitContext<PS>,
                    pool_id_0: Uint8Array,
                    lender_0: Uint8Array,
                    deposit_amount_0: bigint,
                    min_income_0: bigint,
                    max_debt_to_income_bps_0: bigint,
                    min_collateral_ratio_bps_0: bigint,
                    interest_rate_bps_0: bigint,
                    term_duration_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  submitFinancialSnapshot(context: __compactRuntime.CircuitContext<PS>,
                          borrower_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, Uint8Array>>;
  requestLoan(context: __compactRuntime.CircuitContext<PS>,
              loan_id_0: Uint8Array,
              pool_id_0: Uint8Array,
              borrower_0: Uint8Array,
              requested_amount_0: bigint,
              collateral_deposit_0: bigint,
              current_time_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  repayLoan(context: __compactRuntime.CircuitContext<PS>,
            repayment_id_0: Uint8Array,
            loan_id_0: Uint8Array,
            payer_0: Uint8Array,
            repay_amount_0: bigint,
            current_time_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  liquidate(context: __compactRuntime.CircuitContext<PS>,
            loan_id_0: Uint8Array,
            liquidator_0: Uint8Array,
            current_time_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  createLendingPool(context: __compactRuntime.CircuitContext<PS>,
                    pool_id_0: Uint8Array,
                    lender_0: Uint8Array,
                    deposit_amount_0: bigint,
                    min_income_0: bigint,
                    max_debt_to_income_bps_0: bigint,
                    min_collateral_ratio_bps_0: bigint,
                    interest_rate_bps_0: bigint,
                    term_duration_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  submitFinancialSnapshot(context: __compactRuntime.CircuitContext<PS>,
                          borrower_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, Uint8Array>>;
  requestLoan(context: __compactRuntime.CircuitContext<PS>,
              loan_id_0: Uint8Array,
              pool_id_0: Uint8Array,
              borrower_0: Uint8Array,
              requested_amount_0: bigint,
              collateral_deposit_0: bigint,
              current_time_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  repayLoan(context: __compactRuntime.CircuitContext<PS>,
            repayment_id_0: Uint8Array,
            loan_id_0: Uint8Array,
            payer_0: Uint8Array,
            repay_amount_0: bigint,
            current_time_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  liquidate(context: __compactRuntime.CircuitContext<PS>,
            loan_id_0: Uint8Array,
            liquidator_0: Uint8Array,
            current_time_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type Ledger = {
  pools: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { pool_id: Uint8Array,
                                 lender: Uint8Array,
                                 min_income: bigint,
                                 max_debt_to_income_bps: bigint,
                                 min_collateral_ratio_bps: bigint,
                                 interest_rate_bps: bigint,
                                 term_duration: bigint,
                                 pool_liquidity: bigint,
                                 total_deposited: bigint,
                                 total_lent: bigint
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { pool_id: Uint8Array,
  lender: Uint8Array,
  min_income: bigint,
  max_debt_to_income_bps: bigint,
  min_collateral_ratio_bps: bigint,
  interest_rate_bps: bigint,
  term_duration: bigint,
  pool_liquidity: bigint,
  total_deposited: bigint,
  total_lent: bigint
}]>
  };
  loans: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { loan_id: Uint8Array,
                                 pool_id: Uint8Array,
                                 borrower: Uint8Array,
                                 loan_amount: bigint,
                                 collateral_locked: bigint,
                                 interest_rate_bps: bigint,
                                 start_time: bigint,
                                 due_date: bigint,
                                 status: number,
                                 total_repaid: bigint,
                                 snapshot_commitment: Uint8Array
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { loan_id: Uint8Array,
  pool_id: Uint8Array,
  borrower: Uint8Array,
  loan_amount: bigint,
  collateral_locked: bigint,
  interest_rate_bps: bigint,
  start_time: bigint,
  due_date: bigint,
  status: number,
  total_repaid: bigint,
  snapshot_commitment: Uint8Array
}]>
  };
  borrower_snapshots: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  repayments: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { repayment_id: Uint8Array,
                                 loan_id: Uint8Array,
                                 payer: Uint8Array,
                                 amount: bigint,
                                 timestamp: bigint
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { repayment_id: Uint8Array,
  loan_id: Uint8Array,
  payer: Uint8Array,
  amount: bigint,
  timestamp: bigint
}]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): Promise<__compactRuntime.ConstructorResult<PS>>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
export declare const expectedVk: Record<string, string>;
