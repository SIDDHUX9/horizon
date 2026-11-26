import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DualLedgerPitch } from './components/DualLedgerPitch';
import { LenderHub } from './components/LenderHub';
import { BorrowerStudio } from './components/BorrowerStudio';
import { LoanDetailTerminal } from './components/LoanDetailTerminal';
import { LiquidationTerminal } from './components/LiquidationTerminal';
import { TransparencyExplorer } from './components/TransparencyExplorer';
import { ContractCodeViewer } from './components/ContractCodeViewer';
import { 
  horizon, 
  formatNight 
} from './contracts/horizonSimulator';
import { EditorialLandingPage } from './components/EditorialLandingPage';
import { WhitepaperPage } from './components/WhitepaperPage';
import { WalletModal } from './components/WalletModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DemoModeBanner } from './components/DemoModeBanner';
import { PrivateStatePasswordModal } from './components/PrivateStatePasswordModal';
import { ProtocolOfflinePanel } from './components/ProtocolOfflinePanel';
import { 
  getAvailableMidnightWallets, 
  connectLaceWallet, 
  DiscoveredWallet,
  LaceConnectedSession
} from './services/laceWallet';
import { MidnightLiveIndexer } from './services/midnightLiveIndexer';
import { getRuntimeMode, assertDemoMode, RuntimeMode } from './services/runtimeMode';
import { isDeploymentVerified } from './services/deploymentGate';
import type { MidnightProtocolClient } from './services/midnightProtocolClient';
import {
  addressToBytes32,
  randomBytes32,
  hexToBytes,
} from './services/ids';
import { 
  getCurrentRoute, 
  navigateToRoute, 
  ProtocolRoute 
} from './services/router';
import { 
  LendingPool, 
  Loan, 
  RepaymentEvent, 
  FinancialSnapshot, 
  ZKProofTrace, 
  ExplorerTransaction 
} from './types/horizon';

/** Wallet configuration reports display names; the deployment record uses canonical IDs. */
function toCanonicalNetworkId(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes('mainnet')) return 'mainnet';
  if (normalized.includes('preprod')) return 'preprod';
  if (normalized.includes('preview')) return 'preview';
  return normalized;
}

function nowSeconds(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}

