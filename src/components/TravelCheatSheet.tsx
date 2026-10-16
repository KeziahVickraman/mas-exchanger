import React, { useState } from 'react';
import { Currency } from '../types/currency';
import { formatAmount } from '../services/exchangeRateService';
import { SPREAD_PROFILES } from '../data/currencies';
import { Printer, Compass } from 'lucide-react';

interface TravelCheatSheetProps {
  currencies: Currency[];
  initialCurrencyCode?: string;
  favorites: string[];
}

export const TravelCheatSheet: React.FC<TravelCheatSheetProps> = ({
  currencies,
  initialCurrencyCode = 'MYR',
  favorites,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>(initialCurrencyCode);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('arcade');

  const selectedCurrency = currencies.find((c) => c.code === selectedCode) || currencies[0];
  const selectedProfile = SPREAD_PROFILES.find((p) => p.id === selectedProfileId) || SPREAD_PROFILES[2];

  // Effective rate after spread
  const effectiveRate = selectedCurrency.ratePerSGD * (1 - selectedProfile.feePercent / 100);
  const effectiveInverse = 1 / (selectedCurrency.ratePerSGD * (1 + selectedProfile.feePercent / 100));

  const sgdDenominations = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

  // Tailored foreign denominations based on currency value
  const getForeignDenominations = (cur: Currency) => {
    if (cur.ratePerSGD > 5000) {
      // e.g. IDR, VND
      return [10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000];
    }
    if (cur.ratePerSGD > 50) {
      // e.g. JPY, KRW, THB, INR
      return [100, 300, 500, 1000, 2000, 5000, 10000, 20000, 50000];
    }
    if (cur.ratePerSGD > 5) {
      // e.g. MYR, CNY, HKD, TWD
      return [10, 20, 50, 100, 200, 500, 1000, 2000];
    }
    // e.g. USD, EUR, GBP, AUD
    return [1, 5, 10, 20, 50, 100, 200, 500];
  };

  const foreignDenoms = getForeignDenominations(selectedCurrency);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-slate-800" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Travel Currency Cheat Sheet
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Wallet-ready conversion table for overseas trips, markets, and dining abroad.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Target Selector & Spread Config */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-2">
            Select Destination Currency:
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {favorites.map((code) => {
              const c = currencies.find((item) => item.code === code);
              if (!c) return null;
              const isSelected = c.code === selectedCode;
              return (
                <button
                  key={code}
                  onClick={() => setSelectedCode(code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.code}</span>
                  <span className="text-[10px] font-normal opacity-80 truncate max-w-[80px]">
                    {c.country}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Rate Profile:</span>
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-slate-400"
            >
              {SPREAD_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="font-mono text-slate-600">
            Effective: 1 SGD ≈ {formatAmount(effectiveRate, 4)} {selectedCurrency.code}
          </div>
        </div>
      </div>

      {/* Side-by-Side Wallet Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
        {/* SGD to Foreign */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇸🇬</span>
              <span className="font-bold text-slate-900 text-sm">Singapore (SGD)</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">→ {selectedCurrency.code}</span>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {sgdDenominations.map((val) => {
              const converted = val * effectiveRate;
              return (
                <div key={val} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-900">
                    S${val.toLocaleString()}
                  </span>
                  <span className="font-mono font-semibold text-slate-700 tabular-nums">
                    {selectedCurrency.symbol} {formatAmount(converted, converted >= 1000 ? 0 : 2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Foreign to SGD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedCurrency.flag}</span>
              <span className="font-bold text-slate-900 text-sm">
                {selectedCurrency.name} ({selectedCurrency.code})
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">→ SGD</span>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {foreignDenoms.map((val) => {
              const inSGD = val * effectiveInverse;
              return (
                <div key={val} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-900">
                    {selectedCurrency.symbol} {val.toLocaleString()}
                  </span>
                  <span className="font-mono font-semibold text-slate-700 tabular-nums">
                    S${formatAmount(inSGD, inSGD < 10 ? 2 : 2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
