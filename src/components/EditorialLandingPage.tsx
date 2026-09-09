import React, { useState } from 'react';
import { formatNight } from '../contracts/horizonSimulator';

interface EditorialLandingPageProps {
  onNavigate: (tab: string) => void;
  walletConnected: boolean;
  userAddress: string | null;
  onOpenWalletModal: () => void;
  userNightBalance: bigint;
  blockHeight: number;
}

export const EditorialLandingPage: React.FC<EditorialLandingPageProps> = ({
  onNavigate,
  walletConnected,
  userAddress,
  onOpenWalletModal,
  userNightBalance,
  blockHeight,
}) => {

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#fbfbf9] text-[#191d22] font-sans selection:bg-[#2b333a] selection:text-white">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH SUNRISE BACKGROUND & TOP NAVIGATION */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[720px] sm:min-h-[820px] lg:min-h-[920px] flex flex-col justify-between overflow-hidden">
        {/* Background Image: Mountain Sunrise with Golden Sun & Fog Clouds */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: "url('/hero-sunrise.jpg')",
            backgroundPosition: 'center 35%',
          }}
        >
          {/* Subtle warm overlay to enhance text contrast while preserving colors */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/30" />
        </div>

        {/* Top Navbar Overlay */}
        <header className="relative z-20 w-full">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 py-8 flex items-center justify-between">
            {/* Logo */}
            <div
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs sm:text-sm font-semibold tracking-[0.38em] text-[#191d22] uppercase cursor-pointer hover:opacity-80 transition-opacity"
            >
              H O R I Z O N
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-10 text-xs text-[#2b3238] font-medium tracking-wide">
              <button
                onClick={() => onNavigate('borrower')}
                className="hover:text-black transition-colors"
              >
                Borrow
              </button>
              <button
                onClick={() => onNavigate('lender')}
                className="hover:text-black transition-colors"
              >
                Lend
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-black transition-colors"
              >
                How it works
              </button>
              <button
                onClick={() => onNavigate('explorer')}
                className="hover:text-black transition-colors"
              >
                Explore
              </button>
            </nav>

            {/* Wallet Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenWalletModal}
                className="bg-[#181d22] hover:bg-black text-white text-xs font-medium px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2"
                title={walletConnected ? 'Midnight Lace Wallet Connected' : 'Connect Midnight Lace Wallet'}
              >
                {walletConnected && userAddress ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{`${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`}</span>
                  </>
                ) : (
                  <span>Connect Wallet</span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Hero Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 pt-8 sm:pt-16 pb-16 flex-1 flex flex-col justify-between">
          {/* Main Headline & Right Subtitle Block */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pt-6 sm:pt-10">
            {/* Left Column: Big Editorial Headline */}
            <div className="max-w-xl">
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.4rem] font-normal leading-[1.04] tracking-[-0.015em] text-[#191d22]">
                Credit without<br />
                exposure.
              </h1>
              <p className="mt-7 text-sm sm:text-base text-[#3d454d] max-w-md font-sans leading-relaxed">
                Prove you qualify for a loan without revealing your income, debt, or financial history.
              </p>

              {/* Action Buttons */}
              <div className="mt-9 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={() => onNavigate('borrower')}
                  className="bg-[#181d22] hover:bg-black text-white text-xs sm:text-sm font-medium px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-md group"
                >
                  <span>Borrow privately</span>
                  <span className="text-white/80 group-hover:translate-x-1 transition-transform">→</span>
                </button>

                <button
                  onClick={() => onNavigate('pitch')}
                  className="bg-white/30 hover:bg-white/50 backdrop-blur-md border border-[#2b333a]/25 text-[#181d22] text-xs sm:text-sm font-medium px-6 py-3 rounded-full transition-all"
                >
                  Explore protocol
                </button>
              </div>
            </div>

            {/* Right Column: Editorial Side Tag */}
            <div className="hidden md:flex items-start gap-4 self-start mt-3">
              <div className="w-[1px] h-14 bg-[#2d343b]/40" />
              <div className="text-[10px] font-sans tracking-[0.24em] text-[#424c56] leading-relaxed uppercase">
                <div className="font-semibold">SAME</div>
                <div className="font-semibold">OPPORTUNITIES.</div>
                <div className="mt-2 text-[#5a6570]">MORE</div>
                <div className="text-[#5a6570]">PRIVACY.</div>
              </div>
            </div>
          </div>

          {/* Bottom Hero Metadata Bar */}
          <div className="flex items-center justify-between w-full pt-16 sm:pt-24 border-t border-white/10">
            {/* Built on Midnight */}
            <div className="flex items-center gap-2.5 text-xs text-white/85 font-sans font-medium tracking-wide">
              {/* Midnight Moon Icon */}
              <div className="w-3.5 h-3.5 rounded-full border border-white/85 flex items-center justify-center overflow-hidden">
                <div className="w-1/2 h-full bg-white/85" />
              </div>
              <span>Built on Midnight</span>
            </div>

            {/* Vision Tag */}
            <div className="text-[10px] sm:text-[11px] font-sans tracking-[0.28em] text-white/85 uppercase font-medium">
              A MORE OPEN FINANCIAL FUTURE
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE PROBLEM SECTION */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#fbfbf9] py-24 sm:py-32 border-t border-[#eeeee9]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: The Problem Intro */}
            <div className="lg:col-span-4">
              <div className="text-[10px] sm:text-[11px] font-sans tracking-[0.25em] text-[#7d868f] uppercase font-semibold">
                THE PROBLEM
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] text-[#181d22] font-normal leading-[1.12] mt-4">
                On-chain credit<br />
                has always had<br />
                a choice.
              </h2>
              <p className="mt-6 text-xs sm:text-sm text-[#5a646e] leading-relaxed max-w-xs">
                You either overcollateralize, or you reveal everything. Both leave people behind.
              </p>
            </div>

            {/* Center Column: Two Visual Cards (Cube & Document Stack) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Overcollateralize */}
              <div className="bg-[#f5f4ef] rounded-2xl p-6 border border-[#e8e7e1] flex flex-col items-center text-center transition-all hover:border-[#d8d7d0] hover:shadow-sm">
                <div className="w-32 h-32 flex items-center justify-center my-2">
                  <img
                    src="/problem-cube.jpg"
                    alt="Overcollateralize cube"
                    className="w-28 h-28 object-contain drop-shadow-sm rounded-lg"
                  />
                </div>
                <h3 className="font-serif text-base font-medium text-[#181d22] mt-3">
                  Overcollateralize.
                </h3>
                <p className="text-xs text-[#717b85] mt-1 font-sans">
                  Lock more than you borrow.
                </p>
              </div>

              {/* Card 2: Reveal everything */}
              <div className="bg-[#f5f4ef] rounded-2xl p-6 border border-[#e8e7e1] flex flex-col items-center text-center transition-all hover:border-[#d8d7d0] hover:shadow-sm">
                <div className="w-32 h-32 flex items-center justify-center my-2">
                  <img
                    src="/problem-documents.jpg"
                    alt="Reveal everything documents"
                    className="w-28 h-28 object-contain drop-shadow-sm rounded-lg"
                  />
                </div>
                <h3 className="font-serif text-base font-medium text-[#181d22] mt-3">
                  Reveal everything.
                </h3>
                <p className="text-xs text-[#717b85] mt-1 font-sans">
                  Expose your financial identity.
                </p>
              </div>
            </div>

            {/* Right Column: Horizon's Way */}
            <div className="lg:col-span-3 lg:pl-6 border-l border-transparent lg:border-[#eaeae4]">
              <div className="text-[10px] font-sans tracking-[0.22em] text-[#7d868f] uppercase font-semibold leading-relaxed">
                HORIZON INTRODUCES<br />ANOTHER WAY.
              </div>
              <h3 className="font-serif text-3xl sm:text-4xl text-[#181d22] font-normal leading-[1.18] mt-4">
                Prove it.<br />
                Don't reveal it.
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW HORIZON WORKS (DEEP MIDNIGHT SLATE SECTION) */}
      {/* ========================================================================= */}
      <section
        id="how-it-works"
        className="w-full bg-[#0e141a] py-24 sm:py-32 text-white relative overflow-hidden"
      >
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-16">
            <div>
              <div className="text-[10px] sm:text-[11px] font-sans tracking-[0.25em] text-[#768390] uppercase font-semibold">
                HOW HORIZON WORKS
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-normal leading-[1.15] text-white mt-3">
                Three steps.<br />
                Your data stays yours.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8c98a5] max-w-sm leading-relaxed font-sans">
              Horizon uses zero-knowledge proofs to verify your financial eligibility without revealing your underlying information.
            </p>
          </div>

          {/* 3-Step Progression Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 pt-6">
            {/* Step 01 */}
            <div className="flex flex-col">
              <div className="font-serif text-3xl sm:text-4xl text-white/90 font-light">
                01
              </div>
              <div className="w-full h-[1px] bg-white/15 my-5" />
              <h3 className="font-serif text-xl text-white font-normal">
                Prepare
              </h3>
              <p className="text-xs text-[#8c98a5] leading-relaxed mt-2">
                Your financial information stays on your device.
              </p>
              <div className="mt-12 text-[11px] font-sans text-[#5c6875] tracking-wider">
                Income · Debt · Collateral · Credit
              </div>
            </div>

            {/* Step 02 */}
            <div className="flex flex-col">
              <div className="font-serif text-3xl sm:text-4xl text-white/90 font-light">
                02
              </div>
              <div className="w-full h-[1px] bg-white/15 my-5" />
              <h3 className="font-serif text-xl text-white font-normal">
                Prove
              </h3>
              <p className="text-xs text-[#8c98a5] leading-relaxed mt-2">
                We generate a private proof against the lender's requirements.
              </p>
              <div className="mt-5 space-y-1 text-xs text-[#b8c2cc] font-mono">
                <div>Income ≥ minimum</div>
                <div>DTI ≤ maximum</div>
                <div>Collateral ≥ minimum</div>
              </div>
            </div>

            {/* Step 03 */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="font-serif text-3xl sm:text-4xl text-white/90 font-light">
                  03
                </div>
                <div className="w-full h-[1px] bg-white/15 my-5" />
                <h3 className="font-serif text-xl text-white font-normal">
                  Borrow
                </h3>
                <p className="text-xs text-[#8c98a5] leading-relaxed mt-2">
                  The lender receives one thing: proof that you qualify.
                </p>
              </div>

              {/* Qualified Badge */}
              <div className="mt-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/40 bg-[#12251f]/70 text-emerald-400 text-[11px] font-sans font-semibold tracking-widest uppercase">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>QUALIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WHAT THE LENDER SEES */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#fbfbf9] py-24 sm:py-32 border-t border-[#eeeee9]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Heading & Explanation */}
            <div className="lg:col-span-4">
              <div className="text-[10px] sm:text-[11px] font-sans tracking-[0.25em] text-[#7d868f] uppercase font-semibold">
                WHAT THE LENDER SEES
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] text-[#181d22] font-normal leading-[1.12] mt-3">
                The decision.<br />
                Not the data.
              </h2>
              <p className="mt-5 text-xs sm:text-sm text-[#5a646e] leading-relaxed max-w-xs font-sans">
                Lenders set their own risk criteria and receive a cryptographic yes or no. Your numbers never leave your device.
              </p>

              <button
                onClick={() => onNavigate('pitch')}
                className="mt-8 inline-flex items-center gap-1.5 text-xs font-medium text-[#181d22] hover:text-black transition-colors group"
              >
                <span>See how it works</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            {/* Center Column: Dual Cards (Private vs Public) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: PRIVATE */}
              <div className="bg-[#f3f2ee] rounded-2xl p-6 border border-[#e6e5df] flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold tracking-[0.2em] text-[#707982] uppercase mb-6">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>PRIVATE</span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#5a646e]">Annual income</span>
                      <div className="flex gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#5a646e]">Existing debt</span>
                      <div className="flex gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#5a646e]">Debt-to-income</span>
                      <div className="flex gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#5a646e]">Credit score</span>
                      <div className="flex gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#cfcec8]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: PUBLIC */}
              <div className="bg-white rounded-2xl p-6 border border-[#e6e5df] shadow-sm flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold tracking-[0.2em] text-[#707982] uppercase mb-2">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>PUBLIC</span>
                  </div>

                  {/* Qualified Circle Badge */}
                  <div className="flex flex-col items-center justify-center my-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#181d22] uppercase">
                      QUALIFIED
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6e7883]">Loan amount</span>
                      <span className="font-medium text-[#181d22]">5,000 NIGHT</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6e7883]">Interest rate</span>
                      <span className="font-medium text-[#181d22]">8.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6e7883]">Term</span>
                      <span className="font-medium text-[#181d22]">90 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6e7883]">Status</span>
                      <span className="font-medium text-emerald-700">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6e7883]">Collateral</span>
                      <span className="font-medium text-[#181d22]">7,500 NIGHT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Quote */}
            <div className="lg:col-span-3 lg:pl-6">
              <blockquote className="font-serif italic text-2xl sm:text-3xl text-[#3d454e] leading-snug">
                “Privacy is a foundation for a more inclusive financial system.”
              </blockquote>
              <div className="w-8 h-[1px] bg-[#9ca3af] my-6" />
              <div className="text-[10px] font-sans tracking-[0.22em] text-[#8c96a0] uppercase font-semibold leading-relaxed">
                REAL PEOPLE.<br />REAL OPPORTUNITY.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. A BRIGHTER FINANCIAL FUTURE (COASTAL SUNSET BANNER) */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#fbfbf9] pb-24 sm:pb-32 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden bg-[#090e14] shadow-2xl relative min-h-[360px] sm:min-h-[400px] flex flex-col md:flex-row items-stretch">
          {/* Left Half: Coastal Ocean Sunset image */}
          <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
            <img
              src="/coastal-banner.jpg"
              alt="Coastal sunset cliffs"
              className="w-full h-full object-cover object-left"
            />
            {/* Smooth gradient fade to right into dark slate */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#090e14]/40 to-[#090e14]" />
          </div>

          {/* Right Half: Text & CTA Button */}
          <div className="w-full md:w-1/2 p-8 sm:p-14 lg:p-16 flex flex-col justify-center items-start text-left relative z-10">
            <div className="text-[10px] font-sans tracking-[0.25em] text-[#8c98a5] uppercase font-semibold">
              A BRIGHTER FINANCIAL FUTURE
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] text-white font-normal leading-tight mt-3">
              Your finances are yours.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#8c98a5] font-sans mb-8">
              Horizon lets you prove what matters.
            </p>

            <button
              onClick={() => onNavigate('borrower')}
              className="bg-white hover:bg-[#f1f2f4] text-[#0e141a] text-xs sm:text-sm font-medium px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-md group active:scale-95"
            >
              <span>Enter Horizon</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CLEAN FOOTER */}
      {/* ========================================================================= */}
      <footer className="w-full bg-[#fbfbf9] border-t border-[#eaeae5] py-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#5a646e]">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-[0.3em] text-[#181d22] uppercase">
              H O R I Z O N
            </span>
            <span className="text-[#c4c3bb]">|</span>
            <span className="text-[#7d8792]">Private Credit Protocol</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs text-[#5a646e]">
            <button onClick={() => onNavigate('contract')} className="hover:text-black transition-colors">
              Docs
            </button>
            <button onClick={() => onNavigate('contract')} className="hover:text-black transition-colors">
              GitHub
            </button>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">
              Twitter
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">
              Discord
            </a>
          </div>

          {/* Midnight Badge */}
          <div className="flex items-center gap-2 text-xs text-[#5a646e]">
            <span>Built on Midnight</span>
            <div className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center overflow-hidden">
              <div className="w-1/2 h-full bg-current" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
