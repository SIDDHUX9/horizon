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
import { 
  getAvailableMidnightWallets, 
  connectLaceWallet, 
  DiscoveredWallet 
} from './services/laceWallet';
import { MidnightLiveIndexer } from './services/midnightLiveIndexer';
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

export const App: React.FC = () => {
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

  // Protocol state synced from horizon simulator
  const [pools, setPools] = useState<LendingPool[]>(() => horizon.getPools());
  const [loans, setLoans] = useState<Loan[]>(() => horizon.getLoans());
  const [repayments, setRepayments] = useState<RepaymentEvent[]>(() => horizon.getRepayments());
  const [transactions, setTransactions] = useState<ExplorerTransaction[]>(() => horizon.getTransactions());
  const [blockHeight, setBlockHeight] = useState<number>(() => horizon.getBlockHeight());
  const [currentTime, setCurrentTime] = useState<bigint>(() => horizon.getCurrentTime());

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
      setUserAddress(session.unshieldedAddress);
      setShieldedAddress(session.shieldedAddress);
      setDustBalance(session.dustBalance);
      setDustCap(session.dustCap);
      setNetworkId(session.config?.networkId || `Midnight ${selectedNetwork}`);
      setIndexerUri(session.config?.indexerUri);
      setWalletConnected(true);
      setUserNightBalance(250000n);
      setWalletModalOpen(false);
      showToast(`Connected to ${session.walletName}: ${session.unshieldedAddress.slice(0, 8)}...${session.unshieldedAddress.slice(-6)}`, 'success');
    } catch (err: any) {
      setLaceError(err.message || 'Failed to connect to Midnight Lace wallet.');
    } finally {
      setIsConnectingLace(false);
    }
  };

  const handleDisconnectLace = () => {
    setUserAddress(null);
    setShieldedAddress(undefined);
    setDustBalance(undefined);
    setDustCap(undefined);
    setIndexerUri(undefined);
    setWalletConnected(false);
    setUserNightBalance(0n);
    setWalletModalOpen(false);
    showToast('Lace wallet disconnected.', 'info');
  };

  const refreshState = () => {
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

  // Periodic clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(horizon.getCurrentTime());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleAdvanceTime = (days: number) => {
    horizon.advanceTime(days * 86400);
    refreshState();
    showToast(`Fast-forwarded protocol clock by +${days} days (Block #${horizon.getBlockHeight()})`, 'info');
  };

  const handleResetDemo = () => {
    horizon.resetToDemo();
    setUserNightBalance(250000n);
    refreshState();
    showToast('Protocol reset to default demonstration state', 'info');
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

    const { pool } = await horizon.createLendingPool({
      ...params,
      lender: userAddress,
    });
    setUserNightBalance((prev) => prev - params.deposit_amount);
    refreshState();
    showToast(`Lending Pool ${pool.pool_id.slice(0, 10)}... deployed on Midnight!`, 'success');
  };

  // CIRCUIT 2: Submit Snapshot
  const handleSnapshotSubmitted = async (borrower: string, snapshot: FinancialSnapshot): Promise<string> => {
    if (!walletConnected || !userAddress) {
      setWalletModalOpen(true);
      showToast('Midnight Lace Wallet required to submit financial snapshot.', 'error');
      throw new Error('Midnight Lace wallet not connected.');
    }

    const { commitment } = await horizon.submitFinancialSnapshot(borrower, snapshot);
    refreshState();
    showToast(`Snapshot commitment ${commitment.slice(0, 14)}... stored on-chain!`, 'success');
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
      `ZK Proof Verified! Loan of ${formatNight(params.requested_amount)} disbursed to your wallet.`,
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

    const { loan, isFullyRepaid } = await horizon.repayLoan({
      loan_id: loanId,
      payer: userAddress,
      repay_amount: amount,
    });
    setUserNightBalance((prev) => prev - amount);
    if (isFullyRepaid) {
      // Collateral returned to user
      setUserNightBalance((prev) => prev + loan.collateral_locked);
      showToast(`Loan settled in full! Collateral released back to wallet.`, 'success');
    } else {
      showToast(`Repayment of ${formatNight(amount)} recorded on-chain.`, 'info');
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

    await horizon.liquidate({
      loan_id: loanId,
      liquidator: userAddress,
    });
    refreshState();
    showToast(`Permissionless liquidation completed! Seized collateral credited to pool.`, 'success');
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-10">
        {activeTab === 'pitch' && <DualLedgerPitch onNavigate={handleNavigate} />}

        {activeTab === 'lender' && (
          <LenderHub
            pools={pools}
            onCreatePool={handleCreatePool}
            onSelectPoolForBorrow={handleSelectPoolForBorrow}
            userNightBalance={userNightBalance}
          />
        )}

        {activeTab === 'borrower' && (
          <BorrowerStudio
            pools={pools}
            selectedPoolId={selectedPoolForBorrow}
            onSnapshotSubmitted={handleSnapshotSubmitted}
            onRequestLoan={handleRequestLoan}
            userNightBalance={userNightBalance}
            currentCommitment={currentCommitment}
            borrowerAddress={userAddress || ''}
          />
        )}

        {activeTab === 'loans' && (
          <LoanDetailTerminal
            loans={loans}
            repayments={repayments}
            onRepayLoan={handleRepayLoan}
            userNightBalance={userNightBalance}
            currentTime={currentTime}
          />
        )}

        {activeTab === 'liquidate' && (
          <LiquidationTerminal
            loans={loans}
            currentTime={currentTime}
            onAdvanceTime={handleAdvanceTime}
            onLiquidate={handleLiquidate}
          />
        )}

        {activeTab === 'explorer' && (
          <TransparencyExplorer
            transactions={transactions}
            blockHeight={blockHeight}
            loans={loans}
            pools={pools}
            repayments={repayments}
          />
        )}

        {activeTab === 'contract' && <ContractCodeViewer />}
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
