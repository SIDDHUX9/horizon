import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.19.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

const _descriptor_3 = new __compactRuntime.CompactTypeEnum(4, 1);

class _Loan_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment()))))))))));
  }
  fromValue(value_0) {
    return {
      loan_id: _descriptor_0.fromValue(value_0),
      pool_id: _descriptor_0.fromValue(value_0),
      borrower: _descriptor_0.fromValue(value_0),
      loan_amount: _descriptor_1.fromValue(value_0),
      collateral_locked: _descriptor_1.fromValue(value_0),
      interest_rate_bps: _descriptor_2.fromValue(value_0),
      start_time: _descriptor_1.fromValue(value_0),
      due_date: _descriptor_1.fromValue(value_0),
      status: _descriptor_3.fromValue(value_0),
      total_repaid: _descriptor_1.fromValue(value_0),
      snapshot_commitment: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.loan_id).concat(_descriptor_0.toValue(value_0.pool_id).concat(_descriptor_0.toValue(value_0.borrower).concat(_descriptor_1.toValue(value_0.loan_amount).concat(_descriptor_1.toValue(value_0.collateral_locked).concat(_descriptor_2.toValue(value_0.interest_rate_bps).concat(_descriptor_1.toValue(value_0.start_time).concat(_descriptor_1.toValue(value_0.due_date).concat(_descriptor_3.toValue(value_0.status).concat(_descriptor_1.toValue(value_0.total_repaid).concat(_descriptor_0.toValue(value_0.snapshot_commitment)))))))))));
  }
}

const _descriptor_4 = new _Loan_0();

const _descriptor_5 = __compactRuntime.CompactTypeBoolean;

class _LendingPool_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment())))))))));
  }
  fromValue(value_0) {
    return {
      pool_id: _descriptor_0.fromValue(value_0),
      lender: _descriptor_0.fromValue(value_0),
      min_income: _descriptor_1.fromValue(value_0),
      max_debt_to_income_bps: _descriptor_2.fromValue(value_0),
      min_collateral_ratio_bps: _descriptor_2.fromValue(value_0),
      interest_rate_bps: _descriptor_2.fromValue(value_0),
      term_duration: _descriptor_1.fromValue(value_0),
      pool_liquidity: _descriptor_1.fromValue(value_0),
      total_deposited: _descriptor_1.fromValue(value_0),
      total_lent: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.pool_id).concat(_descriptor_0.toValue(value_0.lender).concat(_descriptor_1.toValue(value_0.min_income).concat(_descriptor_2.toValue(value_0.max_debt_to_income_bps).concat(_descriptor_2.toValue(value_0.min_collateral_ratio_bps).concat(_descriptor_2.toValue(value_0.interest_rate_bps).concat(_descriptor_1.toValue(value_0.term_duration).concat(_descriptor_1.toValue(value_0.pool_liquidity).concat(_descriptor_1.toValue(value_0.total_deposited).concat(_descriptor_1.toValue(value_0.total_lent))))))))));
  }
}

const _descriptor_6 = new _LendingPool_0();

class _RepaymentEvent_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment()))));
  }
  fromValue(value_0) {
    return {
      repayment_id: _descriptor_0.fromValue(value_0),
      loan_id: _descriptor_0.fromValue(value_0),
      payer: _descriptor_0.fromValue(value_0),
      amount: _descriptor_1.fromValue(value_0),
      timestamp: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.repayment_id).concat(_descriptor_0.toValue(value_0.loan_id).concat(_descriptor_0.toValue(value_0.payer).concat(_descriptor_1.toValue(value_0.amount).concat(_descriptor_1.toValue(value_0.timestamp)))));
  }
}

const _descriptor_7 = new _RepaymentEvent_0();

class _FinancialSnapshot_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment()))));
  }
  fromValue(value_0) {
    return {
      actual_income: _descriptor_1.fromValue(value_0),
      existing_debt: _descriptor_1.fromValue(value_0),
      computed_dti_ratio: _descriptor_2.fromValue(value_0),
      computed_collateral_ratio: _descriptor_2.fromValue(value_0),
      salt: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.actual_income).concat(_descriptor_1.toValue(value_0.existing_debt).concat(_descriptor_2.toValue(value_0.computed_dti_ratio).concat(_descriptor_2.toValue(value_0.computed_collateral_ratio).concat(_descriptor_0.toValue(value_0.salt)))));
  }
}

const _descriptor_8 = new _FinancialSnapshot_0();

