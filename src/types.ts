export type Timeframe = '1D' | '5D' | '1M' | '1Y';

export interface SparklinePoint {
  x: number;
  y: number;
}

export interface RangeData {
  price: string;
  change: string;
  pct: string;
  isUp: boolean;
  min: number;
  max: number;
  points: string;
  timeDomain: 'intraday' | 'days' | 'month' | 'year';
}

export interface MarketIndex {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  badgeNumber: string;
  badgeBg: string;
  badgeText?: string;
  timeframeData: Record<Timeframe, RangeData>;
  exchangeShort: string;
  prevClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  description: string;
}

export interface StockMover {
  symbol: string;
  name: string;
  last: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  volume: string;
  rating: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';
  badgeBg: string;
  badgeTextColor: string;
  trendPoints: string;
  trendDirection: 'up' | 'down';
  marketCap: string;
  peRatio: number;
  sector: string;
  avgVolume: string;
  yearHigh: number;
  yearLow: number;
}

export interface LiveTickerItem {
  id: string;
  symbol: string;
  price: string;
  change: string;
  isUp: boolean;
  type: 'forex' | 'crypto' | 'commodity' | 'stock' | 'bond';
}

export type CategoryType =
  | 'US stocks'
  | 'World stocks'
  | 'Crypto'
  | 'Futures'
  | 'Forex'
  | 'Government bonds'
  | 'Corporate bonds'
  | 'ETFs'
  | 'Economy';

export type MoverTab =
  | 'Most active'
  | 'Gainers'
  | 'Losers'
  | 'All-time high'
  | 'Overbought'
  | 'Oversold';

export type ThemeMode = 'dark' | 'light';

export type ScreenerViewMode = 'table' | 'heatmap' | 'grid';

export type ProDockTab = 'watchlist' | 'alerts' | 'news' | 'technicals' | 'paperTrade' | null;

export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma?: number;
  ema?: number;
  rsi?: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  currentPrice: number;
  createdTime: string;
  active: boolean;
}

export interface MarketNewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relatedSymbols: string[];
  url?: string;
}

export interface TechnicalSummary {
  oscillators: { buy: number; neutral: number; sell: number; summary: 'Buy' | 'Neutral' | 'Sell' };
  movingAverages: { buy: number; neutral: number; sell: number; summary: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' };
  overall: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';
  score: number; // 0 (Strong Sell) to 100 (Strong Buy)
}

export interface PaperTradePosition {
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPct: number;
}
