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
import { 
  LendingPool, 
  Loan, 
  RepaymentEvent, 
  FinancialSnapshot, 
  ZKProofTrace, 
  ExplorerTransaction 
} from './types/horizon';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pitch');
  const [walletConnected, setWalletConnected] = useState<boolean>(true);
  const [userNightBalance, setUserNightBalance] = useState<bigint>(250000n); // 250k NIGHT

  const defaultBorrower = '0x7a31f9820000000000000000000000000000000000000000000000000000f982';

  // Protocol state synced from horizon simulator
  const [pools, setPools] = useState<LendingPool[]>(() => horizon.getPools());
  const [loans, setLoans] = useState<Loan[]>(() => horizon.getLoans());
  const [repayments, setRepayments] = useState<RepaymentEvent[]>(() => horizon.getRepayments());
  const [transactions, setTransactions] = useState<ExplorerTransaction[]>(() => horizon.getTransactions());
  const [blockHeight, setBlockHeight] = useState<number>(() => horizon.getBlockHeight());
  const [currentTime, setCurrentTime] = useState<bigint>(() => horizon.getCurrentTime());

  const [currentCommitment, setCurrentCommitment] = useState<string | undefined>(() =>
    horizon.getBorrowerSnapshotCommitment(defaultBorrower)
  );

  const [selectedPoolForBorrow, setSelectedPoolForBorrow] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const refreshState = () => {
    setPools(horizon.getPools());
    setLoans(horizon.getLoans());
    setRepayments(horizon.getRepayments());
    setTransactions(horizon.getTransactions());
    setBlockHeight(horizon.getBlockHeight());
    setCurrentTime(horizon.getCurrentTime());
    setCurrentCommitment(horizon.getBorrowerSnapshotCommitment(defaultBorrower));
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
    const { pool } = await horizon.createLendingPool({
      ...params,
      lender: defaultBorrower,
    });
    setUserNightBalance((prev) => prev - params.deposit_amount);
    refreshState();
    showToast(`Lending Pool ${pool.pool_id.slice(0, 10)}... deployed on Midnight!`, 'success');
  };

  // CIRCUIT 2: Submit Snapshot
  const handleSnapshotSubmitted = async (borrower: string, snapshot: FinancialSnapshot): Promise<string> => {
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
    if (params.collateral_deposit > userNightBalance) {
      throw new Error(`Insufficient wallet balance to deposit collateral. You have ${formatNight(userNightBalance)}.`);
    }

    const { loan, proofTrace } = await horizon.requestLoan(params);
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
    const { loan, isFullyRepaid } = await horizon.repayLoan({
      loan_id: loanId,
      payer: defaultBorrower,
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
    await horizon.liquidate({
      loan_id: loanId,
      liquidator: defaultBorrower,
    });
    refreshState();
    showToast(`Permissionless liquidation completed! Seized collateral credited to pool.`, 'success');
  };

  const handleSelectPoolForBorrow = (poolId: string) => {
    setSelectedPoolForBorrow(poolId);
    setActiveTab('borrower');
  };

  const currentTimeDate = new Date(Number(currentTime) * 1000);
  const currentTimeStr = currentTimeDate.toLocaleDateString() + ' ' + currentTimeDate.toLocaleTimeString();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        blockHeight={blockHeight}
        walletConnected={walletConnected}
        setWalletConnected={setWalletConnected}
        userNightBalance={userNightBalance}
        setUserNightBalance={setUserNightBalance}
        onAdvanceTime={handleAdvanceTime}
        onResetDemo={handleResetDemo}
        currentTimeStr={currentTimeStr}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-10">
        {activeTab === 'pitch' && <DualLedgerPitch onNavigate={setActiveTab} />}

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
            borrowerAddress={defaultBorrower}
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
          <TransparencyExplorer transactions={transactions} blockHeight={blockHeight} />
        )}

        {activeTab === 'contract' && <ContractCodeViewer />}
      </main>

      {/* Toast Notification */}
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

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[#04070e] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-slate-300">HORIZON PROTOCOL</span>
            <span>•</span>
            <span>Midnight Network Private Lending</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Dual-Ledger Zero-Knowledge Architecture</span>
            <span>•</span>
            <span className="font-mono text-cyan-400">compactc v0.34.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
