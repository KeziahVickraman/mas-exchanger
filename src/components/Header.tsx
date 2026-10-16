import React from 'react';
import { ViewMode } from '../types/currency';
import { RefreshCw, Calculator, ArrowRightLeft, FileSpreadsheet, KeyRound, MessageSquare } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenMasModal: () => void;
  onRefreshRates: () => void;
  isRefreshing: boolean;
  lastUpdated: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenMasModal,
  onRefreshRates,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onViewChange('rates')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
                  S$
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  SingaRate
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onViewChange('rates')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                currentView === 'rates'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Exchange Rates</span>
            </button>

            <button
              onClick={() => onViewChange('calculator')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                currentView === 'calculator'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Calculator</span>
            </button>

            <button
              onClick={() => onViewChange('multi')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                currentView === 'multi'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Multi-Currency</span>
            </button>

            <button
              onClick={() => onViewChange('cheatsheet')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                currentView === 'cheatsheet'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Travel Sheet</span>
            </button>

            <button
              onClick={() => onViewChange('talk-to-us')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                currentView === 'talk-to-us'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Talk to Us</span>
            </button>

            <button
              onClick={onOpenMasModal}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
            >
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>MAS API</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRefreshRates}
              disabled={isRefreshing}
              title="Refresh latest exchange rates"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-lg transition-colors whitespace-nowrap disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Rates</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs overflow-x-auto">
          <button
            onClick={() => onViewChange('rates')}
            className={`py-1 px-2 font-medium whitespace-nowrap ${
              currentView === 'rates' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : 'text-slate-600'
            }`}
          >
            Rates
          </button>
          <button
            onClick={() => onViewChange('calculator')}
            className={`py-1 px-2 font-medium whitespace-nowrap ${
              currentView === 'calculator' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : 'text-slate-600'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => onViewChange('multi')}
            className={`py-1 px-2 font-medium whitespace-nowrap ${
              currentView === 'multi' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : 'text-slate-600'
            }`}
          >
            Multi
          </button>
          <button
            onClick={() => onViewChange('cheatsheet')}
            className={`py-1 px-2 font-medium whitespace-nowrap ${
              currentView === 'cheatsheet' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : 'text-slate-600'
            }`}
          >
            Travel
          </button>
          <button
            onClick={() => onViewChange('talk-to-us')}
            className={`py-1 px-2 font-medium whitespace-nowrap ${
              currentView === 'talk-to-us' ? 'text-blue-900 font-semibold border-b-2 border-blue-900' : 'text-blue-600'
            }`}
          >
            Talk to Us
          </button>
          <button
            onClick={onOpenMasModal}
            className="py-1 px-2 font-medium text-emerald-700 whitespace-nowrap"
          >
            MAS API
          </button>
        </div>
      </div>
    </header>
  );
};
