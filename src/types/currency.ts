export type Region = 'asean' | 'east-asia' | 'europe' | 'americas' | 'oceania' | 'south-asia-me' | 'all';

export interface Currency {
  code: string;
  name: string;
  country: string;
  symbol: string;
  flag: string;
  region: Region;
  /** MAS official quotation standard: 100 for JPY, IDR, KRW, THB, etc., or 1 for others */
  masUnit: number;
  /** How many units of this foreign currency equal 1 SGD */
  ratePerSGD: number;
  /** 24h percentage change against SGD */
  change24h: number;
  /** 24h high rate */
  high24h: number;
  /** 24h low rate */
  low24h: number;
  /** Popularity rank in Singapore (1 is highest) */
  popularRank: number;
  /** Singapore money changer typical spread % */
  typicalSpread: number;
  /** Travel / business tip */
  travelNote: string;
}

export type ViewMode = 'rates' | 'calculator' | 'cheatsheet' | 'multi' | 'talk-to-us';

export type QuotationDisplayMode = 'unit' | 'mas'; // 'unit' = 1 SGD = X, 'mas' = per MAS standard (e.g. per 100 JPY)

export interface MasApiConfig {
  apiKey: string;
  endpointUrl: string;
  mode: 'live-interbank' | 'mas-benchmark' | 'custom-backend';
  lastSynced?: string;
  autoRefreshInterval: number; // in seconds
}
