import React, { useState, useEffect, useMemo } from 'react';
import { Currency, ViewMode, QuotationDisplayMode, MasApiConfig, Region } from './types/currency';
import { REGIONS, DEFAULT_FAVORITES } from './data/currencies';
import {
  fetchExchangeRates,
  getSavedFavorites,
  saveFavorites,
  getMasConfig,
  saveMasConfig,
  formatAmount,
} from './services/exchangeRateService';
import { Header } from './components/Header';
import { CurrencyCard } from './components/CurrencyCard';
import { Calculator } from './components/Calculator';
import { MultiCurrencyConverter } from './components/MultiCurrencyConverter';
import { TravelCheatSheet } from './components/TravelCheatSheet';
import { CurrencyDetailModal } from './components/CurrencyDetailModal';
import { MasApiModal } from './components/MasApiModal';
import { TalkToUs } from './components/TalkToUs';
import {
  Search,
  Star,
  SlidersHorizontal,
  ArrowUpDown,
  Building2,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('rates');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<Region>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'code' | 'gainers' | 'losers'>('popular');
  const [quotationMode, setQuotationMode] = useState<QuotationDisplayMode>('unit');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('live-api');
  const [masConfig, setMasConfig] = useState<MasApiConfig>(getMasConfig());
  const [isMasModalOpen, setIsMasModalOpen] = useState<boolean>(false);
  const [selectedCurrencyForModal, setSelectedCurrencyForModal] = useState<Currency | null>(null);
  const [calculatorTargetCode, setCalculatorTargetCode] = useState<string>('MYR');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  // Initialize favorites from storage
  useEffect(() => {
    const saved = getSavedFavorites();
    setFavorites(saved);
  }, []);

  // Fetch exchange rates on load
  const loadRates = async (config?: MasApiConfig) => {
    setIsRefreshing(true);
    try {
      const response = await fetchExchangeRates(config);
      setCurrencies(response.currencies);
      setLastUpdated(response.lastUpdated);
      setDataSource(response.source);
    } catch (e) {
      console.error('Failed to load rates:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadRates(masConfig);
  }, []);

  const handleToggleFavorite = (code: string) => {
    setFavorites((prev) => {
      let updated: string[];
      if (prev.includes(code)) {
        updated = prev.filter((item) => item !== code);
      } else {
        updated = [...prev, code];
      }
      saveFavorites(updated);
      return updated;
    });
  };

  const handleOpenCalculatorWithCurrency = (code: string) => {
    setCalculatorTargetCode(code);
    setCurrentView('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered and sorted currencies
  const filteredCurrencies = useMemo(() => {
    return currencies
      .filter((c) => {
        // Search filter
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !query ||
          c.code.toLowerCase().includes(query) ||
          c.name.toLowerCase().includes(query) ||
          c.country.toLowerCase().includes(query);

        // Region filter
        const matchesRegion = selectedRegion === 'all' || c.region === selectedRegion;

        // Favorites only toggle
        const matchesFav = !showOnlyFavorites || favorites.includes(c.code);

        return matchesQuery && matchesRegion && matchesFav;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return a.popularRank - b.popularRank;
        if (sortBy === 'code') return a.code.localeCompare(b.code);
        if (sortBy === 'gainers') return b.change24h - a.change24h;
        if (sortBy === 'losers') return a.change24h - b.change24h;
        return 0;
      });
  }, [currencies, searchQuery, selectedRegion, sortBy, showOnlyFavorites, favorites]);

  // Pinned favorites list
  const favoriteCurrencies = useMemo(() => {
    return currencies.filter((c) => favorites.includes(c.code));
  }, [currencies, favorites]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Top Bar Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenMasModal={() => setIsMasModalOpen(true)}
        onRefreshRates={() => loadRates(masConfig)}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Sub-Header Singapore Context Bar */}
        <section className="mb-8">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                  <span>Base Currency: Singapore Dollar (SGD / S$)</span>
                  <span aria-hidden="true">·</span>
                  <span>Singapore Market Hours</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Singapore Exchange Rates & Currency Converter
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                  Real-time SGD exchange rates against global currencies, aligned with Monetary Authority of Singapore (MAS) quotation standards.
                </p>
              </div>

              {/* Status & quotation switches */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                {/* Data source label */}
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/70 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{lastUpdated || '16:00 SGT (MAS Reference)'}</span>
                </div>

                {/* Quotation format toggle */}
                <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/70">
                  <button
                    onClick={() => setQuotationMode('unit')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      quotationMode === 'unit'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    1 SGD = X
                  </button>
                  <button
                    onClick={() => setQuotationMode('mas')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      quotationMode === 'mas'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    MAS Format (per 100)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* View Routing */}
        {currentView === 'rates' && (
          <div className="space-y-8">
            {/* Search, Region Filter & Sort Controls */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by code (e.g. MYR, USD), country or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 transition-colors shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Right controls: Sort & Favorites Filter */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                      showOnlyFavorites
                        ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        showOnlyFavorites ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
                      }`}
                    />
                    <span>Starred Only ({favorites.length})</span>
                  </button>

                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
                    <span className="text-xs text-slate-400 font-medium">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="text-xs font-medium text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="popular">Popular in SG</option>
                      <option value="code">Currency (A-Z)</option>
                      <option value="gainers">Top 24h Gainers</option>
                      <option value="losers">Top 24h Losers</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Region Filter Segmented Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {REGIONS.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                      selectedRegion === region.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {region.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pinned / Favorites Watchlist (if not searching or filtering by favorites only) */}
            {!searchQuery && selectedRegion === 'all' && !showOnlyFavorites && favoriteCurrencies.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                      Singapore Watchlist & Favorites
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">
                    {favoriteCurrencies.length} currencies pinned
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {favoriteCurrencies.map((currency) => (
                    <CurrencyCard
                      key={currency.code}
                      currency={currency}
                      isFavorite={true}
                      onToggleFavorite={handleToggleFavorite}
                      onSelectForCalculation={handleOpenCalculatorWithCurrency}
                      onOpenDetails={setSelectedCurrencyForModal}
                      quotationMode={quotationMode}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Currencies Section */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  {showOnlyFavorites
                    ? 'Starred Currencies'
                    : selectedRegion !== 'all'
                    ? REGIONS.find((r) => r.id === selectedRegion)?.label
                    : 'All Global Currencies vs SGD'}
                </h2>
                <span className="text-xs text-slate-500">
                  Showing {filteredCurrencies.length} of {currencies.length} currencies
                </span>
              </div>

              {filteredCurrencies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCurrencies.map((currency) => (
                    <CurrencyCard
                      key={currency.code}
                      currency={currency}
                      isFavorite={favorites.includes(currency.code)}
                      onToggleFavorite={handleToggleFavorite}
                      onSelectForCalculation={handleOpenCalculatorWithCurrency}
                      onOpenDetails={setSelectedCurrencyForModal}
                      quotationMode={quotationMode}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                  <div className="text-slate-400 mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-slate-50">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    No currencies match your filter
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try searching for another currency code (e.g., MYR, USD, JPY) or clear your current filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRegion('all');
                      setShowOnlyFavorites(false);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Calculator View */}
        {currentView === 'calculator' && (
          <Calculator
            currencies={currencies}
            initialCurrencyCode={calculatorTargetCode}
            favorites={favorites}
            onSelectCurrency={setCalculatorTargetCode}
          />
        )}

        {/* Multi-Currency Batch Converter View */}
        {currentView === 'multi' && (
          <MultiCurrencyConverter
            currencies={currencies}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectForCalculation={handleOpenCalculatorWithCurrency}
          />
        )}

        {/* Travel Cheat Sheet View */}
        {currentView === 'cheatsheet' && (
          <TravelCheatSheet
            currencies={currencies}
            initialCurrencyCode={calculatorTargetCode}
            favorites={favorites}
          />
        )}

        {/* Talk to Us Disqus Community Forum View */}
        {currentView === 'talk-to-us' && (
          <TalkToUs
            articleId="mas-exchanger-talk-to-us"
            articleTitle="SingaRate — Talk to Us Community Forum"
          />
        )}
      </main>

      {/* Detail Modal */}
      <CurrencyDetailModal
        currency={selectedCurrencyForModal}
        onClose={() => setSelectedCurrencyForModal(null)}
        onOpenCalculator={handleOpenCalculatorWithCurrency}
        isFavorite={
          selectedCurrencyForModal ? favorites.includes(selectedCurrencyForModal.code) : false
        }
        onToggleFavorite={handleToggleFavorite}
      />

      {/* MAS API Developer Integration Modal */}
      <MasApiModal
        isOpen={isMasModalOpen}
        onClose={() => setIsMasModalOpen(false)}
        currentConfig={masConfig}
        onSaveConfig={(updated) => {
          setMasConfig(updated);
          loadRates(updated);
        }}
      />

      {/* Footnote / Disclaimer Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-xs text-slate-500 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <span>SingaRate</span>
                <span aria-hidden="true">·</span>
                <span className="font-normal text-slate-500">Singapore Foreign Exchange Portal</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Exchange rates aligned with Monetary Authority of Singapore (MAS) reference conventions and global interbank benchmarks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button
                onClick={() => setCurrentView('talk-to-us')}
                className="text-blue-700 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Talk to Us (Forum)
              </button>
              <button
                onClick={() => setIsMasModalOpen(true)}
                className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
              >
                MAS API Connector Mode
              </button>
              <button
                onClick={() => setCurrentView('calculator')}
                className="hover:text-slate-900 cursor-pointer"
              >
                Calculator
              </button>
              <button
                onClick={() => setCurrentView('cheatsheet')}
                className="hover:text-slate-900 cursor-pointer"
              >
                Travel Sheet
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
            <div>
              Rates are for reference and planning purposes. Official MAS daily exchange rate fixings take place at 16:00 SGT.
            </div>
            <div>
              Includes Singapore-Brunei 1:1 Currency Interchangeability Agreement (1967).
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