class _Either_0 {
  alignment() {
    return _descriptor_5.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_5.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_9 = new _Either_0();

const _descriptor_10 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_11 = new _ContractAddress_0();

const _descriptor_12 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.getBorrowerSnapshot) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getBorrowerSnapshot');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      createLendingPool: async (...args_1) => {
        if (args_1.length !== 9) {
          throw new __compactRuntime.CompactError(`createLendingPool: expected 9 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const pool_id_0 = args_1[1];
        const lender_0 = args_1[2];
        const deposit_amount_0 = args_1[3];
        const min_income_0 = args_1[4];
        const max_debt_to_income_bps_0 = args_1[5];
        const min_collateral_ratio_bps_0 = args_1[6];
        const interest_rate_bps_0 = args_1[7];
        const term_duration_0 = args_1[8];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('createLendingPool',
                                     'argument 1 (as invoked from Typescript)',
                                     'horizon.compact line 82 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(pool_id_0.buffer instanceof ArrayBuffer && pool_id_0.BYTES_PER_ELEMENT === 1 && pool_id_0.length === 32)) {
          __compactRuntime.typeError('createLendingPool',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'horizon.compact line 82 char 1',
                                     'Bytes<32>',
                                     pool_id_0)
        }
        if (!(lender_0.buffer instanceof ArrayBuffer && lender_0.BYTES_PER_ELEMENT === 1 && lender_0.length === 32)) {
          __compactRuntime.typeError('createLendingPool',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'horizon.compact line 82 char 1',
                                     'Bytes<32>',
                                     lender_0)
        }
        if (!(typeof(deposit_amount_0) === 'bigint' && deposit_amount_0 >= 0n && deposit_amount_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createLendingPool',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'horizon.compact line 82 char 1',
                                     'Uint<0..18446744073709551616>',
                                     deposit_amount_0)
        }
        if (!(typeof(min_income_0) === 'bigint' && min_income_0 >= 0n && min_income_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createLendingPool',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'horizon.compact line 82 char 1',
                                     'Uint<0..18446744073709551616>',
                                     min_income_0)
        }
        if (!(typeof(max_debt_to_income_bps_0) === 'bigint' && max_debt_to_income_bps_0 >= 0n && max_debt_to_income_bps_0 <= 4294967295n)) {
          __compactRuntime.typeError('createLendingPool',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'horizon.compact line 82 char 1',
                                     'Uint<0..4294967296>',
                                     max_debt_to_income_bps_0)
        }
        if (!(typeof(min_collateral_ratio_bps_0) === 'bigint' && min_collateral_ratio_bps_0 >= 0n && min_collateral_ratio_bps_0 <= 4294967295n)) {
          __compactRuntime.typeError('createLendingPool',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'horizon.compact line 82 char 1',
                                     'Uint<0..4294967296>',
                                     min_collateral_ratio_bps_0)
        }
        if (!(typeof(interest_rate_bps_0) === 'bigint' && interest_rate_bps_0 >= 0n && interest_rate_bps_0 <= 4294967295n)) {
          __compactRuntime.typeError('createLendingPool',
                                     'argument 7 (argument 8 as invoked from Typescript)',
                                     'horizon.compact line 82 char 1',
                                     'Uint<0..4294967296>',
                                     interest_rate_bps_0)
        }
        if (!(typeof(term_duration_0) === 'bigint' && term_duration_0 >= 0n && term_duration_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createLendingPool',
                                     'argument 8 (argument 9 as invoked from Typescript)',
                                     'horizon.compact line 82 char 1',
                                     'Uint<0..18446744073709551616>',
                                     term_duration_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(pool_id_0).concat(_descriptor_0.toValue(lender_0).concat(_descriptor_1.toValue(deposit_amount_0).concat(_descriptor_1.toValue(min_income_0).concat(_descriptor_2.toValue(max_debt_to_income_bps_0).concat(_descriptor_2.toValue(min_collateral_ratio_bps_0).concat(_descriptor_2.toValue(interest_rate_bps_0).concat(_descriptor_1.toValue(term_duration_0)))))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_1.alignment())))))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._createLendingPool_0(context,
                                                         partialProofData,
                                                         pool_id_0,
                                                         lender_0,
                                                         deposit_amount_0,
                                                         min_income_0,
                                                         max_debt_to_income_bps_0,
                                                         min_collateral_ratio_bps_0,
                                                         interest_rate_bps_0,
                                                         term_duration_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      submitFinancialSnapshot: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`submitFinancialSnapshot: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const borrower_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('submitFinancialSnapshot',
                                     'argument 1 (as invoked from Typescript)',
                                     'horizon.compact line 127 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(borrower_0.buffer instanceof ArrayBuffer && borrower_0.BYTES_PER_ELEMENT === 1 && borrower_0.length === 32)) {
          __compactRuntime.typeError('submitFinancialSnapshot',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'horizon.compact line 127 char 1',
                                     'Bytes<32>',
                                     borrower_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(borrower_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._submitFinancialSnapshot_0(context,
                                                               partialProofData,
                                                               borrower_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      requestLoan: async (...args_1) => {
        if (args_1.length !== 7) {
          throw new __compactRuntime.CompactError(`requestLoan: expected 7 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const loan_id_0 = args_1[1];
        const pool_id_0 = args_1[2];
        const borrower_0 = args_1[3];
        const requested_amount_0 = args_1[4];
        const collateral_deposit_0 = args_1[5];
        const current_time_0 = args_1[6];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('requestLoan',
                                     'argument 1 (as invoked from Typescript)',
                                     'horizon.compact line 147 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(loan_id_0.buffer instanceof ArrayBuffer && loan_id_0.BYTES_PER_ELEMENT === 1 && loan_id_0.length === 32)) {
          __compactRuntime.typeError('requestLoan',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'horizon.compact line 147 char 1',
                                     'Bytes<32>',
                                     loan_id_0)
        }
        if (!(pool_id_0.buffer instanceof ArrayBuffer && pool_id_0.BYTES_PER_ELEMENT === 1 && pool_id_0.length === 32)) {
          __compactRuntime.typeError('requestLoan',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'horizon.compact line 147 char 1',
                                     'Bytes<32>',
                                     pool_id_0)
        }
        if (!(borrower_0.buffer instanceof ArrayBuffer && borrower_0.BYTES_PER_ELEMENT === 1 && borrower_0.length === 32)) {
          __compactRuntime.typeError('requestLoan',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'horizon.compact line 147 char 1',
                                     'Bytes<32>',
                                     borrower_0)
        }
        if (!(typeof(requested_amount_0) === 'bigint' && requested_amount_0 >= 0n && requested_amount_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('requestLoan',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'horizon.compact line 147 char 1',
                                     'Uint<0..18446744073709551616>',
                                     requested_amount_0)
        }
        if (!(typeof(collateral_deposit_0) === 'bigint' && collateral_deposit_0 >= 0n && collateral_deposit_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('requestLoan',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'horizon.compact line 147 char 1',
                                     'Uint<0..18446744073709551616>',
                                     collateral_deposit_0)
        }
        if (!(typeof(current_time_0) === 'bigint' && current_time_0 >= 0n && current_time_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('requestLoan',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'horizon.compact line 147 char 1',
                                     'Uint<0..18446744073709551616>',
                                     current_time_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(loan_id_0).concat(_descriptor_0.toValue(pool_id_0).concat(_descriptor_0.toValue(borrower_0).concat(_descriptor_1.toValue(requested_amount_0).concat(_descriptor_1.toValue(collateral_deposit_0).concat(_descriptor_1.toValue(current_time_0)))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment())))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._requestLoan_0(context,
                                                   partialProofData,
                                                   loan_id_0,
                                                   pool_id_0,
                                                   borrower_0,
                                                   requested_amount_0,
                                                   collateral_deposit_0,
                                                   current_time_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      repayLoan: async (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`repayLoan: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const repayment_id_0 = args_1[1];
        const loan_id_0 = args_1[2];
        const payer_0 = args_1[3];
        const repay_amount_0 = args_1[4];
        const current_time_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('repayLoan',
                                     'argument 1 (as invoked from Typescript)',
                                     'horizon.compact line 232 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(repayment_id_0.buffer instanceof ArrayBuffer && repayment_id_0.BYTES_PER_ELEMENT === 1 && repayment_id_0.length === 32)) {
          __compactRuntime.typeError('repayLoan',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'horizon.compact line 232 char 1',
                                     'Bytes<32>',
                                     repayment_id_0)
        }
        if (!(loan_id_0.buffer instanceof ArrayBuffer && loan_id_0.BYTES_PER_ELEMENT === 1 && loan_id_0.length === 32)) {
          __compactRuntime.typeError('repayLoan',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'horizon.compact line 232 char 1',
                                     'Bytes<32>',
                                     loan_id_0)
        }
        if (!(payer_0.buffer instanceof ArrayBuffer && payer_0.BYTES_PER_ELEMENT === 1 && payer_0.length === 32)) {
          __compactRuntime.typeError('repayLoan',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'horizon.compact line 232 char 1',
                                     'Bytes<32>',
                                     payer_0)
        }
        if (!(typeof(repay_amount_0) === 'bigint' && repay_amount_0 >= 0n && repay_amount_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('repayLoan',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'horizon.compact line 232 char 1',
                                     'Uint<0..18446744073709551616>',
                                     repay_amount_0)
        }
        if (!(typeof(current_time_0) === 'bigint' && current_time_0 >= 0n && current_time_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('repayLoan',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'horizon.compact line 232 char 1',
                                     'Uint<0..18446744073709551616>',
                                     current_time_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(repayment_id_0).concat(_descriptor_0.toValue(loan_id_0).concat(_descriptor_0.toValue(payer_0).concat(_descriptor_1.toValue(repay_amount_0).concat(_descriptor_1.toValue(current_time_0))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._repayLoan_0(context,
                                                 partialProofData,
                                                 repayment_id_0,
                                                 loan_id_0,
                                                 payer_0,
                                                 repay_amount_0,
                                                 current_time_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      liquidate: async (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`liquidate: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const loan_id_0 = args_1[1];
        const liquidator_0 = args_1[2];
        const current_time_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('liquidate',
                                     'argument 1 (as invoked from Typescript)',
                                     'horizon.compact line 323 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(loan_id_0.buffer instanceof ArrayBuffer && loan_id_0.BYTES_PER_ELEMENT === 1 && loan_id_0.length === 32)) {
          __compactRuntime.typeError('liquidate',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'horizon.compact line 323 char 1',
                                     'Bytes<32>',
                                     loan_id_0)
        }
        if (!(liquidator_0.buffer instanceof ArrayBuffer && liquidator_0.BYTES_PER_ELEMENT === 1 && liquidator_0.length === 32)) {
          __compactRuntime.typeError('liquidate',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'horizon.compact line 323 char 1',
                                     'Bytes<32>',
                                     liquidator_0)
        }
        if (!(typeof(current_time_0) === 'bigint' && current_time_0 >= 0n && current_time_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('liquidate',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'horizon.compact line 323 char 1',
                                     'Uint<0..18446744073709551616>',
                                     current_time_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(loan_id_0).concat(_descriptor_0.toValue(liquidator_0).concat(_descriptor_1.toValue(current_time_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._liquidate_0(context,
                                                 partialProofData,
                                                 loan_id_0,
                                                 liquidator_0,
                                                 current_time_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      }
    };
    this.impureCircuits = {
      createLendingPool: this.circuits.createLendingPool,
      submitFinancialSnapshot: this.circuits.submitFinancialSnapshot,
      requestLoan: this.circuits.requestLoan,
      repayLoan: this.circuits.repayLoan,
      liquidate: this.circuits.liquidate
    };
    this.provableCircuits = {
      createLendingPool: this.circuits.createLendingPool,
      submitFinancialSnapshot: this.circuits.submitFinancialSnapshot,
      requestLoan: this.circuits.requestLoan,
      repayLoan: this.circuits.repayLoan,
      liquidate: this.circuits.liquidate
    };
  }
  async initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('createLendingPool', new __compactRuntime.ContractOperation());
    state_0.setOperation('submitFinancialSnapshot', new __compactRuntime.ContractOperation());
    state_0.setOperation('requestLoan', new __compactRuntime.ContractOperation());
    state_0.setOperation('repayLoan', new __compactRuntime.ContractOperation());
    state_0.setOperation('liquidate', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext('constructor', __compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(0n),
                                                                                              alignment: _descriptor_12.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(1n),
                                                                                              alignment: _descriptor_12.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(2n),
                                                                                              alignment: _descriptor_12.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(3n),
                                                                                              alignment: _descriptor_12.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.callContext.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.callContext.currentPrivateState,
      currentZswapLocalState: context.callContext.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_8, value_0);
    return result_0;
  }
  _getBorrowerSnapshot_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getBorrowerSnapshot(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && typeof(result_0.actual_income) === 'bigint' && result_0.actual_income >= 0n && result_0.actual_income <= 18446744073709551615n && typeof(result_0.existing_debt) === 'bigint' && result_0.existing_debt >= 0n && result_0.existing_debt <= 18446744073709551615n && typeof(result_0.computed_dti_ratio) === 'bigint' && result_0.computed_dti_ratio >= 0n && result_0.computed_dti_ratio <= 4294967295n && typeof(result_0.computed_collateral_ratio) === 'bigint' && result_0.computed_collateral_ratio >= 0n && result_0.computed_collateral_ratio <= 4294967295n && result_0.salt.buffer instanceof ArrayBuffer && result_0.salt.BYTES_PER_ELEMENT === 1 && result_0.salt.length === 32)) {
      __compactRuntime.typeError('getBorrowerSnapshot',
                                 'return value',
                                 'horizon.compact line 72 char 1',
                                 'struct FinancialSnapshot<actual_income: Uint<0..18446744073709551616>, existing_debt: Uint<0..18446744073709551616>, computed_dti_ratio: Uint<0..4294967296>, computed_collateral_ratio: Uint<0..4294967296>, salt: Bytes<32>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_8.toValue(result_0),
      alignment: _descriptor_8.alignment()
    });
    return result_0;
  }
  async _createLendingPool_0(context,
                             partialProofData,
                             pool_id_0,
                             lender_0,
                             deposit_amount_0,
                             min_income_0,
                             max_debt_to_income_bps_0,
                             min_collateral_ratio_bps_0,
                             interest_rate_bps_0,
                             term_duration_0)
  {
    const pub_pool_id_0 = pool_id_0;
    const pub_lender_0 = lender_0;
    const pub_deposit_0 = deposit_amount_0;
    const pub_min_income_0 = min_income_0;
    const pub_max_dti_0 = max_debt_to_income_bps_0;
    const pub_min_cr_0 = min_collateral_ratio_bps_0;
    const pub_rate_0 = interest_rate_bps_0;
    const pub_term_0 = term_duration_0;
    __compactRuntime.assert(!_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_12.toValue(0n),
                                                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_pool_id_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Pool ID already exists');
    __compactRuntime.assert(pub_deposit_0 > 0n,
                            'Initial deposit must be positive');
    __compactRuntime.assert(pub_min_cr_0 >= 10000n,
                            'Minimum collateral ratio must be at least 100%');
    __compactRuntime.assert(pub_max_dti_0 <= 10000n,
                            'Maximum DTI cannot exceed 100%');
    __compactRuntime.assert(pub_term_0 > 0n, 'Term duration must be positive');
    const new_pool_0 = { pool_id: pub_pool_id_0,
                         lender: pub_lender_0,
                         min_income: pub_min_income_0,
                         max_debt_to_income_bps: pub_max_dti_0,
                         min_collateral_ratio_bps: pub_min_cr_0,
                         interest_rate_bps: pub_rate_0,
                         term_duration: pub_term_0,
                         pool_liquidity: pub_deposit_0,
                         total_deposited: pub_deposit_0,
                         total_lent: 0n };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_12.toValue(0n),
                                                                  alignment: _descriptor_12.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_pool_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(new_pool_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _submitFinancialSnapshot_0(context, partialProofData, borrower_0) {
    const pub_borrower_0 = borrower_0;
    const snapshot_0 = this._getBorrowerSnapshot_0(context, partialProofData);
    let t_0;
    __compactRuntime.assert((t_0 = snapshot_0.actual_income, t_0 > 0n),
                            'Actual income must be positive');
    const commitment_0 = this._persistentHash_0(snapshot_0);
    const pub_commitment_0 = commitment_0;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_12.toValue(2n),
                                                                  alignment: _descriptor_12.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_borrower_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_commitment_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return pub_commitment_0;
  }
  async _requestLoan_0(context,
                       partialProofData,
                       loan_id_0,
                       pool_id_0,
                       borrower_0,
                       requested_amount_0,
                       collateral_deposit_0,
                       current_time_0)
  {
    const pub_loan_id_0 = loan_id_0;
    const pub_pool_id_0 = pool_id_0;
    const pub_borrower_0 = borrower_0;
    const pub_requested_amount_0 = requested_amount_0;
    const pub_collateral_deposit_0 = collateral_deposit_0;
    const pub_current_time_0 = current_time_0;
    __compactRuntime.assert(!_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_12.toValue(1n),
                                                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_loan_id_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Loan ID already exists');
    __compactRuntime.assert(_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_12.toValue(0n),
                                                                                                                  alignment: _descriptor_12.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_pool_id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Lending pool not found');
    __compactRuntime.assert(_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_12.toValue(2n),
                                                                                                                  alignment: _descriptor_12.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_borrower_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Borrower financial snapshot commitment required');
    const pool_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_12.toValue(0n),
                                                                                                         alignment: _descriptor_12.alignment() } }] } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(pub_pool_id_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              { popeq: { cached: false,
                                                                                         result: undefined } }]).value);
    let t_0;
    __compactRuntime.assert((t_0 = pool_0.pool_liquidity,
                             t_0 >= pub_requested_amount_0),
                            'Insufficient pool liquidity');
    __compactRuntime.assert(pub_requested_amount_0 > 0n,
                            'Requested loan amount must be positive');
    const snapshot_0 = this._getBorrowerSnapshot_0(context, partialProofData);
    const computed_commitment_0 = this._persistentHash_0(snapshot_0);
    const stored_commitment_0 = _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                          partialProofData,
                                                                                          [
                                                                                           { dup: { n: 0 } },
                                                                                           { idx: { cached: false,
                                                                                                    pushPath: false,
                                                                                                    path: [
                                                                                                           { tag: 'value',
                                                                                                             value: { value: _descriptor_12.toValue(2n),
                                                                                                                      alignment: _descriptor_12.alignment() } }] } },
                                                                                           { idx: { cached: false,
                                                                                                    pushPath: false,
                                                                                                    path: [
                                                                                                           { tag: 'value',
                                                                                                             value: { value: _descriptor_0.toValue(pub_borrower_0),
                                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                                           { popeq: { cached: false,
                                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(this._equal_0(computed_commitment_0,
                                          stored_commitment_0),
                            'Private witness does not match registered snapshot commitment');
    let t_1;
    __compactRuntime.assert((t_1 = snapshot_0.actual_income,
                             t_1 >= pool_0.min_income),
                            'ZK Audit Failed: Income below lender threshold');
    let t_2;
    __compactRuntime.assert((t_2 = snapshot_0.computed_dti_ratio,
                             t_2 <= pool_0.max_debt_to_income_bps),
                            'ZK Audit Failed: DTI exceeds lender ceiling');
    let t_3;
    __compactRuntime.assert((t_3 = snapshot_0.computed_collateral_ratio,
                             t_3 >= pool_0.min_collateral_ratio_bps),
                            'ZK Audit Failed: Collateral ratio below lender threshold');
    const collateral_value_scaled_0 = pub_collateral_deposit_0 * 10000n;
    const required_collateral_scaled_0 = pub_requested_amount_0
                                         *
                                         snapshot_0.computed_collateral_ratio;
    let t_4;
    __compactRuntime.assert((t_4 = ((t1) => {
                                     if (t1 > 340282366920938463463374607431768211455n) {
                                       throw new __compactRuntime.CompactError('horizon.compact line 192 char 11: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 340282366920938463463374607431768211455');
                                     }
                                     return t1;
                                   })(collateral_value_scaled_0),
                             t_4
                             >=
                             ((t1) => {
                               if (t1 > 340282366920938463463374607431768211455n) {
                                 throw new __compactRuntime.CompactError('horizon.compact line 192 char 53: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 340282366920938463463374607431768211455');
                               }
                               return t1;
                             })(required_collateral_scaled_0)),
                            'Deposited collateral does not satisfy claimed ratio');
    let t_5;
    const updated_pool_0 = { pool_id: pool_0.pool_id,
                             lender: pool_0.lender,
                             min_income: pool_0.min_income,
                             max_debt_to_income_bps:
                               pool_0.max_debt_to_income_bps,
                             min_collateral_ratio_bps:
                               pool_0.min_collateral_ratio_bps,
                             interest_rate_bps: pool_0.interest_rate_bps,
                             term_duration: pool_0.term_duration,
                             pool_liquidity:
                               (t_5 = pool_0.pool_liquidity,
                                (__compactRuntime.assert(t_5
                                                         >=
                                                         pub_requested_amount_0,
                                                         'result of subtraction would be negative'),
                                 t_5 - pub_requested_amount_0)),
                             total_deposited: pool_0.total_deposited,
                             total_lent:
                               ((t1) => {
                                 if (t1 > 18446744073709551615n) {
                                   throw new __compactRuntime.CompactError('horizon.compact line 205 char 17: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                 }
                                 return t1;
                               })(pool_0.total_lent + pub_requested_amount_0) };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_12.toValue(0n),
                                                                  alignment: _descriptor_12.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_pool_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(updated_pool_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const due_date_0 = ((t1) => {
                         if (t1 > 18446744073709551615n) {
                           throw new __compactRuntime.CompactError('horizon.compact line 210 char 20: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                         }
                         return t1;
                       })(pub_current_time_0 + pool_0.term_duration);
    const new_loan_0 = { loan_id: pub_loan_id_0,
                         pool_id: pub_pool_id_0,
                         borrower: pub_borrower_0,
                         loan_amount: pub_requested_amount_0,
                         collateral_locked: pub_collateral_deposit_0,
                         interest_rate_bps: pool_0.interest_rate_bps,
                         start_time: pub_current_time_0,
                         due_date: due_date_0,
                         status: 1,
                         total_repaid: 0n,
                         snapshot_commitment: stored_commitment_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_12.toValue(1n),
                                                                  alignment: _descriptor_12.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_loan_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(new_loan_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _repayLoan_0(context,
                     partialProofData,
                     repayment_id_0,
                     loan_id_0,
                     payer_0,
                     repay_amount_0,
                     current_time_0)
  {
    const pub_repay_id_0 = repayment_id_0;
    const pub_loan_id_0 = loan_id_0;
    const pub_payer_0 = payer_0;
    const pub_amount_0 = repay_amount_0;
    const pub_time_0 = current_time_0;
    __compactRuntime.assert(!_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_12.toValue(3n),
                                                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_repay_id_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Repayment ID already recorded');
    __compactRuntime.assert(_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_12.toValue(1n),
                                                                                                                  alignment: _descriptor_12.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_loan_id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Loan not found');
    __compactRuntime.assert(pub_amount_0 > 0n,
                            'Repayment amount must be positive');
    const loan_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_12.toValue(1n),
                                                                                                         alignment: _descriptor_12.alignment() } }] } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(pub_loan_id_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              { popeq: { cached: false,
                                                                                         result: undefined } }]).value);
    __compactRuntime.assert(loan_0.status === 1, 'Loan is not active');
    const new_total_repaid_0 = ((t1) => {
                                 if (t1 > 18446744073709551615n) {
                                   throw new __compactRuntime.CompactError('horizon.compact line 252 char 28: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                 }
                                 return t1;
                               })(loan_0.total_repaid + pub_amount_0);
    const repaid_scaled_0 = new_total_repaid_0 * 10000n;
    const rate_sum_0 = ((t1) => {
                         if (t1 > 4294967295n) {
                           throw new __compactRuntime.CompactError('horizon.compact line 257 char 20: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 4294967295');
                         }
                         return t1;
                       })(10000n + loan_0.interest_rate_bps);
    const total_owed_scaled_0 = loan_0.loan_amount * rate_sum_0;
    let t_0;
    if (t_0 = ((t1) => {
                if (t1 > 340282366920938463463374607431768211455n) {
                  throw new __compactRuntime.CompactError('horizon.compact line 260 char 8: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 340282366920938463463374607431768211455');
                }
                return t1;
              })(repaid_scaled_0),
        t_0
        >=
        ((t1) => {
          if (t1 > 340282366920938463463374607431768211455n) {
            throw new __compactRuntime.CompactError('horizon.compact line 260 char 40: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 340282366920938463463374607431768211455');
          }
          return t1;
        })(total_owed_scaled_0))
    {
      const updated_loan_0 = { loan_id: loan_0.loan_id,
                               pool_id: loan_0.pool_id,
                               borrower: loan_0.borrower,
                               loan_amount: loan_0.loan_amount,
                               collateral_locked: 0n,
                               interest_rate_bps: loan_0.interest_rate_bps,
                               start_time: loan_0.start_time,
                               due_date: loan_0.due_date,
                               status: 2,
                               total_repaid: new_total_repaid_0,
                               snapshot_commitment: loan_0.snapshot_commitment };
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { idx: { cached: false,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_12.toValue(1n),
                                                                    alignment: _descriptor_12.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_loan_id_0),
                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(updated_loan_0),
                                                                                                alignment: _descriptor_4.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } },
                                         { ins: { cached: true, n: 1 } }]);
      let tmp_0;
      __compactRuntime.assert((tmp_0 = loan_0.pool_id,
                               _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                         partialProofData,
                                                                                         [
                                                                                          { dup: { n: 0 } },
                                                                                          { idx: { cached: false,
                                                                                                   pushPath: false,
                                                                                                   path: [
                                                                                                          { tag: 'value',
                                                                                                            value: { value: _descriptor_12.toValue(0n),
                                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                                          { push: { storage: false,
                                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                                          'member',
                                                                                          { popeq: { cached: true,
                                                                                                     result: undefined } }]).value)),
                              'Associated pool not found');
      let tmp_1;
      const pool_0 = (tmp_1 = loan_0.pool_id,
                      _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_12.toValue(0n),
                                                                                                            alignment: _descriptor_12.alignment() } }] } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_0.toValue(tmp_1),
                                                                                                            alignment: _descriptor_0.alignment() } }] } },
                                                                                 { popeq: { cached: false,
                                                                                            result: undefined } }]).value));
      const updated_pool_0 = { pool_id: pool_0.pool_id,
                               lender: pool_0.lender,
                               min_income: pool_0.min_income,
                               max_debt_to_income_bps:
                                 pool_0.max_debt_to_income_bps,
                               min_collateral_ratio_bps:
                                 pool_0.min_collateral_ratio_bps,
                               interest_rate_bps: pool_0.interest_rate_bps,
                               term_duration: pool_0.term_duration,
                               pool_liquidity:
                                 ((t1) => {
                                   if (t1 > 18446744073709551615n) {
                                     throw new __compactRuntime.CompactError('horizon.compact line 286 char 23: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                   }
                                   return t1;
                                 })(pool_0.pool_liquidity + loan_0.loan_amount),
                               total_deposited: pool_0.total_deposited,
                               total_lent: pool_0.total_lent };
      const tmp_2 = loan_0.pool_id;
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { idx: { cached: false,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_12.toValue(0n),
                                                                    alignment: _descriptor_12.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_2),
                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(updated_pool_0),
                                                                                                alignment: _descriptor_6.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } },
                                         { ins: { cached: true, n: 1 } }]);
    } else {
      const updated_loan_1 = { loan_id: loan_0.loan_id,
                               pool_id: loan_0.pool_id,
                               borrower: loan_0.borrower,
                               loan_amount: loan_0.loan_amount,
                               collateral_locked: loan_0.collateral_locked,
                               interest_rate_bps: loan_0.interest_rate_bps,
                               start_time: loan_0.start_time,
                               due_date: loan_0.due_date,
                               status: 1,
                               total_repaid: new_total_repaid_0,
                               snapshot_commitment: loan_0.snapshot_commitment };
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { idx: { cached: false,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_12.toValue(1n),
                                                                    alignment: _descriptor_12.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_loan_id_0),
                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(updated_loan_1),
                                                                                                alignment: _descriptor_4.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } },
                                         { ins: { cached: true, n: 1 } }]);
    }
    const repayment_record_0 = { repayment_id: pub_repay_id_0,
                                 loan_id: pub_loan_id_0,
                                 payer: pub_payer_0,
                                 amount: pub_amount_0,
                                 timestamp: pub_time_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_12.toValue(3n),
                                                                  alignment: _descriptor_12.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_repay_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(repayment_record_0),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _liquidate_0(context,
                     partialProofData,
                     loan_id_0,
                     liquidator_0,
                     current_time_0)
  {
    const pub_loan_id_0 = loan_id_0;
    const pub_liquidator_0 = liquidator_0;
    const pub_time_0 = current_time_0;
    __compactRuntime.assert(_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_12.toValue(1n),
                                                                                                                  alignment: _descriptor_12.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_loan_id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Loan not found');
    const loan_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_12.toValue(1n),
                                                                                                         alignment: _descriptor_12.alignment() } }] } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(pub_loan_id_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              { popeq: { cached: false,
                                                                                         result: undefined } }]).value);
    __compactRuntime.assert(loan_0.status === 1,
                            'Loan is not active for liquidation');
    __compactRuntime.assert(pub_time_0 > loan_0.due_date,
                            'Loan has not passed due date; cannot liquidate');
    const liquidated_loan_0 = { loan_id: loan_0.loan_id,
                                pool_id: loan_0.pool_id,
                                borrower: loan_0.borrower,
                                loan_amount: loan_0.loan_amount,
                                collateral_locked: 0n,
                                interest_rate_bps: loan_0.interest_rate_bps,
                                start_time: loan_0.start_time,
                                due_date: loan_0.due_date,
                                status: 4,
                                total_repaid: loan_0.total_repaid,
                                snapshot_commitment: loan_0.snapshot_commitment };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_12.toValue(1n),
                                                                  alignment: _descriptor_12.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_loan_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(liquidated_loan_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    let tmp_0;
    __compactRuntime.assert((tmp_0 = loan_0.pool_id,
                             _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_12.toValue(0n),
                                                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)),
                            'Pool not found');
    let tmp_1;
    const pool_0 = (tmp_1 = loan_0.pool_id,
                    _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                              partialProofData,
                                                                              [
                                                                               { dup: { n: 0 } },
                                                                               { idx: { cached: false,
                                                                                        pushPath: false,
                                                                                        path: [
                                                                                               { tag: 'value',
                                                                                                 value: { value: _descriptor_12.toValue(0n),
                                                                                                          alignment: _descriptor_12.alignment() } }] } },
                                                                               { idx: { cached: false,
                                                                                        pushPath: false,
                                                                                        path: [
                                                                                               { tag: 'value',
                                                                                                 value: { value: _descriptor_0.toValue(tmp_1),
                                                                                                          alignment: _descriptor_0.alignment() } }] } },
                                                                               { popeq: { cached: false,
                                                                                          result: undefined } }]).value));
    const updated_pool_0 = { pool_id: pool_0.pool_id,
                             lender: pool_0.lender,
                             min_income: pool_0.min_income,
                             max_debt_to_income_bps:
                               pool_0.max_debt_to_income_bps,
                             min_collateral_ratio_bps:
                               pool_0.min_collateral_ratio_bps,
                             interest_rate_bps: pool_0.interest_rate_bps,
                             term_duration: pool_0.term_duration,
                             pool_liquidity:
                               ((t1) => {
                                 if (t1 > 18446744073709551615n) {
                                   throw new __compactRuntime.CompactError('horizon.compact line 367 char 21: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                 }
                                 return t1;
                               })(pool_0.pool_liquidity
                                  +
                                  loan_0.collateral_locked),
                             total_deposited: pool_0.total_deposited,
                             total_lent: pool_0.total_lent };
    const tmp_2 = loan_0.pool_id;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_12.toValue(0n),
                                                                  alignment: _descriptor_12.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_2),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(updated_pool_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    callContext: { currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() },
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    pools: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(0n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(0n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'horizon.compact line 64 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(0n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'horizon.compact line 64 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(0n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[0];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_6.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    loans: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(1n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(1n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'horizon.compact line 65 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(1n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'horizon.compact line 65 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(1n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_4.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    borrower_snapshots: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(2n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(2n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'horizon.compact line 66 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(2n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'horizon.compact line 66 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(2n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[2];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_0.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    repayments: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(3n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(3n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'horizon.compact line 67 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(3n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'horizon.compact line 67 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(3n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[3];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_7.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  callContext: { currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() }
};
const _dummyContract = new Contract({
  getBorrowerSnapshot: (...args) => undefined
});
export const pureCircuits = {};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
export const expectedVk = {
  'createLendingPool': 'cf36088ed7a89a3bddbb8dc8f9a748f4025829eca8b67cf91a1b04d04b5a9915',
  'liquidate': '04a97d97b7887f04bcacaa12b1560f6cfee36966500adc4143f9758f03367be3',
  'repayLoan': 'de019e31718d44d39e7a8039f360aae16b8f089b3afdaf4ea0646e0eec87df1e',
  'requestLoan': '8065caee39a2bdbfc372095fcb14ed84f99418b955c887cf4fe204741b76a99b',
  'submitFinancialSnapshot': '7b2e83f5ea0a5ef1f89e09737a061ac7d81e9a31029129b50f3942d2a3b7f731',
};

//# sourceMappingURL=index.js.map
