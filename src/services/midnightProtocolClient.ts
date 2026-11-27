/**
 * Browser-side Midnight.js 5 contract client for Horizon.
 *
 * Every production operation passes through assertVerifiedDeployment() first.
 * When the canonical record is `not-deployed`, constructing this client throws
 * and no circuit can be reached. Demo mode is a separate, explicitly labelled
 * path in horizonSimulator.ts and never uses this client.
 */
import { Level } from 'level';
import * as midnightJs from '@midnight-ntwrk/midnight-js';
import { ContractState } from '@midnight-ntwrk/compact-runtime';
import { fetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import {
  createLedger9MidnightProvider,
  createLedger9ProofProvider,
  createLedger9WalletProvider,
  type Ledger9WalletProvider,
  type MidnightProviders,
} from '@midnight-ntwrk/midnight-js-types';
import { Transaction } from '@midnightntwrk/ledger-v9';
import type { ConnectedAPI, Configuration } from '@midnight-ntwrk/dapp-connector-api';
import { Contract, ledger } from '../contracts/compiled/contract/index.js';
import { LoanStatus } from '../types/horizon';
import type { LendingPool, Loan, RepaymentEvent } from '../types/horizon';
import { assertVerifiedDeployment } from './deploymentGate';
import { decodeShieldedKey } from './ids';

// SHA-256 of compiler/contract-manifest.json produced by compactc 0.36.1.
// Pinned here so a coordinated substitution of artifacts + manifest is refused.
export const EXPECTED_MANIFEST_HASH =
  '64db18ecefc095c2910dee81d04561b8b1f969fbc04e678d8fd393e8f3fb5186';

export const HORIZON_CIRCUITS = [
  'createLendingPool',
  'submitFinancialSnapshot',
  'requestLoan',
  'repayLoan',
  'liquidate',
] as const;

type CircuitId = (typeof HORIZON_CIRCUITS)[number];

export const HORIZON_PRIVATE_STATE_ID = 'horizon-borrower';

export interface HorizonPrivateState {
  snapshot?: {
    actual_income: bigint;
    existing_debt: bigint;
    computed_dti_ratio: bigint;
    computed_collateral_ratio: bigint;
    salt: Uint8Array;
  };
}

/**
 * A fresh wallet has no stored private state. `findDeployedContract()` refuses
 * to attach when a `privateStateId` is named but nothing is stored under it,
 * so attach must seed an empty state first. Any existing state is preserved.
 */
export const EMPTY_HORIZON_PRIVATE_STATE: HorizonPrivateState = {};

export async function resolveInitialPrivateState(states: {
  get(id: string): Promise<HorizonPrivateState | undefined | null>;
}): Promise<HorizonPrivateState> {
  const existing = await states.get(HORIZON_PRIVATE_STATE_ID);
  return existing ?? EMPTY_HORIZON_PRIVATE_STATE;
}

export interface HorizonClientConfig {
  readonly walletApi: ConnectedAPI;
  readonly networkId: string;
  readonly walletConfig: Configuration;
  readonly accountId: string;
  readonly privateStatePasswordProvider: () => Promise<string>;
  readonly contractArtifactUrl?: string;
  readonly ttlSeconds?: number;
}

export interface HorizonCallResult {
  readonly txId: string;
  readonly status: string;
}

/** Public ledger state decoded from the verified on-chain contract. */
export interface HorizonOnChainState {
  readonly pools: LendingPool[];
  readonly loans: Loan[];
  readonly repayments: RepaymentEvent[];
}

type CompiledHorizonContract = ReturnType<typeof makeCompiledContract>;
type HorizonProviders = MidnightProviders<CircuitId, string, HorizonPrivateState>;
type HorizonContractHandle = Awaited<ReturnType<typeof findDeployedContract>>;

function makeCompiledContract() {
  const CC = midnightJs.ledger9Protocol.CompiledContract;
  return CC.make<Contract<HorizonPrivateState>, HorizonPrivateState>('horizon', Contract).pipe(
    CC.withWitnesses({
      getBorrowerSnapshot: (context: { privateState: HorizonPrivateState }) => {
        const { snapshot } = context.privateState;
        if (!snapshot) {
          throw new Error(
            'No borrower snapshot has been prepared. Call prepareSnapshot() before requestLoan().'
          );
        }
        return [context.privateState, snapshot] as const;
      },
    })
  );
}

/**
 * Connects wallet providers + compiled artifacts into a single client that can
 * call Horizon circuits. Construction fails closed without a verified deployment.
 */
export class MidnightProtocolClient {
  private readonly providers: HorizonProviders;
  private readonly compiledContract: CompiledHorizonContract;
  private readonly contractAddress: string;
  private contractHandle: HorizonContractHandle | undefined;

  private constructor(
    providers: HorizonProviders,
    compiledContract: CompiledHorizonContract,
    contractAddress: string
  ) {
    this.providers = providers;
    this.compiledContract = compiledContract;
    this.contractAddress = contractAddress;
  }

  static async connect(config: HorizonClientConfig): Promise<MidnightProtocolClient> {
    // Hard gate: no verified deployment, no circuit client.
    const contractAddress = assertVerifiedDeployment(config.networkId);

    const artifactUrl = config.contractArtifactUrl || '/contracts';
    const zkConfigProvider = fetchZkConfigProvider<CircuitId>({
      baseURL: new URL(artifactUrl, globalThis.location?.href || 'http://localhost/').toString(),
      verify: 'require',
      expectedManifestHash: EXPECTED_MANIFEST_HASH,
    });

    // Fail early if the browser is serving a stale or tampered artifact set.
    const runtimeVersion = await zkConfigProvider.getArtifactRuntimeVersion();
    if (runtimeVersion !== '0.21.0') {
      throw new Error(
        `Compiled artifact runtime ${runtimeVersion} is not supported; expected 0.21.0.`
      );
    }

    const privateStateProvider = levelPrivateStateProvider<string, HorizonPrivateState>({
      midnightDbName: 'horizon-private-state',
      accountId: config.accountId,
      privateStoragePasswordProvider: config.privateStatePasswordProvider,
      levelFactory: ((name: string) => new Level(name)) as never,
    });

    const publicDataProvider = indexerPublicDataProvider({
      queryURL: config.walletConfig.indexerUri,
      subscriptionURL: config.walletConfig.indexerWsUri,
    });

    // Delegate proving to the wallet. Its ProvingProvider lacks lookupKey(),
    // which ledger-v9 requires, so add a no-op shim (the wallet owns keys).
    const walletProving = await config.walletApi.getProvingProvider(
      zkConfigProvider.asKeyMaterialProvider()
    );
    const provingProvider = {
      check: (preimage: Uint8Array, keyLocation: string) =>
        walletProving.check(preimage, keyLocation),
      prove: (preimage: Uint8Array, keyLocation: string, bindingInput?: bigint) =>
        walletProving.prove(preimage, keyLocation, bindingInput),
      lookupKey: async () => undefined,
    };

    const proofProvider = createLedger9ProofProvider(provingProvider);

    const shielded = await config.walletApi.getShieldedAddresses();
    const coinPublicKey = decodeShieldedKey(
      shielded.shieldedCoinPublicKey,
      'coin',
      config.networkId
    );
    const encryptionPublicKey = decodeShieldedKey(
      shielded.shieldedEncryptionPublicKey,
      'encryption',
      config.networkId
    );

    const walletProviderImpl: Ledger9WalletProvider = {
      balanceTx: async (tx) => {
        const balanced = await config.walletApi.balanceUnsealedTransaction(
          toHex(tx.serialize()),
          { payFees: true }
        );
        return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
      },
      getCoinPublicKey: () => coinPublicKey,
      getEncryptionPublicKey: () => encryptionPublicKey,
    };
    const walletProvider = createLedger9WalletProvider(walletProviderImpl);

    const midnightProvider = createLedger9MidnightProvider(async (tx) => {
      await config.walletApi.submitTransaction(toHex(tx.serialize()));
      const decoded = tx.deserialize({ v9: Transaction });
      const id = (decoded as unknown as { identifiers: () => string[] }).identifiers?.()[0];
      if (!id) {
        throw new Error('Wallet submission succeeded but returned no transaction identifier.');
      }
      return id;
    });

    const providers: HorizonProviders = {
      privateStateProvider,
      publicDataProvider,
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
      config: {
        networkId: config.networkId,
        ttlSeconds: config.ttlSeconds ?? 600,
      },
    };

    const client = new MidnightProtocolClient(
      providers,
      makeCompiledContract(),
      contractAddress
    );
    await client.attach();
    return client;
  }

  private async attach() {
    // findDeployedContract byte-matches local verifier keys against the chain's
    // registered keys, so a wrong artifact set is caught before any call. It
    // also requires stored private state whenever an ID is named, so seed an
    // empty state for wallets that have never used Horizon before.
    const states = this.providers.privateStateProvider.forContract(this.contractAddress);
    const initialPrivateState = await resolveInitialPrivateState(states);
    this.contractHandle = (await findDeployedContract(this.providers as never, {
      compiledContract: this.compiledContract,
      contractAddress: this.contractAddress,
      privateStateId: HORIZON_PRIVATE_STATE_ID,
      initialPrivateState,
    } as never)) as unknown as HorizonContractHandle;
  }

  /** Stores private snapshot data locally before a circuit consumes the witness. */
  async prepareSnapshot(snapshot: HorizonPrivateState['snapshot']): Promise<void> {
    if (!snapshot) throw new Error('snapshot is required');
    const states = this.providers.privateStateProvider.forContract(this.contractAddress);
    await states.set(HORIZON_PRIVATE_STATE_ID, { snapshot });
  }

  /** Returns the current private snapshot without disclosing it to the UI log. */
  async readSnapshot(): Promise<HorizonPrivateState['snapshot'] | undefined> {
    const states = this.providers.privateStateProvider.forContract(this.contractAddress);
    const state = await states.get(HORIZON_PRIVATE_STATE_ID);
    return state?.snapshot;
  }

  /**
   * Reads public contract state through the wallet's indexer provider. This is
   * the only production source for pool, loan, and repayment lists; demo
   * localStorage values are never mixed into this result.
   */
  async readOnChainState(): Promise<HorizonOnChainState> {
    const read = await this.providers.publicDataProvider.queryContractState(
      this.contractAddress as never
    );
    if (!read) {
      throw new Error('No on-chain contract state is available yet.');
    }
    if (read.contractState.era !== 'v9') {
      throw new Error(`Unsupported contract state era: ${read.contractState.era}.`);
    }
    const decoded = read.contractState.deserialize({ v9: ContractState });
    const state = ledger(decoded.data);

    const pools: LendingPool[] = Array.from(state.pools, ([, pool]) => ({
      pool_id: toHex(pool.pool_id),
      lender: toHex(pool.lender),
      min_income: pool.min_income,
      max_debt_to_income_bps: Number(pool.max_debt_to_income_bps),
      min_collateral_ratio_bps: Number(pool.min_collateral_ratio_bps),
      interest_rate_bps: Number(pool.interest_rate_bps),
      term_duration: pool.term_duration,
      pool_liquidity: pool.pool_liquidity,
      total_deposited: pool.total_deposited,
      total_lent: pool.total_lent,
      created_at: 0,
    }));

    const statuses: LoanStatus[] = [
      LoanStatus.PENDING,
      LoanStatus.ACTIVE,
      LoanStatus.REPAID,
      LoanStatus.DEFAULTED,
      LoanStatus.LIQUIDATED,
    ];
    const loans: Loan[] = Array.from(state.loans, ([, loan]) => ({
      loan_id: toHex(loan.loan_id),
      pool_id: toHex(loan.pool_id),
      borrower: toHex(loan.borrower),
      loan_amount: loan.loan_amount,
      collateral_locked: loan.collateral_locked,
      interest_rate_bps: Number(loan.interest_rate_bps),
      start_time: loan.start_time,
      due_date: loan.due_date,
      status: statuses[Number(loan.status)] || 'PENDING',
      total_repaid: loan.total_repaid,
      snapshot_commitment: toHex(loan.snapshot_commitment),
    }));

    const repayments: RepaymentEvent[] = Array.from(state.repayments, ([, repayment]) => ({
      repayment_id: toHex(repayment.repayment_id),
      loan_id: toHex(repayment.loan_id),
      payer: toHex(repayment.payer),
      amount: repayment.amount,
      timestamp: repayment.timestamp,
      tx_hash: '',
    }));

    return { pools, loans, repayments };
  }

  private get handle() {
    if (!this.contractHandle) {
      throw new Error('Contract handle is not attached. Call connect() first.');
    }
    return this.contractHandle;
  }

  private toResult(result: { public: { txId?: Uint8Array | string; status?: unknown } }): HorizonCallResult {
    const id = result.public.txId;
    return {
      txId: typeof id === 'string' ? id : id ? toHex(id) : 'unknown',
      status: result.public.status ? String(result.public.status) : 'submitted',
    };
  }

  async createLendingPool(args: {
    pool_id: Uint8Array;
    lender: Uint8Array;
    deposit_amount: bigint;
    min_income: bigint;
    max_debt_to_income_bps: bigint;
    min_collateral_ratio_bps: bigint;
    interest_rate_bps: bigint;
    term_duration: bigint;
  }): Promise<HorizonCallResult> {
    const result = await this.handle.callTx.createLendingPool(
      args.pool_id,
      args.lender,
      args.deposit_amount,
      args.min_income,
      args.max_debt_to_income_bps,
      args.min_collateral_ratio_bps,
      args.interest_rate_bps,
      args.term_duration
    );
    return this.toResult(result as never);
  }

  async submitFinancialSnapshot(args: { borrower: Uint8Array }): Promise<HorizonCallResult> {
    const result = await this.handle.callTx.submitFinancialSnapshot(args.borrower);
    return this.toResult(result as never);
  }

  async requestLoan(args: {
    loan_id: Uint8Array;
    pool_id: Uint8Array;
    borrower: Uint8Array;
    requested_amount: bigint;
    collateral_deposit: bigint;
    current_time: bigint;
  }): Promise<HorizonCallResult> {
    const result = await this.handle.callTx.requestLoan(
      args.loan_id,
      args.pool_id,
      args.borrower,
      args.requested_amount,
      args.collateral_deposit,
      args.current_time
    );
    return this.toResult(result as never);
  }

  async repayLoan(args: {
    repayment_id: Uint8Array;
    loan_id: Uint8Array;
    payer: Uint8Array;
    repay_amount: bigint;
    current_time: bigint;
  }): Promise<HorizonCallResult> {
    const result = await this.handle.callTx.repayLoan(
      args.repayment_id,
      args.loan_id,
      args.payer,
      args.repay_amount,
      args.current_time
    );
    return this.toResult(result as never);
  }

  async liquidate(args: {
    loan_id: Uint8Array;
    liquidator: Uint8Array;
    current_time: bigint;
  }): Promise<HorizonCallResult> {
    const result = await this.handle.callTx.liquidate(
      args.loan_id,
      args.liquidator,
      args.current_time
    );
    return this.toResult(result as never);
  }

  dispose(): void {
    void (this.providers.publicDataProvider as { dispose?: () => Promise<void> }).dispose?.();
  }
}

function fromHex(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, '');
  if (clean.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(clean)) throw new Error('Invalid hex string');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
