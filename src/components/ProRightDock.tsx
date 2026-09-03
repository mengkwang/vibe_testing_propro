import React, { useState } from 'react';
import {
  Bookmark,
  Bell,
  Newspaper,
  Gauge,
  Zap,
  X,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ThemeMode,
  ProDockTab,
  PriceAlert,
  MarketNewsItem,
  PaperTradePosition,
  StockMover,
} from '../types';
import { PRO_MARKET_NEWS, INITIAL_PRICE_ALERTS } from '../data/proMarketData';
import { playTickSound, playOrderFilledSound } from '../utils/soundEffects';

interface ProRightDockProps {
  theme: ThemeMode;
  activeDockTab: ProDockTab;
  onSelectDockTab: (tab: ProDockTab) => void;
  soundEnabled: boolean;
  onSelectSymbol: (symbol: string) => void;
}

export const ProRightDock: React.FC<ProRightDockProps> = ({
  theme,
  activeDockTab,
  onSelectDockTab,
  soundEnabled,
  onSelectSymbol,
}) => {
  // Watchlist state
  const [watchlist, setWatchlist] = useState<Array<{ symbol: string; price: number; change: number; isUp: boolean }>>([
    { symbol: 'NVDA', price: 141.54, change: 3.18, isUp: true },
    { symbol: 'AAPL', price: 231.41, change: -0.64, isUp: false },
    { symbol: 'BTC/USD', price: 67490.5, change: 2.45, isUp: true },
    { symbol: 'TSLA', price: 260.48, change: 4.92, isUp: true },
    { symbol: 'SPY', price: 597.45, change: 0.45, isUp: true },
  ]);
  const [newSymbolInput, setNewSymbolInput] = useState('');

  // Alerts state
  const [alerts, setAlerts] = useState<PriceAlert[]>(INITIAL_PRICE_ALERTS);
  const [newAlertSymbol, setNewAlertSymbol] = useState('NVDA');
  const [newAlertPrice, setNewAlertPrice] = useState('145.00');

  // Paper trading state
  const [cashBalance, setCashBalance] = useState(100000);
  const [positions, setPositions] = useState<PaperTradePosition[]>([
    {
      symbol: 'NVDA',
      type: 'BUY',
      shares: 100,
      entryPrice: 136.2,
      currentPrice: 141.54,
      pnl: 534.0,
      pnlPct: 3.92,
    },
    {
      symbol: 'TSLA',
      type: 'BUY',
      shares: 50,
      entryPrice: 248.5,
      currentPrice: 260.48,
      pnl: 599.0,
      pnlPct: 4.82,
    },
  ]);
  const [orderSymbol, setOrderSymbol] = useState('NVDA');
  const [orderShares, setOrderShares] = useState(10);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Technical gauge target symbol
  const [gaugeSymbol, setGaugeSymbol] = useState('NVDA');

  const handleAddWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbolInput.trim()) return;
    const sym = newSymbolInput.toUpperCase().trim();
    if (!watchlist.find((w) => w.symbol === sym)) {
      setWatchlist((prev) => [
        ...prev,
        {
          symbol: sym,
          price: 150.0 + Math.random() * 50,
          change: +(Math.random() * 4 - 1.5).toFixed(2),
          isUp: Math.random() > 0.4,
        },
      ]);
      playTickSound(soundEnabled);
    }
    setNewSymbolInput('');
  };

  const handleRemoveWatchlist = (sym: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlist((prev) => prev.filter((w) => w.symbol !== sym));
    playTickSound(soundEnabled);
  };

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newAlertPrice);
    if (isNaN(target) || !newAlertSymbol) return;

    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      symbol: newAlertSymbol.toUpperCase(),
      targetPrice: target,
      condition: target > 140 ? 'above' : 'below',
      currentPrice: 141.54,
      createdTime: 'Just now',
      active: true,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    playOrderFilledSound(soundEnabled);
  };

  const handleExecutePaperOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = orderSymbol.toUpperCase();
    const estPrice = sym === 'BTC/USD' ? 67490.5 : sym === 'TSLA' ? 260.48 : 141.54;
    const totalCost = estPrice * orderShares;

    if (orderType === 'BUY' && totalCost > cashBalance) {
      alert('Insufficient paper buying power!');
      return;
    }

    if (orderType === 'BUY') {
      setCashBalance((prev) => prev - totalCost);
      setPositions((prev) => {
        const existing = prev.find((p) => p.symbol === sym);
        if (existing) {
          const totalShares = existing.shares + orderShares;
          const newEntry = (existing.entryPrice * existing.shares + estPrice * orderShares) / totalShares;
          return prev.map((p) =>
            p.symbol === sym
              ? {
                  ...p,
                  shares: totalShares,
                  entryPrice: +newEntry.toFixed(2),
                  currentPrice: estPrice,
                  pnl: +(totalShares * (estPrice - newEntry)).toFixed(2),
                  pnlPct: +(((estPrice - newEntry) / newEntry) * 100).toFixed(2),
                }
              : p
          );
        }
        return [
          ...prev,
          {
            symbol: sym,
            type: 'BUY',
            shares: orderShares,
            entryPrice: estPrice,
            currentPrice: estPrice,
            pnl: 0,
            pnlPct: 0,
          },
        ];
      });
    } else {
      // SELL
      setCashBalance((prev) => prev + totalCost);
      setPositions((prev) => prev.filter((p) => p.symbol !== sym));
    }

    playOrderFilledSound(soundEnabled);
    setOrderSuccessMsg(`Filled ${orderType} ${orderShares} ${sym} @ $${estPrice.toFixed(2)}`);
    setTimeout(() => setOrderSuccessMsg(null), 3500);
  };

  const dockButtons: Array<{ id: ProDockTab; icon: React.ComponentType<{ className?: string }>; label: string }> = [
    { id: 'watchlist', icon: Bookmark, label: 'Watchlist & Quotes' },
    { id: 'alerts', icon: Bell, label: 'Alerts Manager' },
    { id: 'news', icon: Newspaper, label: 'Live Market News' },
    { id: 'technicals', icon: Gauge, label: 'Technical Gauge' },
    { id: 'paperTrade', icon: Zap, label: 'Paper Trading' },
  ];

  return (
    <>
      {/* Right Edge Iconic TradingView Pro Tool Strip */}
      <aside
        id="tradingview-pro-dock-strip"
        aria-label="Pro Tools Strip"
        className={`fixed right-0 top-16 bottom-0 w-12 border-l flex flex-col items-center py-3 space-y-2 z-40 transition-colors duration-200 ${
          theme === 'dark' ? 'bg-[#131722] border-[#2a2e39]' : 'bg-[#f8f9fd] border-[#e0e3eb]'
        }`}
      >
        {dockButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = activeDockTab === btn.id;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => {
                playTickSound(soundEnabled);
                onSelectDockTab(isActive ? null : btn.id);
              }}
              title={btn.label}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 relative group cursor-pointer ${
                isActive
                  ? 'bg-[#2962ff] text-white shadow-md'
                  : theme === 'dark'
                  ? 'text-[#787b86] hover:text-[#f0f3fa] hover:bg-[#1e222d]'
                  : 'text-[#787b86] hover:text-[#131722] hover:bg-[#e0e3eb]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {/* Tooltip on left */}
              <div className="absolute right-12 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-black/90 text-white text-[11px] font-semibold rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                {btn.label}
              </div>
            </button>
          );
        })}
      </aside>

      {/* Slide-out Pro Drawer Panel */}
      {activeDockTab && (
        <section
          id="pro-dock-flyout-panel"
          aria-label="Pro Tools Flyout"
          className={`fixed right-12 top-16 bottom-0 w-80 sm:w-96 border-l shadow-2xl z-40 flex flex-col transition-colors duration-200 animate-in slide-in-from-right-4 duration-150 ${
            theme === 'dark'
              ? 'bg-[#1e222d] border-[#2a2e39] text-[#f0f3fa]'
              : 'bg-white border-[#e0e3eb] text-[#131722]'
          }`}
        >
          {/* Panel Header */}
          <div
            className={`px-4 py-3 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-[#2a2e39]' : 'border-[#e0e3eb]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2962ff] animate-pulse" />
              <h3 className="text-sm font-bold tracking-tight uppercase">
                {activeDockTab === 'watchlist' && 'Watchlist & Quotes'}
                {activeDockTab === 'alerts' && 'Price Alerts'}
                {activeDockTab === 'news' && 'Breaking Wire'}
                {activeDockTab === 'technicals' && 'Technical Meter'}
                {activeDockTab === 'paperTrade' && 'Paper Trading Ticket'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                playTickSound(soundEnabled);
                onSelectDockTab(null);
              }}
              className={`p-1 rounded-md transition-colors ${
                theme === 'dark' ? 'hover:bg-[#2a2e39] text-[#787b86]' : 'hover:bg-[#f0f3fa] text-[#787b86]'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 1. WATCHLIST TAB */}
            {activeDockTab === 'watchlist' && (
              <div className="space-y-3">
                <form onSubmit={handleAddWatchlist} className="flex gap-2">
                  <input
                    type="text"
                    value={newSymbolInput}
                    onChange={(e) => setNewSymbolInput(e.target.value)}
                    placeholder="Add symbol (e.g. MSFT)..."
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg border outline-none font-mono uppercase ${
                      theme === 'dark'
                        ? 'bg-[#131722] border-[#2a2e39] text-white focus:border-[#2962ff]'
                        : 'bg-[#f0f3fa] border-[#d1d4dc] text-[#131722] focus:border-[#2962ff]'
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#2962ff] text-white text-xs font-semibold rounded-lg hover:bg-[#1e53e5] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </form>

                <div className="divide-y divide-[#2a2e39]/30">
                  {watchlist.map((item) => (
                    <div
                      key={item.symbol}
                      onClick={() => onSelectSymbol(item.symbol)}
                      className={`py-2.5 px-2 flex items-center justify-between rounded-lg transition-colors cursor-pointer group ${
                        theme === 'dark' ? 'hover:bg-[#2a2e39]/60' : 'hover:bg-[#f0f3fa]'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs tracking-wider">{item.symbol}</span>
                        <p className="text-[10px] text-[#787b86]">Standard Quote</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono text-xs">
                          <p className="font-semibold">
                            ${item.price > 1000 ? item.price.toLocaleString() : item.price.toFixed(2)}
                          </p>
                          <span
                            className={`text-[11px] font-medium flex items-center justify-end gap-0.5 ${
                              item.isUp ? 'text-[#089981]' : 'text-[#f23645]'
                            }`}
                          >
                            {item.isUp ? '+' : ''}
                            {item.change}%
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveWatchlist(item.symbol, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#787b86] hover:text-[#f23645] transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. ALERTS TAB */}
            {activeDockTab === 'alerts' && (
              <div className="space-y-4">
                <form
                  onSubmit={handleAddAlert}
                  className={`p-3 rounded-xl border space-y-2.5 ${
                    theme === 'dark' ? 'bg-[#131722] border-[#2a2e39]' : 'bg-[#f0f3fa] border-[#e0e3eb]'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-[#787b86]">Create Price Alert</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newAlertSymbol}
                      onChange={(e) => setNewAlertSymbol(e.target.value)}
                      placeholder="Symbol"
                      className={`px-2.5 py-1 text-xs rounded border outline-none font-mono uppercase ${
                        theme === 'dark' ? 'bg-[#1e222d] border-[#2a2e39] text-white' : 'bg-white border-[#d1d4dc]'
                      }`}
                    />
                    <input
                      type="number"
                      step="any"
                      value={newAlertPrice}
                      onChange={(e) => setNewAlertPrice(e.target.value)}
                      placeholder="Price"
                      className={`px-2.5 py-1 text-xs rounded border outline-none font-mono ${
                        theme === 'dark' ? 'bg-[#1e222d] border-[#2a2e39] text-white' : 'bg-white border-[#d1d4dc]'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-[#2962ff] text-white text-xs font-semibold rounded-lg hover:bg-[#1e53e5] flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Set Alert Trigger
                  </button>
                </form>

                <div className="space-y-2">
                  {alerts.map((al) => (
                    <div
                      key={al.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        theme === 'dark' ? 'bg-[#131722]/60 border-[#2a2e39]' : 'bg-white border-[#e0e3eb]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs">{al.symbol}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 font-semibold">
                            {al.condition.toUpperCase()} ${al.targetPrice.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#787b86]">Created {al.createdTime}</p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#089981] animate-ping" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. NEWS STREAM TAB */}
            {activeDockTab === 'news' && (
              <div className="space-y-3">
                {PRO_MARKET_NEWS.map((news) => (
                  <article
                    key={news.id}
                    className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] ${
                      theme === 'dark'
                        ? 'bg-[#131722]/70 border-[#2a2e39] hover:border-[#363a45]'
                        : 'bg-[#f8f9fd] border-[#e0e3eb] hover:border-[#d1d4dc]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#787b86] mb-1.5">
                      <span className="font-bold text-[#2962ff]">{news.source}</span>
                      <span>{news.timeAgo}</span>
                    </div>
                    <h4 className="text-xs font-semibold leading-relaxed mb-2">{news.title}</h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {news.relatedSymbols.map((sym) => (
                        <span
                          key={sym}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSymbol(sym);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-black/20 text-[#787b86] hover:text-[#2962ff]"
                        >
                          {sym}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* 4. TECHNICALS TAB (Iconic TradingView Needle Speedometer) */}
            {activeDockTab === 'technicals' && (
              <div className="space-y-4 text-center">
                <div className="flex justify-center gap-2">
                  {['NVDA', 'AAPL', 'BTC/USD', 'SPY'].map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setGaugeSymbol(sym)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                        gaugeSymbol === sym
                          ? 'bg-[#2962ff] text-white'
                          : theme === 'dark'
                          ? 'bg-[#131722] text-[#787b86] hover:text-white'
                          : 'bg-[#f0f3fa] text-[#787b86] hover:text-black'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>

                {/* SVG Gauge Speedometer */}
                <div className="relative flex flex-col items-center justify-center pt-2">
                  <svg className="w-56 h-32 overflow-visible" viewBox="0 0 200 110">
                    <defs>
                      <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f23645" />
                        <stop offset="25%" stopColor="#ff9800" />
                        <stop offset="50%" stopColor="#9e9e9e" />
                        <stop offset="75%" stopColor="#26a69a" />
                        <stop offset="100%" stopColor="#089981" />
                      </linearGradient>
                    </defs>
                    {/* Semi-circle arc */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="url(#gaugeGrad)"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    {/* Needle Indicator at ~75% (Strong Buy) */}
                    <line
                      x1="100"
                      y1="100"
                      x2="148"
                      y2="42"
                      stroke={theme === 'dark' ? '#f0f3fa' : '#131722'}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle cx="100" cy="100" r="7" fill="#2962ff" />
                  </svg>
                  <div className="mt-1">
                    <span className="text-base font-extrabold text-[#089981] tracking-wide uppercase">
                      Strong Buy
                    </span>
                    <p className="text-[11px] text-[#787b86]">Summary based on 26 technical indicators</p>
                  </div>
                </div>

                {/* Breakdown Matrix */}
                <div
                  className={`grid grid-cols-2 gap-2 p-3 rounded-xl border text-left text-xs ${
                    theme === 'dark' ? 'bg-[#131722] border-[#2a2e39]' : 'bg-[#f0f3fa] border-[#e0e3eb]'
                  }`}
                >
                  <div>
                    <p className="text-[10px] text-[#787b86] uppercase font-bold">Oscillators</p>
                    <p className="font-bold text-[#089981]">Buy (2)</p>
                    <p className="text-[11px] text-[#787b86]">Neutral: 8 • Sell: 1</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#787b86] uppercase font-bold">Moving Averages</p>
                    <p className="font-bold text-[#089981]">Strong Buy (14)</p>
                    <p className="text-[11px] text-[#787b86]">Neutral: 1 • Sell: 1</p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. PAPER TRADING TICKET TAB */}
            {activeDockTab === 'paperTrade' && (
              <div className="space-y-4">
                {/* Account balance card */}
                <div
                  className={`p-3.5 rounded-xl border ${
                    theme === 'dark' ? 'bg-[#131722] border-[#2a2e39]' : 'bg-[#f8f9fd] border-[#e0e3eb]'
                  }`}
                >
                  <p className="text-[11px] text-[#787b86] font-medium">Simulated Buying Power</p>
                  <h4 className="text-xl font-bold font-mono tracking-tight text-[#089981]">
                    ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h4>
                </div>

                {orderSuccessMsg && (
                  <div className="p-2 rounded-lg bg-[#089981]/20 border border-[#089981]/40 text-[#089981] text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{orderSuccessMsg}</span>
                  </div>
                )}

                {/* Instant Order Form */}
                <form onSubmit={handleExecutePaperOrder} className="space-y-3">
                  {/* Buy / Sell switch */}
                  <div className="grid grid-cols-2 gap-1 p-1 bg-black/20 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setOrderType('BUY')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        orderType === 'BUY' ? 'bg-[#089981] text-white' : 'text-[#787b86]'
                      }`}
                    >
                      BUY / LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('SELL')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        orderType === 'SELL' ? 'bg-[#f23645] text-white' : 'text-[#787b86]'
                      }`}
                    >
                      SELL / SHORT
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-[#787b86] font-medium">Symbol</label>
                    <input
                      type="text"
                      value={orderSymbol}
                      onChange={(e) => setOrderSymbol(e.target.value)}
                      className={`w-full px-3 py-1.5 text-xs rounded-lg border font-mono uppercase ${
                        theme === 'dark' ? 'bg-[#131722] border-[#2a2e39] text-white' : 'bg-[#f0f3fa] border-[#d1d4dc]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-[#787b86] font-medium">Quantity (Units)</label>
                    <input
                      type="number"
                      min={1}
                      value={orderShares}
                      onChange={(e) => setOrderShares(parseInt(e.target.value) || 1)}
                      className={`w-full px-3 py-1.5 text-xs rounded-lg border font-mono ${
                        theme === 'dark' ? 'bg-[#131722] border-[#2a2e39] text-white' : 'bg-[#f0f3fa] border-[#d1d4dc]'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-transform active:scale-95 ${
                      orderType === 'BUY' ? 'bg-[#089981] hover:bg-[#078570]' : 'bg-[#f23645] hover:bg-[#d92c3a]'
                    }`}
                  >
                    Execute {orderType} Market Order
                  </button>
                </form>

                {/* Open positions */}
                <div className="space-y-2 pt-2 border-t border-inherit">
                  <p className="text-xs font-bold text-[#787b86] uppercase tracking-wider">Active Positions ({positions.length})</p>
                  {positions.map((pos) => (
                    <div
                      key={pos.symbol}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        theme === 'dark' ? 'bg-[#131722]/50 border-[#2a2e39]' : 'bg-[#f8f9fd] border-[#e0e3eb]'
                      }`}
                    >
                      <div>
                        <span className="font-bold">{pos.symbol}</span>
                        <p className="text-[10px] text-[#787b86]">
                          {pos.shares} shares @ ${pos.entryPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right font-mono">
                        <p className={`font-bold ${pos.pnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                          {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                        </p>
                        <p className={`text-[10px] ${pos.pnlPct >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                          ({pos.pnlPct >= 0 ? '+' : ''}{pos.pnlPct}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
};
