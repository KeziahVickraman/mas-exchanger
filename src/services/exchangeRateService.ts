import { Currency, MasApiConfig } from '../types/currency';
import { INITIAL_CURRENCIES } from '../data/currencies';

const STORAGE_KEY_FAVORITES = 'singarate_favorites_v1';
const STORAGE_KEY_CONFIG = 'singarate_mas_config_v1';
const STORAGE_KEY_CUSTOM_RATES = 'singarate_rates_cache_v1';

export interface ExchangeRateResponse {
  currencies: Currency[];
  lastUpdated: string;
  source: 'live-api' | 'mas-benchmark' | 'custom-backend' | 'cached';
  error?: string;
}

export const getSavedFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse saved favorites:', e);
  }
  return ['MYR', 'USD', 'JPY', 'THB', 'EUR', 'GBP', 'AUD'];
};

export const saveFavorites = (favorites: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
  } catch (e) {
    console.warn('Failed to save favorites:', e);
  }
};

export const getMasConfig = (): MasApiConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse MAS config:', e);
  }
  return {
    apiKey: '',
    endpointUrl: '',
    mode: 'live-interbank',
    autoRefreshInterval: 300,
  };
};

export const saveMasConfig = (config: MasApiConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save MAS config:', e);
  }
};

/**
 * Fetch latest exchange rates for SGD
 */
export async function fetchExchangeRates(config?: MasApiConfig): Promise<ExchangeRateResponse> {
  const currentConfig = config || getMasConfig();

  // If in MAS catalogue mode or custom backend
  if (currentConfig.mode === 'custom-backend' || currentConfig.mode === 'mas-benchmark') {
    const endpoint = currentConfig.endpointUrl || '/api/exchangerates';
    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (currentConfig.apiKey) {
        headers['KeyId'] = currentConfig.apiKey;
        headers['x-mas-key-id'] = currentConfig.apiKey;
      }

      const res = await fetch(endpoint, {
        headers,
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.rates && Object.keys(json.rates).length > 0) {
          const merged = mergeWithBaseCurrencies(json.rates);
          return {
            currencies: merged,
            lastUpdated: `${json.endOfDay || 'Live'} (MAS Catalogue Gateway)`,
            source: 'custom-backend',
          };
        }
      }
    } catch (err: any) {
      console.warn('MAS catalogue endpoint request error:', err);
    }
  }

  // Live public interbank rates with SGD as base
  if (currentConfig.mode === 'live-interbank') {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/SGD', {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          const merged = mergeWithBaseCurrencies(data.rates);
          // cache for offline resilience
          try {
            localStorage.setItem(
              STORAGE_KEY_CUSTOM_RATES,
              JSON.stringify({ rates: data.rates, timestamp: Date.now() })
            );
          } catch {}

          return {
            currencies: merged,
            lastUpdated: new Date().toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit' }) + ' SGT (Live)',
            source: 'live-api',
          };
        }
      }
    } catch (e) {
      console.info('Live rates network fetch timed out or offline, using Singapore market benchmark:', e);
    }
  }

  // Try cached rates if available
  try {
    const cached = localStorage.getItem(STORAGE_KEY_CUSTOM_RATES);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.rates) {
        return {
          currencies: mergeWithBaseCurrencies(parsed.rates),
          lastUpdated: new Date(parsed.timestamp).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }) + ' SGT (Cached)',
          source: 'cached',
        };
      }
    }
  } catch {}

  // Fallback to MAS official market baseline dataset
  return {
    currencies: INITIAL_CURRENCIES,
    lastUpdated: '16:00 SGT (MAS Daily Fixing Benchmark)',
    source: 'mas-benchmark',
  };
}

function mergeWithBaseCurrencies(apiRates: Record<string, number>): Currency[] {
  return INITIAL_CURRENCIES.map((base) => {
    const liveRate = apiRates[base.code];
    if (typeof liveRate === 'number' && liveRate > 0) {
      const oldRate = base.ratePerSGD;
      const pctDiff = ((liveRate - oldRate) / oldRate) * 100;
      return {
        ...base,
        ratePerSGD: liveRate,
        change24h: Number(pctDiff.toFixed(2)),
        high24h: Math.max(base.high24h, liveRate * 1.002),
        low24h: Math.min(base.low24h, liveRate * 0.998),
      };
    }
    return base;
  });
}

/**
 * Format foreign currency or SGD amount nicely
 */
export function formatAmount(value: number, decimals = 2): string {
  if (isNaN(value)) return '0.00';
  if (value >= 1000) {
    return new Intl.NumberFormat('en-SG', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
  if (value < 0.01 && value > 0) {
    return value.toFixed(4);
  }
  return value.toFixed(decimals);
}

/**
 * Convert 1 SGD to Foreign Currency, or inverse
 */
export function convertCurrency(
  amount: number,
  currency: Currency,
  direction: 'sgd-to-foreign' | 'foreign-to-sgd',
  feePercent = 0
): number {
  if (isNaN(amount) || amount <= 0) return 0;
  const spreadMultiplier = direction === 'sgd-to-foreign'
    ? (1 - feePercent / 100)
    : (1 / (1 - feePercent / 100));

  if (direction === 'sgd-to-foreign') {
    return amount * currency.ratePerSGD * spreadMultiplier;
  } else {
    return (amount / currency.ratePerSGD) * spreadMultiplier;
  }
}

/**
 * Get MAS market rate representation:
 * E.g. For JPY (masUnit=100), MAS table specifies: 100 JPY = X SGD.
 * So: 100 / ratePerSGD
 */
export function getMasRateString(currency: Currency): string {
  if (currency.masUnit === 100) {
    const sgdFor100 = 100 / currency.ratePerSGD;
    return `S$${formatAmount(sgdFor100, 4)} per 100 ${currency.code}`;
  } else {
    const sgdFor1 = 1 / currency.ratePerSGD;
    return `S$${formatAmount(sgdFor1, 4)} per 1 ${currency.code}`;
  }
}

/**
 * Standard quote: 1 SGD = X Foreign Currency
 */
export function getStandardQuoteString(currency: Currency): string {
  return `1 SGD = ${formatAmount(currency.ratePerSGD, currency.ratePerSGD > 100 ? 2 : 4)} ${currency.code}`;
}