export const App: React.FC = () => {
  const runtimeMode: RuntimeMode = getRuntimeMode();
  const [activeTab, setActiveTab] = useState<ProtocolRoute>(() => getCurrentRoute());
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [shieldedAddress, setShieldedAddress] = useState<string | undefined>(undefined);
  const [dustBalance, setDustBalance] = useState<bigint | undefined>(undefined);
  const [dustCap, setDustCap] = useState<bigint | undefined>(undefined);
  const [networkId, setNetworkId] = useState<string | undefined>('Midnight Preview');
  const [indexerUri, setIndexerUri] = useState<string | undefined>(undefined);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('preview');
  const [userNightBalance, setUserNightBalance] = useState<bigint>(0n);

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [discoveredWallets, setDiscoveredWallets] = useState<DiscoveredWallet[]>([]);
  const [isConnectingLace, setIsConnectingLace] = useState(false);
  const [laceError, setLaceError] = useState<string | null>(null);
  const [laceSession, setLaceSession] = useState<LaceConnectedSession | null>(null);

  const [protocolClient, setProtocolClient] = useState<MidnightProtocolClient | null>(null);
  const [pendingProtocolSession, setPendingProtocolSession] = useState<LaceConnectedSession | null>(null);
  const [privateStatePassword, setPrivateStatePassword] = useState('');
  const privateStatePasswordRef = React.useRef<string | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [isUnlockingPrivateState, setIsUnlockingPrivateState] = useState(false);
  const [privateStateError, setPrivateStateError] = useState<string | null>(null);

  // In production mode protocol state is never read from the demo localStorage ledger.
  const [pools, setPools] = useState<LendingPool[]>(() =>
    runtimeMode === 'demo' ? horizon.getPools() : []
  );
  const [loans, setLoans] = useState<Loan[]>(() =>
    runtimeMode === 'demo' ? horizon.getLoans() : []
  );
  const [repayments, setRepayments] = useState<RepaymentEvent[]>(() =>
    runtimeMode === 'demo' ? horizon.getRepayments() : []
  );
  const [transactions, setTransactions] = useState<ExplorerTransaction[]>(() =>
    runtimeMode === 'demo' ? horizon.getTransactions() : []
  );
  const [blockHeight, setBlockHeight] = useState<number>(() =>
    runtimeMode === 'demo' ? horizon.getBlockHeight() : 0
  );
  const [currentTime, setCurrentTime] = useState<bigint>(() =>
    runtimeMode === 'demo' ? horizon.getCurrentTime() : nowSeconds()
  );

  const [currentCommitment, setCurrentCommitment] = useState<string | undefined>(undefined);

  const [selectedPoolForBorrow, setSelectedPoolForBorrow] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const checkLace = async () => {
    const wallets = getAvailableMidnightWallets();
    setDiscoveredWallets(wallets);
  };

  useEffect(() => {
    checkLace();
    const fetchLiveHeight = async () => {
      const blocks = await MidnightLiveIndexer.getLatestBlocks(1);
      if (blocks.length > 0 && blocks[0].height) {
        setBlockHeight(blocks[0].height);
      }
    };
    fetchLiveHeight();
    const timer = setInterval(fetchLiveHeight, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getCurrentRoute());
    };
    const handleCustomRoute = (e: any) => {
      if (e.detail?.route) {
        setActiveTab(e.detail.route);
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('protocol-route-change', handleCustomRoute);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('protocol-route-change', handleCustomRoute);
    };
  }, []);

  const handleNavigate = (route: ProtocolRoute | string) => {
    let cleanRoute: ProtocolRoute = 'landing';
    if (route === 'landing' || route === '/' || route === '/home') cleanRoute = 'landing';
    else if (route === 'whitepaper' || route === '/whitepaper') cleanRoute = 'whitepaper';
    else if (route === 'borrower' || route === 'borrow' || route === '/borrow') cleanRoute = 'borrower';
    else if (route === 'lender' || route === 'lend' || route === '/lend') cleanRoute = 'lender';
    else if (route === 'loans' || route === '/loans') cleanRoute = 'loans';
    else if (route === 'liquidate' || route === '/liquidate') cleanRoute = 'liquidate';
    else if (route === 'explorer' || route === '/explorer') cleanRoute = 'explorer';
    else if (route === 'contract' || route === 'contracts' || route === '/contract') cleanRoute = 'contract';
    else if (route === 'pitch' || route === 'architecture' || route === '/architecture') cleanRoute = 'pitch';

    setActiveTab(cleanRoute);
    navigateToRoute(cleanRoute);
  };

  const handleConnectLace = async (walletId?: string) => {
    setIsConnectingLace(true);
    setLaceError(null);
    try {
      const session = await connectLaceWallet(walletId, selectedNetwork);
      setLaceSession(session);
      setUserAddress(session.unshieldedAddress);
      setShieldedAddress(session.shieldedAddress);
      setDustBalance(session.dustBalance);
      setDustCap(session.dustCap);
      setNetworkId(session.config?.networkId || `Midnight ${selectedNetwork}`);
      setIndexerUri(session.config?.indexerUri);
      setWalletConnected(true);
      setUserNightBalance(session.nightBalance ?? 0n);
      setWalletModalOpen(false);

      const canonicalNetwork = toCanonicalNetworkId(
        session.config?.networkId || selectedNetwork
      );
      if (runtimeMode === 'production' && isDeploymentVerified(canonicalNetwork)) {
        setPendingProtocolSession(session);
        setPrivateStatePassword('');
        setPrivateStateError(null);
        setPasswordModalOpen(true);
        showToast('Wallet connected. Unlock private state to attach the verified contract client.', 'info');
      } else if (runtimeMode === 'production') {
        showToast(
          `Wallet connected, but no verified Horizon deployment exists on ${canonicalNetwork}. Circuit calls remain disabled.`,
          'error'
        );
      } else {
        showToast(`Connected to ${session.walletName}: ${session.unshieldedAddress.slice(0, 8)}...${session.unshieldedAddress.slice(-6)}`, 'success');
      }
    } catch (err: any) {
      setLaceError(err.message || 'Failed to connect to Midnight Lace wallet.');
    } finally {
      setIsConnectingLace(false);
    }
  };

  const handleDisconnectLace = () => {
    setLaceSession(null);
    setUserAddress(null);
    setShieldedAddress(undefined);
    setDustBalance(undefined);
    setDustCap(undefined);
    setIndexerUri(undefined);
    setWalletConnected(false);
    setUserNightBalance(0n);
    setWalletModalOpen(false);
    setProtocolClient((client) => {
      client?.dispose();
      return null;
    });
    setPendingProtocolSession(null);
    privateStatePasswordRef.current = null;
    setPrivateStatePassword('');
    setPasswordModalOpen(false);
    setPrivateStateError(null);
    showToast('Wallet disconnected; private-state password cleared.', 'info');
  };

  const unlockPrivateState = async () => {
    if (!pendingProtocolSession) return;
    if (privateStatePassword.length === 0) {
      setPrivateStateError('A private-state password is required.');
      return;
    }
    setIsUnlockingPrivateState(true);
    setPrivateStateError(null);
    try {
      const canonicalNetwork = toCanonicalNetworkId(
        pendingProtocolSession.config?.networkId || selectedNetwork
      );
      if (!isDeploymentVerified(canonicalNetwork)) {
        throw new Error(`No verified Horizon deployment exists on ${canonicalNetwork}.`);
      }
      if (!pendingProtocolSession.config?.indexerUri) {
        throw new Error('The wallet did not provide an indexer configuration.');
      }
      const password = privateStatePassword;
      const { MidnightProtocolClient } = await import('./services/midnightProtocolClient');
      const client = await MidnightProtocolClient.connect({
        walletApi: pendingProtocolSession.api,
        networkId: canonicalNetwork,
        walletConfig: pendingProtocolSession.config,
        accountId: pendingProtocolSession.unshieldedAddress,
        privateStatePasswordProvider: async () => password,
      });
      privateStatePasswordRef.current = password;
      setProtocolClient((previous) => {
        previous?.dispose();
        return client;
      });
      setPasswordModalOpen(false);
      setPendingProtocolSession(null);
      setPrivateStatePassword('');
      showToast('Private state unlocked and verified contract client attached.', 'success');
    } catch (err: any) {
      setPrivateStateError(err?.message || 'Could not attach the verified contract client.');
    } finally {
      setIsUnlockingPrivateState(false);
    }
  };

  const requireProtocolClient = async (): Promise<MidnightProtocolClient> => {
    if (!protocolClient) {
      setPasswordModalOpen(Boolean(pendingProtocolSession));
      setWalletModalOpen(!pendingProtocolSession);
      throw new Error(
        'Connect a Midnight wallet and unlock private state before calling a circuit.'
      );
    }
    return protocolClient;
  };

  const refreshState = () => {
    assertDemoMode('Demo ledger refresh', runtimeMode);
    setPools(horizon.getPools());
    setLoans(horizon.getLoans());
    setRepayments(horizon.getRepayments());
    setTransactions(horizon.getTransactions());
    setBlockHeight(horizon.getBlockHeight());
    setCurrentTime(horizon.getCurrentTime());
    if (userAddress) {
      setCurrentCommitment(horizon.getBorrowerSnapshotCommitment(userAddress));
    }
  };

  // Periodic clock update. Production time is the real clock, never the demo offset.
  useEffect(() => {
    if (runtimeMode !== 'demo') {
      setCurrentTime(nowSeconds());
      const timer = setInterval(() => setCurrentTime(nowSeconds()), 5000);
      return () => clearInterval(timer);
    }
    const timer = setInterval(() => setCurrentTime(horizon.getCurrentTime()), 5000);
    return () => clearInterval(timer);
  }, [runtimeMode]);

  const handleAdvanceTime = (days: number) => {
    try {
      assertDemoMode('Protocol clock controls', runtimeMode);
      horizon.advanceTime(days * 86400);
      refreshState();
      showToast(`Fast-forwarded protocol clock by +${days} days (Block #${horizon.getBlockHeight()})`, 'info');
    } catch (err: any) {
      showToast(err?.message || 'Clock controls are unavailable.', 'error');
    }
  };

  const handleResetDemo = () => {
    try {
      assertDemoMode('Demo reset', runtimeMode);
      horizon.resetToDemo();
      setUserNightBalance(laceSession?.nightBalance ?? 0n);
      refreshState();
      showToast('Protocol reset to default demonstration state', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Demo reset is unavailable.', 'error');
    }
  };

  // CIRCUIT 1: Create Pool
  const handleCreatePool = async (params: {
    deposit_amount: bigint;
    min_income: bigint;
    max_debt_to_income_bps: number;
    min_collateral_ratio_bps: number;
    interest_rate_bps: number;
    term_duration: bigint;
  }) => {
    if (!walletConnected || !userAddress) {
      setWalletModalOpen(true);
      showToast('Midnight Lace Wallet required to create a pool.', 'error');
      throw new Error('Midnight Lace wallet not connected.');
    }

    if (runtimeMode === 'production') {
      const client = await requireProtocolClient();
      const canonicalNetwork = toCanonicalNetworkId(networkId || selectedNetwork);
      const result = await client.createLendingPool({
        pool_id: randomBytes32(),
        lender: addressToBytes32(userAddress, canonicalNetwork),
        deposit_amount: params.deposit_amount,
        min_income: params.min_income,
        max_debt_to_income_bps: BigInt(params.max_debt_to_income_bps),
        min_collateral_ratio_bps: BigInt(params.min_collateral_ratio_bps),
        interest_rate_bps: BigInt(params.interest_rate_bps),
        term_duration: params.term_duration,
      });
      showToast(`On-chain pool creation submitted (tx ${result.txId}). Wallet balances are not adjusted by the contract client.`, 'success');
      return;
    }
    assertDemoMode('Simulated pool creation', runtimeMode);

    const { pool } = await horizon.createLendingPool({
      ...params,
      lender: userAddress,
    });
    setUserNightBalance((prev) => prev - params.deposit_amount);
    refreshState();
    showToast(`Simulated lending pool ${pool.pool_id.slice(0, 10)}... created in the demo ledger.`, 'success');
  };

  // CIRCUIT 2: Submit Snapshot
  const handleSnapshotSubmitted = async (borrower: string, snapshot: FinancialSnapshot): Promise<string> => {
    if (!walletConnected || !userAddress) {
      setWalletModalOpen(true);
      showToast('Midnight Lace Wallet required to submit financial snapshot.', 'error');
      throw new Error('Midnight Lace wallet not connected.');
    }

    if (runtimeMode === 'production') {
      const client = await requireProtocolClient();
      const canonicalNetwork = toCanonicalNetworkId(networkId || selectedNetwork);
      await client.prepareSnapshot({
        actual_income: snapshot.actual_income,
        existing_debt: snapshot.existing_debt,
        computed_dti_ratio: BigInt(snapshot.computed_dti_ratio),
        computed_collateral_ratio: BigInt(snapshot.computed_collateral_ratio),
        salt: hexToBytes(snapshot.salt),
      });
      const result = await client.submitFinancialSnapshot({
        borrower: addressToBytes32(borrower || userAddress, canonicalNetwork),
      });
      showToast(`Snapshot commitment submitted on-chain (tx ${result.txId}).`, 'success');
      return result.txId;
    }
    assertDemoMode('Simulated snapshot submission', runtimeMode);

    const { commitment } = await horizon.submitFinancialSnapshot(borrower, snapshot);
    refreshState();
    showToast(`Simulated snapshot commitment ${commitment.slice(0, 14)}... stored in the demo ledger.`, 'success');
    return commitment;
  };

  // CIRCUIT 3: Request Loan
  const handleRequestLoan = async (params: {
    pool_id: string;
    borrower: string;
    requested_amount: bigint;
    collateral_deposit: bigint;
    snapshot_witness: FinancialSnapshot;
  }): Promise<ZKProofTrace> => {
    if (!walletConnected || !userAddress) {
      setWalletModalOpen(true);
      showToast('Midnight Lace Wallet required to request loan.', 'error');
      throw new Error('Midnight Lace wallet not connected.');
    }

    if (runtimeMode === 'production') {
      const client = await requireProtocolClient();
      const canonicalNetwork = toCanonicalNetworkId(networkId || selectedNetwork);
      await client.prepareSnapshot({
        actual_income: params.snapshot_witness.actual_income,
        existing_debt: params.snapshot_witness.existing_debt,
        computed_dti_ratio: BigInt(params.snapshot_witness.computed_dti_ratio),
        computed_collateral_ratio: BigInt(params.snapshot_witness.computed_collateral_ratio),
        salt: hexToBytes(params.snapshot_witness.salt),
      });
      const result = await client.requestLoan({
        loan_id: randomBytes32(),
        pool_id: hexToBytes(params.pool_id),
        borrower: addressToBytes32(userAddress, canonicalNetwork),
        requested_amount: params.requested_amount,
        collateral_deposit: params.collateral_deposit,
        current_time: nowSeconds(),
      });
      showToast(
        `Loan request submitted on-chain (tx ${result.txId}). Check the indexer before treating it as settled.`,
        'success'
      );
      return {
        circuit_name: 'requestLoan',
        witness_commitment: 'private witness held in encrypted local state',
        prover_key: 'wallet DApp Connector prover',
        verifier_key: 'registered contract verifier',
        checks: [],
        is_valid: true,
        timestamp: Date.now(),
        proof_hash: 'not exposed by DApp Connector',
        tx_hash: result.txId,
        onchain_confirmed: false,
      };
    }
    assertDemoMode('Simulated loan request', runtimeMode);

    if (params.collateral_deposit > userNightBalance) {
      throw new Error(`Insufficient wallet balance to deposit collateral. You have ${formatNight(userNightBalance)}.`);
    }

    const { loan, proofTrace } = await horizon.requestLoan({
      ...params,
      borrower: userAddress,
    });
    // Deduct collateral from user, add disbursed loan
    setUserNightBalance((prev) => prev - params.collateral_deposit + params.requested_amount);
    refreshState();
    showToast(
      `Simulated loan request complete: ${formatNight(params.requested_amount)} recorded in the demo ledger.`,
      'success'
    );
    return proofTrace;
  };

  // CIRCUIT 4: Repay Loan
  const handleRepayLoan = async (loanId: string, amount: bigint): Promise<boolean> => {
    if (!walletConnected || !userAddress) {
      setWalletModalOpen(true);
      showToast('Midnight Lace Wallet required to repay loan.', 'error');
      throw new Error('Midnight Lace wallet not connected.');
    }

    if (runtimeMode === 'production') {
      const client = await requireProtocolClient();
      const canonicalNetwork = toCanonicalNetworkId(networkId || selectedNetwork);
      const result = await client.repayLoan({
        repayment_id: randomBytes32(),
        loan_id: hexToBytes(loanId),
        payer: addressToBytes32(userAddress, canonicalNetwork),
        repay_amount: amount,
        current_time: nowSeconds(),
      });
      showToast(`Repayment submitted on-chain (tx ${result.txId}). Settle status from the indexer before releasing collateral.`, 'info');
      return false;
    }
    assertDemoMode('Simulated repayment', runtimeMode);

    const { loan, isFullyRepaid } = await horizon.repayLoan({
      loan_id: loanId,
      payer: userAddress,
      repay_amount: amount,
    });
    setUserNightBalance((prev) => prev - amount);
    if (isFullyRepaid) {
      // Collateral returned to user
      setUserNightBalance((prev) => prev + loan.collateral_locked);
      showToast('Simulated loan settled in full. Collateral release recorded in the demo ledger.', 'success');
    } else {
      showToast(`Simulated repayment of ${formatNight(amount)} recorded in the demo ledger.`, 'info');
    }
    refreshState();
    return isFullyRepaid;
  };

  // CIRCUIT 5: Liquidate
  const handleLiquidate = async (loanId: string) => {
    if (!walletConnected || !userAddress) {
      setWalletModalOpen(true);
      showToast('Midnight Lace Wallet required to trigger liquidation.', 'error');
      throw new Error('Midnight Lace wallet not connected.');
    }

    if (runtimeMode === 'production') {
      const client = await requireProtocolClient();
      const canonicalNetwork = toCanonicalNetworkId(networkId || selectedNetwork);
      const result = await client.liquidate({
        loan_id: hexToBytes(loanId),
        liquidator: addressToBytes32(userAddress, canonicalNetwork),
        current_time: nowSeconds(),
      });
      showToast(`Liquidation submitted on-chain (tx ${result.txId}). Confirm the resulting state on the indexer.`, 'info');
      return;
    }
    assertDemoMode('Simulated liquidation', runtimeMode);

    await horizon.liquidate({
      loan_id: loanId,
      liquidator: userAddress,
    });
    refreshState();
    showToast('Simulated liquidation complete. Collateral accounting updated in the demo ledger.', 'success');
  };

  const handleSelectPoolForBorrow = (poolId: string) => {
    setSelectedPoolForBorrow(poolId);
    handleNavigate('borrower');
  };

  const currentTimeDate = new Date(Number(currentTime) * 1000);
  const currentTimeStr = currentTimeDate.toLocaleDateString() + ' ' + currentTimeDate.toLocaleTimeString();

  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-[#fbfbf9]">
        <DemoModeBanner />
        <EditorialLandingPage
          onNavigate={handleNavigate}
          walletConnected={walletConnected}
          userAddress={userAddress}
          onOpenWalletModal={() => setWalletModalOpen(true)}
          userNightBalance={userNightBalance}
          blockHeight={blockHeight}
        />

        <WalletModal
          isOpen={walletModalOpen}
          onClose={() => setWalletModalOpen(false)}
          onConnect={handleConnectLace}
          isConnecting={isConnectingLace}
          errorMessage={laceError}
          discoveredWallets={discoveredWallets}
          onCheckDetection={checkLace}
          connectedAddress={userAddress}
          shieldedAddress={shieldedAddress}
          dustBalance={dustBalance}
          dustCap={dustCap}
          networkId={networkId}
          indexerUri={indexerUri}
          selectedNetwork={selectedNetwork}
          onSelectNetwork={setSelectedNetwork}
          onDisconnect={handleDisconnectLace}
        />

        <PrivateStatePasswordModal
          isOpen={passwordModalOpen}
          password={privateStatePassword}
          onPasswordChange={setPrivateStatePassword}
          onSubmit={unlockPrivateState}
          onCancel={() => {
            setPasswordModalOpen(false);
            setPrivateStatePassword('');
            setPrivateStateError(null);
          }}
          isUnlocking={isUnlockingPrivateState}
          errorMessage={privateStateError}
          accountId={pendingProtocolSession?.unshieldedAddress}
        />

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div
              className={`px-4 py-3 rounded-xl shadow-2xl border text-xs font-mono font-semibold flex items-center gap-2 ${
                toast.type === 'success'
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                  : toast.type === 'error'
                  ? 'bg-rose-950/90 text-rose-300 border-rose-500/40'
                  : 'bg-cyan-950/90 text-cyan-300 border-cyan-500/40'
              }`}
            >
              <span>{toast.type === 'success' ? '⚡' : toast.type === 'error' ? '⚠️' : 'ℹ️'}</span>
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'whitepaper') {
    return (
      <div className="min-h-screen bg-[#fbfbf9]">
        <DemoModeBanner />
        <WhitepaperPage
          onNavigate={handleNavigate}
          blockHeight={blockHeight}
        />

        <WalletModal
          isOpen={walletModalOpen}
          onClose={() => setWalletModalOpen(false)}
          onConnect={handleConnectLace}
          isConnecting={isConnectingLace}
          errorMessage={laceError}
          discoveredWallets={discoveredWallets}
          onCheckDetection={checkLace}
          connectedAddress={userAddress}
          shieldedAddress={shieldedAddress}
          dustBalance={dustBalance}
          dustCap={dustCap}
          networkId={networkId}
          indexerUri={indexerUri}
          selectedNetwork={selectedNetwork}
          onSelectNetwork={setSelectedNetwork}
          onDisconnect={handleDisconnectLace}
        />

        <PrivateStatePasswordModal
          isOpen={passwordModalOpen}
          password={privateStatePassword}
          onPasswordChange={setPrivateStatePassword}
          onSubmit={unlockPrivateState}
          onCancel={() => {
            setPasswordModalOpen(false);
            setPrivateStatePassword('');
            setPrivateStateError(null);
          }}
          isUnlocking={isUnlockingPrivateState}
          errorMessage={privateStateError}
          accountId={pendingProtocolSession?.unshieldedAddress}
        />

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
            <div
              className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-mono font-semibold flex items-center gap-2.5 bg-white ${
                toast.type === 'success'
                  ? 'text-emerald-800 border-emerald-200'
                  : toast.type === 'error'
                  ? 'text-rose-800 border-rose-200'
                  : 'text-[#11161a] border-[#eaeae5]'
              }`}
            >
              <span>{toast.type === 'success' ? '⚡' : toast.type === 'error' ? '⚠️' : 'ℹ️'}</span>
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbf9] text-[#11161a]">
      <DemoModeBanner />
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        blockHeight={blockHeight}
        walletConnected={walletConnected}
        userAddress={userAddress}
        onOpenWalletModal={() => setWalletModalOpen(true)}
        onDisconnectWallet={handleDisconnectLace}
        userNightBalance={userNightBalance}
        setUserNightBalance={setUserNightBalance}
        onAdvanceTime={handleAdvanceTime}
        onResetDemo={handleResetDemo}
        currentTimeStr={currentTimeStr}
        runtimeMode={runtimeMode}
      />

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onConnect={handleConnectLace}
        isConnecting={isConnectingLace}
        errorMessage={laceError}
        discoveredWallets={discoveredWallets}
        onCheckDetection={checkLace}
        connectedAddress={userAddress}
        shieldedAddress={shieldedAddress}
        dustBalance={dustBalance}
        dustCap={dustCap}
        networkId={networkId}
        indexerUri={indexerUri}
        selectedNetwork={selectedNetwork}
        onSelectNetwork={setSelectedNetwork}
        onDisconnect={handleDisconnectLace}
      />

      <PrivateStatePasswordModal
        isOpen={passwordModalOpen}
        password={privateStatePassword}
        onPasswordChange={setPrivateStatePassword}
        onSubmit={unlockPrivateState}
        onCancel={() => {
          setPasswordModalOpen(false);
          setPrivateStatePassword('');
          setPrivateStateError(null);
        }}
        isUnlocking={isUnlockingPrivateState}
        errorMessage={privateStateError}
        accountId={pendingProtocolSession?.unshieldedAddress}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-10">
        <ErrorBoundary>
          {activeTab === 'pitch' && <DualLedgerPitch onNavigate={handleNavigate} />}

          {activeTab === 'lender' &&
            (runtimeMode === 'demo' ? (
              <LenderHub
                pools={pools}
                onCreatePool={handleCreatePool}
                onSelectPoolForBorrow={handleSelectPoolForBorrow}
                userNightBalance={userNightBalance}
              />
            ) : (
              <ProtocolOfflinePanel circuit="createLendingPool" />
            ))}

          {activeTab === 'borrower' &&
            (runtimeMode === 'demo' ? (
              <BorrowerStudio
                pools={pools}
                selectedPoolId={selectedPoolForBorrow}
                onSnapshotSubmitted={handleSnapshotSubmitted}
                onRequestLoan={handleRequestLoan}
                userNightBalance={userNightBalance}
                currentCommitment={currentCommitment}
                borrowerAddress={userAddress || ''}
              />
            ) : (
              <ProtocolOfflinePanel circuit="submitFinancialSnapshot / requestLoan" />
            ))}

          {activeTab === 'loans' &&
            (runtimeMode === 'demo' ? (
              <LoanDetailTerminal
                loans={loans}
                repayments={repayments}
                onRepayLoan={handleRepayLoan}
                userNightBalance={userNightBalance}
                currentTime={currentTime}
              />
            ) : (
              <ProtocolOfflinePanel circuit="repayLoan" />
            ))}

          {activeTab === 'liquidate' &&
            (runtimeMode === 'demo' ? (
              <LiquidationTerminal
                loans={loans}
                currentTime={currentTime}
                onAdvanceTime={handleAdvanceTime}
                onLiquidate={handleLiquidate}
              />
            ) : (
              <ProtocolOfflinePanel circuit="liquidate" />
            ))}

          {activeTab === 'explorer' && (
            <TransparencyExplorer
              transactions={runtimeMode === 'demo' ? transactions : []}
              blockHeight={blockHeight}
              loans={runtimeMode === 'demo' ? loans : []}
              pools={runtimeMode === 'demo' ? pools : []}
              repayments={runtimeMode === 'demo' ? repayments : []}
              laceSession={laceSession}
              onOpenWalletModal={() => setWalletModalOpen(true)}
              runtimeMode={runtimeMode}
            />
          )}

          {activeTab === 'contract' && <ContractCodeViewer />}
        </ErrorBoundary>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-mono font-semibold flex items-center gap-2.5 bg-white ${
              toast.type === 'success'
                ? 'text-emerald-800 border-emerald-200'
                : toast.type === 'error'
                ? 'text-rose-800 border-rose-200'
                : 'text-[#11161a] border-[#eaeae5]'
            }`}
          >
            <span>{toast.type === 'success' ? '⚡' : toast.type === 'error' ? '⚠️' : 'ℹ️'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#eaeae5] bg-[#fbfbf9] py-8 text-xs text-[#525f6c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span 
              onClick={() => handleNavigate('landing')}
              className="font-extrabold tracking-[0.18em] text-[#11161a] uppercase cursor-pointer text-sm hover:opacity-80 transition"
            >
              H O R I Z O N
            </span>
            <span className="text-[#d5d5cf]">|</span>
            <span className="text-[#525f6c] font-medium">Zero-Knowledge Private Credit Protocol</span>
          </div>
          <div className="flex items-center gap-6 text-[#525f6c] font-medium">
            <button onClick={() => handleNavigate('landing')} className="hover:text-[#11161a] transition">Home</button>
            <button onClick={() => handleNavigate('whitepaper')} className="hover:text-[#11161a] transition">Whitepaper</button>
            <button onClick={() => handleNavigate('borrower')} className="hover:text-[#11161a] transition">Borrow</button>
            <button onClick={() => handleNavigate('lender')} className="hover:text-[#11161a] transition">Lend</button>
            <button onClick={() => handleNavigate('explorer')} className="hover:text-[#11161a] transition">Explorer</button>
            <button onClick={() => handleNavigate('contract')} className="hover:text-[#11161a] transition">Contract</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
