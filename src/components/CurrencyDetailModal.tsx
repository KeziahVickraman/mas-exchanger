import React from 'react';
import { Currency } from '../types/currency';
import { formatAmount, getMasRateString } from '../services/exchangeRateService';
import { X, ArrowRight, ShieldCheck, MapPin, Calculator, TrendingUp, TrendingDown } from 'lucide-react';

interface CurrencyDetailModalProps {
  currency: Currency | null;
  onClose: () => void;
  onOpenCalculator: (code: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (code: string) => void;
}

export const CurrencyDetailModal: React.FC<CurrencyDetailModalProps> = ({
  currency,
  onClose,
  onOpenCalculator,
  isFavorite,
  onToggleFavorite,
}) => {
  if (!currency) return null;

  const inverseRate = 1 / currency.ratePerSGD;
  const isPositive = currency.change24h >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl z-10 space-y-5 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl select-none" role="img" aria-label={currency.country}>
              {currency.flag}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                  {currency.code}
                </h3>
                <span className="text-xs font-mono text-slate-500 font-medium">
                  {currency.symbol}
                </span>
                {isFavorite && (
                  <span className="text-[11px] text-amber-700 font-medium">
                    ★ Pinned
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {currency.name} · {currency.country}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rate metrics grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="text-[11px] text-slate-500 font-medium">1 Singapore Dollar buys</div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
              {formatAmount(currency.ratePerSGD, currency.ratePerSGD > 100 ? 2 : 4)} {currency.code}
            </div>
            <div
              className={`flex items-center gap-1 text-[11px] font-mono font-medium mt-1 ${
                isPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{isPositive ? `+${currency.change24h}%` : `${currency.change24h}%`} (24h)</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="text-[11px] text-slate-500 font-medium">Inverse (1 {currency.code})</div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
              S${formatAmount(inverseRate, 4)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">
              SGD per foreign unit
            </div>
          </div>
        </div>

        {/* MAS Market Standard Quote */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-600 font-medium">
            <span>MAS Benchmark Standard:</span>
            <span className="font-mono font-bold text-slate-900">
              {getMasRateString(currency)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono">
            <span>24h Range:</span>
            <span>
              Low: {formatAmount(currency.low24h, 3)} — High: {formatAmount(currency.high24h, 3)}
            </span>
          </div>

          {currency.masUnit === 100 && (
            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 leading-relaxed">
              Note: The Monetary Authority of Singapore (MAS) officially quotes this currency per 100 foreign units in its exchange rate statistical tables.
            </p>
          )}
        </div>

        {/* Singapore Travel / Market Context */}
        {currency.travelNote && (
          <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>Singapore Travellers & Market Insights</span>
            </div>
            <p className="text-slate-700 leading-relaxed pl-5">
              {currency.travelNote}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={() => onToggleFavorite(currency.code)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {isFavorite ? '★ Remove from Watchlist' : '☆ Add to Watchlist'}
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenCalculator(currency.code);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Open in Calculator</span>
          </button>
        </div>
      </div>
    </div>
  );
};
