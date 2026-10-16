import React, { useState } from 'react';
import { Currency } from '../types/currency';
import { formatAmount } from '../services/exchangeRateService';
import { Star, ArrowRight, Copy, Check } from 'lucide-react';

interface MultiCurrencyConverterProps {
  currencies: Currency[];
  favorites: string[];
  onToggleFavorite: (code: string) => void;
  onSelectForCalculation: (code: string) => void;
}

export const MultiCurrencyConverter: React.FC<MultiCurrencyConverterProps> = ({
  currencies,
  favorites,
  onToggleFavorite,
  onSelectForCalculation,
}) => {
  const [sgdAmount, setSgdAmount] = useState<string>('100');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const numSgd = parseFloat(sgdAmount) || 0;

  // Currencies sorted by favorites first, then popularity
  const sortedCurrencies = [...currencies].sort((a, b) => {
    const aFav = favorites.includes(a.code);
    const bFav = favorites.includes(b.code);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return a.popularRank - b.popularRank;
  });

  const handleCopy = (code: string, amountStr: string) => {
    navigator.clipboard?.writeText(`${amountStr} ${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Multi-Currency Quick Comparison
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            See how much your SGD converts to across global currencies at interbank benchmark rates.
          </p>
        </div>

        {/* Input for SGD */}
        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-4 py-2 shadow-xs shrink-0">
          <span className="text-xs font-bold text-slate-500 font-mono">SGD (S$):</span>
          <input
            type="number"
            min="0"
            step="any"
            value={sgdAmount}
            onChange={(e) => setSgdAmount(e.target.value)}
            className="w-28 text-lg font-bold text-slate-900 font-mono tabular-nums focus:outline-none"
            placeholder="100"
          />
        </div>
      </div>

      {/* Preset Amount buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 font-medium mr-1">Quick Amounts:</span>
        {[50, 100, 200, 500, 1000, 2500, 5000].map((val) => (
          <button
            key={val}
            onClick={() => setSgdAmount(val.toString())}
            className={`px-3 py-1 text-xs font-mono font-medium rounded-md border transition-colors cursor-pointer ${
              sgdAmount === val.toString()
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            S${val.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Table view */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">Fav</th>
                <th className="py-3 px-4">Currency</th>
                <th className="py-3 px-4 text-right">Interbank Rate</th>
                <th className="py-3 px-4 text-right">
                  Equivalent to S${formatAmount(numSgd, 0)}
                </th>
                <th className="py-3 px-4 text-right">Inverse (1 Foreign)</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {sortedCurrencies.map((c) => {
                const isFav = favorites.includes(c.code);
                const converted = numSgd * c.ratePerSGD;
                const convertedStr = formatAmount(converted, converted >= 1000 ? 2 : 4);
                const inverse = 1 / c.ratePerSGD;

                return (
                  <tr
                    key={c.code}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isFav ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onToggleFavorite(c.code)}
                        className="text-slate-400 hover:text-amber-500 cursor-pointer"
                        aria-label="Toggle favorite"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isFav ? 'fill-amber-400 text-amber-500' : ''
                          }`}
                        />
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl select-none leading-none">{c.flag}</span>
                        <div>
                          <div className="font-bold text-slate-900 font-mono text-xs">
                            {c.code}
                          </div>
                          <div className="text-slate-500 text-xs truncate max-w-[140px] sm:max-w-[200px]">
                            {c.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-700 tabular-nums">
                      {formatAmount(c.ratePerSGD, c.ratePerSGD > 100 ? 2 : 4)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                          {c.symbol} {convertedStr}
                        </span>
                        <button
                          onClick={() => handleCopy(c.code, convertedStr)}
                          title="Copy amount"
                          className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded"
                        >
                          {copiedCode === c.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-500 tabular-nums">
                      S${formatAmount(inverse, 4)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectForCalculation(c.code)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-slate-700 cursor-pointer"
                      >
                        <span>Calculate</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
