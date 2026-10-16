import React from 'react';
import { Currency, QuotationDisplayMode } from '../types/currency';
import { formatAmount, getMasRateString, getStandardQuoteString } from '../services/exchangeRateService';
import { Star, TrendingUp, TrendingDown, ArrowRight, Info } from 'lucide-react';

interface CurrencyCardProps {
  currency: Currency;
  isFavorite: boolean;
  onToggleFavorite: (code: string) => void;
  onSelectForCalculation: (code: string) => void;
  onOpenDetails: (currency: Currency) => void;
  quotationMode: QuotationDisplayMode;
}

export const CurrencyCard: React.FC<CurrencyCardProps> = ({
  currency,
  isFavorite,
  onToggleFavorite,
  onSelectForCalculation,
  onOpenDetails,
  quotationMode,
}) => {
  const isPositive = currency.change24h >= 0;
  const inverseRate = 1 / currency.ratePerSGD;

  return (
    <div className="group relative bg-white border border-slate-200/90 rounded-xl p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm">
      {/* Top row: Flag, code, name, and favorite button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-2xl select-none leading-none shrink-0" role="img" aria-label={currency.country}>
            {currency.flag}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-base font-mono">
                {currency.code}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {currency.symbol}
              </span>
            </div>
            <p className="text-xs text-slate-600 truncate max-w-[150px] sm:max-w-[180px]">
              {currency.name}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(currency.code);
          }}
          aria-label={isFavorite ? `Remove ${currency.code} from favorites` : `Add ${currency.code} to favorites`}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
        >
          <Star
            className={`w-4 h-4 transition-transform duration-150 group-hover:scale-105 ${
              isFavorite ? 'fill-amber-400 text-amber-500' : ''
            }`}
          />
        </button>
      </div>

      {/* Center row: Main Exchange Rate Display */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <div className="text-xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {quotationMode === 'mas' && currency.masUnit === 100 ? (
                <span>S${formatAmount(100 / currency.ratePerSGD, 4)}</span>
              ) : (
                <span>{formatAmount(currency.ratePerSGD, currency.ratePerSGD >= 100 ? 2 : 4)}</span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">
              {quotationMode === 'mas' && currency.masUnit === 100 ? (
                <span>per 100 {currency.code} (MAS standard)</span>
              ) : (
                <span>{currency.code} per 1 SGD</span>
              )}
            </div>
          </div>

          {/* 24h Change percentage */}
          <div className="text-right">
            <div
              className={`flex items-center justify-end gap-1 text-xs font-semibold font-mono tabular-nums ${
                isPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{isPositive ? `+${currency.change24h}%` : `${currency.change24h}%`}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
              1 {currency.code} = S${formatAmount(inverseRate, 4)}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom actions: Quick convert & Details */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          onClick={() => onOpenDetails(currency)}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors py-1 cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Rates info</span>
        </button>

        <button
          onClick={() => onSelectForCalculation(currency.code)}
          className="flex items-center gap-1 font-semibold text-slate-900 hover:text-slate-700 transition-colors py-1 cursor-pointer"
        >
          <span>Calculate</span>
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
