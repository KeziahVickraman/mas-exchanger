import React, { useState } from 'react';
import { Currency } from '../types/currency';
import { formatAmount, convertCurrency, getMasRateString } from '../services/exchangeRateService';
import { SPREAD_PROFILES } from '../data/currencies';
import { ArrowUpDown, Copy, Check, Info, ShieldCheck, ChevronDown } from 'lucide-react';

interface CalculatorProps {
  currencies: Currency[];
  initialCurrencyCode?: string;
  favorites: string[];
  onSelectCurrency?: (code: string) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  currencies,
  initialCurrencyCode = 'MYR',
  favorites,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>(initialCurrencyCode);
  const [amount, setAmount] = useState<string>('100');
  const [direction, setDirection] = useState<'sgd-to-foreign' | 'foreign-to-sgd'>('sgd-to-foreign');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('interbank');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const selectedCurrency = currencies.find((c) => c.code === selectedCode) || currencies[0];
  const selectedProfile = SPREAD_PROFILES.find((p) => p.id === selectedProfileId) || SPREAD_PROFILES[0];

  const numericAmount = parseFloat(amount) || 0;
  const convertedAmount = convertCurrency(
    numericAmount,
    selectedCurrency,
    direction,
    selectedProfile.feePercent
  );

  const handleSwap = () => {
    setDirection((prev) => (prev === 'sgd-to-foreign' ? 'foreign-to-sgd' : 'sgd-to-foreign'));
  };

  const handleCopy = () => {
    const textToCopy = `${formatAmount(convertedAmount, 2)} ${
      direction === 'sgd-to-foreign' ? selectedCurrency.code : 'SGD'
    }`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const quickAmounts = [10, 50, 100, 500, 1000, 5000];

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.country.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title block */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          SGD Currency Calculator
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Real-time Singapore Dollar conversions with travel fee profiles and interbank benchmarks.
        </p>
      </div>

      {/* Main Calculator Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        {/* Quick favorite currency chips */}
        <div className="mb-6">
          <div className="text-xs font-medium text-slate-500 mb-2">
            Quick Select (Your Favorites):
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {favorites.map((favCode) => {
              const cur = currencies.find((c) => c.code === favCode);
              if (!cur) return null;
              const isActive = cur.code === selectedCode;
              return (
                <button
                  key={favCode}
                  onClick={() => setSelectedCode(favCode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{cur.flag}</span>
                  <span>{cur.code}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input / Output Row */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Source Input */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span>You Send / Convert</span>
              <span className="font-mono">
                {direction === 'sgd-to-foreign' ? 'Singapore (SGD)' : selectedCurrency.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-2xl font-bold text-slate-900 font-mono tabular-nums focus:outline-none placeholder-slate-400"
              />

              <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 font-mono shadow-xs">
                {direction === 'sgd-to-foreign' ? (
                  <>
                    <span className="text-base select-none">🇸🇬</span>
                    <span>SGD</span>
                  </>
                ) : (
                  <>
                    <span className="text-base select-none">{selectedCurrency.flag}</span>
                    <span>{selectedCurrency.code}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              aria-label="Swap conversion direction"
              className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-transform active:scale-95 cursor-pointer border border-slate-200"
            >
              <ArrowUpDown className="w-5 h-5" />
            </button>
          </div>

          {/* Target Output */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 relative">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span>You Receive</span>
              <span className="font-mono">
                {direction === 'sgd-to-foreign' ? selectedCurrency.name : 'Singapore (SGD)'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="w-full text-2xl font-bold text-slate-900 font-mono tabular-nums truncate">
                {formatAmount(convertedAmount, convertedAmount >= 1000 ? 2 : 4)}
              </div>

              {/* Currency Selector Dropdown Trigger */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-sm font-semibold text-slate-900 font-mono shadow-xs cursor-pointer transition-colors"
                >
                  {direction === 'sgd-to-foreign' ? (
                    <>
                      <span className="text-base select-none">{selectedCurrency.flag}</span>
                      <span>{selectedCurrency.code}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base select-none">🇸🇬</span>
                      <span>SGD</span>
                    </>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden">
                      <div className="p-2 border-b border-slate-100">
                        <input
                          type="text"
                          placeholder="Search currency..."
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 font-mono"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto p-1 divide-y divide-slate-50">
                        {filteredCurrencies.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => {
                              setSelectedCode(c.code);
                              setIsDropdownOpen(false);
                              setSearchFilter('');
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition-colors cursor-pointer ${
                              c.code === selectedCode
                                ? 'bg-slate-100 font-semibold text-slate-900'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{c.flag}</span>
                              <span className="font-mono font-bold">{c.code}</span>
                              <span className="text-slate-500 truncate max-w-[100px]">{c.name}</span>
                            </div>
                            <span className="font-mono text-slate-500 text-[10px]">
                              {formatAmount(c.ratePerSGD, c.ratePerSGD > 100 ? 1 : 3)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium mr-1">Presets:</span>
            {quickAmounts.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md border transition-colors cursor-pointer ${
                  amount === preset.toString()
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ${preset.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Travel & Exchange Spread Profile Selector */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Exchange Rate Spread / Fee Simulator:</span>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Fee: {selectedProfile.feePercent}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {SPREAD_PROFILES.map((profile) => {
              const isSelected = profile.id === selectedProfileId;
              return (
                <button
                  key={profile.id}
                  onClick={() => setSelectedProfileId(profile.id)}
                  className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-slate-900 shadow-xs'
                      : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {profile.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {profile.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Benchmark & Copy Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5 text-slate-600">
            <div className="font-mono">
              Interbank Benchmark: 1 SGD = {formatAmount(selectedCurrency.ratePerSGD, 4)} {selectedCurrency.code}
            </div>
            <div className="text-slate-500 font-mono">
              MAS Convention: {getMasRateString(selectedCurrency)}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Result' : 'Copy Converted Amount'}</span>
          </button>
        </div>
      </div>

      {/* Currency Travel Tip */}
      {selectedCurrency.travelNote && (
        <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-3 text-xs">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 font-mono mr-1">
              {selectedCurrency.code} Singapore Market Note:
            </span>
            <span className="text-slate-600">{selectedCurrency.travelNote}</span>
          </div>
        </div>
      )}
    </div>
  );
};
