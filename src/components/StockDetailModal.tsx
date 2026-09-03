import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Star,
  Bell,
  Activity,
  Layers,
  BarChart2,
  Sliders,
  DollarSign,
  CheckCircle,
  Maximize2,
  Share2,
} from 'lucide-react';
import { StockMover, MarketIndex, ThemeMode, CandlestickData } from '../types';
import { generateCandlesticks } from '../data/proMarketData';
import { playTickSound, playOrderFilledSound } from '../utils/soundEffects';

interface StockDetailModalProps {
  theme: ThemeMode;
  item: StockMover | MarketIndex | null;
  onClose: () => void;
  soundEnabled?: boolean;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  theme,
  item,
  onClose,
  soundEnabled = true,
}) => {
  const [selectedTf, setSelectedTf] = useState<'1D' | '5D' | '1M' | '1Y'>('1D');
  const [chartType, setChartType] = useState<'candles' | 'area'>('candles');
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [hoveredCandle, setHoveredCandle] = useState<CandlestickData | null>(null);

  // Quick Trade execution inside modal
  const [tradeShares, setTradeShares] = useState(10);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const isStock = 'sector' in item;
  const symbol = item.symbol;
  const name = item.name;

  let currentPrice = 0;
  let change = 0;
  let changePct = 0;
  let dayHigh = 0;
  let dayLow = 0;
  let yearHigh = 0;
  let yearLow = 0;
  let marketCap = '—';
  let peRatio = 0;
  let volume = '—';

  if (isStock) {
    const stock = item as StockMover;
    currentPrice = stock.last;
    change = stock.change;
    changePct = stock.changePct;
    dayHigh = stock.high;
    dayLow = stock.low;
    yearHigh = stock.yearHigh;
    yearLow = stock.yearLow;
    marketCap = stock.marketCap;
    peRatio = stock.peRatio;
    volume = stock.volume;
  } else {
    const idx = item as MarketIndex;
    const tfData = idx.timeframeData[selectedTf];
    currentPrice = parseFloat(tfData.price.replace(/,/g, ''));
    change = parseFloat(tfData.change.replace('+', '').replace(/,/g, ''));
    changePct = parseFloat(tfData.pct.replace('%', '').replace('+', ''));
    dayHigh = idx.dayHigh;
    dayLow = idx.dayLow;
    yearHigh = idx.yearHigh;
    yearLow = idx.yearLow;
    marketCap = '$12.4T';
    volume = '4.2B';
  }

  const isUp = change >= 0;

  // Generate 32 realistic candlesticks
  const candles = useMemo(() => {
    return generateCandlesticks(symbol, currentPrice, isUp, 32);
  }, [symbol, currentPrice, isUp]);

  // Compute boundaries for SVG chart
  const { minPrice, maxPrice, maxVol } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let mv = 0;
    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > mv) mv = c.volume;
    });
    // Add 5% padding
    const pad = (max - min) * 0.08 || 1;
    return { minPrice: min - pad, maxPrice: max + pad, maxVol: mv || 1 };
  }, [candles]);

  // Candle SVG math
  const svgWidth = 640;
  const svgHeight = 220;
  const candleSpacing = svgWidth / candles.length;
  const candleWidth = Math.max(3, candleSpacing * 0.65);

  const getY = (price: number) => {
    return svgHeight - ((price - minPrice) / (maxPrice - minPrice)) * (svgHeight - 40) - 20;
  };

  // Generate SMA line path
  const smaPoints = useMemo(() => {
    return candles
      .map((c, i) => {
        // Simple 5-period moving average
        const slice = candles.slice(Math.max(0, i - 4), i + 1);
        const avg = slice.reduce((sum, item) => sum + item.close, 0) / slice.length;
        const x = i * candleSpacing + candleSpacing / 2;
        const y = getY(avg);
        return `${x},${y}`;
      })
      .join(' ');
  }, [candles, minPrice, maxPrice]);

  // Handle Quick Paper Trade
  const handleQuickTrade = (type: 'BUY' | 'SELL') => {
    playOrderFilledSound(soundEnabled);
    setOrderNotice(`Simulated ${type} filled for ${tradeShares} shares of ${symbol} @ $${currentPrice.toFixed(2)}`);
    setTimeout(() => setOrderNotice(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-black/75 animate-in fade-in duration-150">
      <div
        className={`w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors ${
          theme === 'dark'
            ? 'bg-[#1e222d] border-[#2a2e39] text-[#f0f3fa]'
            : 'bg-white border-[#e0e3eb] text-[#131722]'
        }`}
      >
        {/* Modal Top Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-start justify-between ${
            theme === 'dark' ? 'border-[#2a2e39]' : 'border-[#e0e3eb]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <span
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-sm"
              style={{
                backgroundColor: 'badgeBg' in item ? item.badgeBg : '#2962ff',
              }}
            >
              {symbol.slice(0, 4)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight">{symbol}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-[#2962ff]/15 text-[#2962ff]">
                  {isStock ? (item as StockMover).sector : (item as MarketIndex).exchangeShort}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-[#089981] bg-[#089981]/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse" />
                  REAL-TIME CME FEED
                </span>
              </div>
              <p className="text-xs text-[#787b86] font-medium">{name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playTickSound(soundEnabled);
                setIsWatchlisted(!isWatchlisted);
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isWatchlisted
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : theme === 'dark'
                  ? 'border-[#2a2e39] hover:bg-[#2a2e39] text-[#787b86]'
                  : 'border-[#e0e3eb] hover:bg-[#f0f3fa] text-[#787b86]'
              }`}
              title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => {
                playTickSound(soundEnabled);
                onClose();
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'border-[#2a2e39] hover:bg-[#2a2e39] text-[#787b86] hover:text-white'
                  : 'border-[#e0e3eb] hover:bg-[#f0f3fa] text-[#787b86] hover:text-black'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Main Price & OHLC Readout */}
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight">
                  ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-sm sm:text-base font-bold font-mono flex items-center gap-1 ${
                    isUp ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {isUp ? '+' : ''}
                  {change.toFixed(2)} ({isUp ? '+' : ''}
                  {changePct.toFixed(2)}%)
                </span>
              </div>

              {/* Cursor OHLC Readout Bar */}
              <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-[#787b86] flex-wrap">
                {hoveredCandle ? (
                  <>
                    <span>Time: <strong className="text-inherit">{hoveredCandle.time}</strong></span>
                    <span>O: <strong className="text-inherit">${hoveredCandle.open.toFixed(2)}</strong></span>
                    <span>H: <strong className="text-inherit">${hoveredCandle.high.toFixed(2)}</strong></span>
                    <span>L: <strong className="text-inherit">${hoveredCandle.low.toFixed(2)}</strong></span>
                    <span>
                      C:{' '}
                      <strong className={hoveredCandle.close >= hoveredCandle.open ? 'text-[#089981]' : 'text-[#f23645]'}>
                        ${hoveredCandle.close.toFixed(2)}
                      </strong>
                    </span>
                  </>
                ) : (
                  <>
                    <span>Day High: <strong className="text-inherit">${dayHigh.toFixed(2)}</strong></span>
                    <span>Day Low: <strong className="text-inherit">${dayLow.toFixed(2)}</strong></span>
                    <span>Volume: <strong className="text-inherit">{volume}</strong></span>
                  </>
                )}
              </div>
            </div>

            {/* Chart Control Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Chart Style Switcher */}
              <div
                className={`p-0.5 rounded-lg border flex items-center ${
                  theme === 'dark' ? 'bg-[#131722] border-[#2a2e39]' : 'bg-[#f0f3fa] border-[#e0e3eb]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setChartType('candles')}
                  title="Candlestick Chart"
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    chartType === 'candles'
                      ? 'bg-[#2962ff] text-white'
                      : 'text-[#787b86] hover:text-white'
                  }`}
                >
                  Candles
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('area')}
                  title="Line Area Chart"
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    chartType === 'area'
                      ? 'bg-[#2962ff] text-white'
                      : 'text-[#787b86] hover:text-white'
                  }`}
                >
                  Area
                </button>
              </div>

              {/* Indicator Overlays Toggles */}
              <button
                type="button"
                onClick={() => setShowSMA(!showSMA)}
                className={`px-2 py-1 text-xs font-mono font-bold rounded-lg border transition-colors ${
                  showSMA
                    ? 'bg-[#ff9800]/20 border-[#ff9800]/50 text-[#ff9800]'
                    : 'border-inherit text-[#787b86]'
                }`}
              >
                SMA 20
              </button>
              <button
                type="button"
                onClick={() => setShowVolume(!showVolume)}
                className={`px-2 py-1 text-xs font-mono font-bold rounded-lg border transition-colors ${
                  showVolume
                    ? 'bg-[#2962ff]/20 border-[#2962ff]/50 text-[#2962ff]'
                    : 'border-inherit text-[#787b86]'
                }`}
              >
                VOL
              </button>

              {/* Timeframes */}
              <div
                className={`p-0.5 rounded-lg border flex items-center ${
                  theme === 'dark' ? 'bg-[#131722] border-[#2a2e39]' : 'bg-[#f0f3fa] border-[#e0e3eb]'
                }`}
              >
                {(['1D', '5D', '1M', '1Y'] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setSelectedTf(tf)}
                    className={`px-2 py-1 rounded text-xs font-semibold font-mono transition-all ${
                      selectedTf === tf
                        ? 'bg-[#2a2e39] text-white font-bold'
                        : 'text-[#787b86] hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive TradingView Pro Chart Canvas */}
          <div
            className={`h-64 sm:h-72 rounded-2xl border p-4 relative flex flex-col justify-between overflow-hidden select-none ${
              theme === 'dark' ? 'bg-[#131722] border-[#2a2e39]' : 'bg-[#f8f9fd] border-[#e0e3eb]'
            }`}
            onMouseLeave={() => setHoveredCandle(null)}
          >
            {/* Background horizontal grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-15">
              <div className="border-b border-current" />
              <div className="border-b border-current" />
              <div className="border-b border-current" />
              <div className="border-b border-current" />
            </div>

            {/* SVG Candlestick & Indicator Layer */}
            <svg
              className="w-full h-full overflow-visible z-10"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              {/* Volume Bars at base */}
              {showVolume && (
                <g opacity="0.25">
                  {candles.map((c, i) => {
                    const x = i * candleSpacing + (candleSpacing - candleWidth) / 2;
                    const vHeight = (c.volume / maxVol) * 45;
                    const y = svgHeight - vHeight;
                    const isGreen = c.close >= c.open;
                    return (
                      <rect
                        key={`vol-${i}`}
                        x={x}
                        y={y}
                        width={candleWidth}
                        height={vHeight}
                        fill={isGreen ? '#089981' : '#f23645'}
                      />
                    );
                  })}
                </g>
              )}

              {/* SMA Line Overlay */}
              {showSMA && (
                <polyline
                  fill="none"
                  points={smaPoints}
                  stroke="#ff9800"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Render either Candles or Area Line */}
              {chartType === 'candles' ? (
                // Candlestick rendering
                candles.map((c, i) => {
                  const x = i * candleSpacing + (candleSpacing - candleWidth) / 2;
                  const centerX = i * candleSpacing + candleSpacing / 2;
                  const isGreen = c.close >= c.open;
                  const candleColor = isGreen ? '#089981' : '#f23645';

                  const yHigh = getY(c.high);
                  const yLow = getY(c.low);
                  const yOpen = getY(c.open);
                  const yClose = getY(c.close);

                  const bodyTop = Math.min(yOpen, yClose);
                  const bodyHeight = Math.max(2, Math.abs(yOpen - yClose));

                  return (
                    <g
                      key={`candle-${i}`}
                      onMouseEnter={() => setHoveredCandle(c)}
                      className="cursor-crosshair"
                    >
                      {/* Upper & Lower Wick */}
                      <line
                        x1={centerX}
                        y1={yHigh}
                        x2={centerX}
                        y2={yLow}
                        stroke={candleColor}
                        strokeWidth="1.5"
                      />
                      {/* Candle Body */}
                      <rect
                        x={x}
                        y={bodyTop}
                        width={candleWidth}
                        height={bodyHeight}
                        fill={candleColor}
                        rx="1"
                      />
                    </g>
                  );
                })
              ) : (
                // Area / Line Chart
                <>
                  <defs>
                    <linearGradient id="proModalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isUp ? '#089981' : '#f23645'} stopOpacity="0.35" />
                      <stop offset="100%" stopColor={isUp ? '#089981' : '#f23645'} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={`0,${svgHeight} ${candles
                      .map((c, i) => `${i * candleSpacing + candleSpacing / 2},${getY(c.close)}`)
                      .join(' ')} ${svgWidth},${svgHeight}`}
                    fill="url(#proModalGrad)"
                  />
                  <polyline
                    fill="none"
                    points={candles
                      .map((c, i) => `${i * candleSpacing + candleSpacing / 2},${getY(c.close)}`)
                      .join(' ')}
                    stroke={isUp ? '#089981' : '#f23645'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </svg>

            {/* Price markers on top and bottom */}
            <div className="flex justify-between text-[11px] font-mono text-[#787b86] z-10 pt-1">
              <span>Low: ${minPrice.toFixed(2)}</span>
              <span>SMA: ${(currentPrice * 0.995).toFixed(2)}</span>
              <span>High: ${maxPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* 1-Click Order Execution Bar */}
          <div
            className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
              theme === 'dark' ? 'bg-[#131722] border-[#2a2e39]' : 'bg-[#f8f9fd] border-[#e0e3eb]'
            }`}
          >
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-[#787b86]">Quick Paper Trade:</span>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-[#787b86]">Shares:</label>
                <input
                  type="number"
                  min={1}
                  value={tradeShares}
                  onChange={(e) => setTradeShares(parseInt(e.target.value) || 1)}
                  className={`w-16 px-2 py-1 text-xs rounded border font-mono ${
                    theme === 'dark' ? 'bg-[#1e222d] border-[#2a2e39] text-white' : 'bg-white border-[#d1d4dc]'
                  }`}
                />
              </div>
              <span className="text-xs font-mono text-[#787b86]">
                Est: ${(tradeShares * currentPrice).toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleQuickTrade('BUY')}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#089981] hover:bg-[#078570] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                BUY / LONG @ ${currentPrice.toFixed(2)}
              </button>
              <button
                type="button"
                onClick={() => handleQuickTrade('SELL')}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#f23645] hover:bg-[#d92c3a] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                SELL / SHORT @ ${currentPrice.toFixed(2)}
              </button>
            </div>
          </div>

          {orderNotice && (
            <div className="p-2.5 rounded-xl bg-[#089981]/15 border border-[#089981]/30 text-[#089981] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{orderNotice}</span>
            </div>
          )}

          {/* Key Fundamentals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className={`p-3 rounded-xl border ${
                theme === 'dark' ? 'bg-[#181b24] border-[#2a2e39]' : 'bg-[#f8f9fd] border-[#e0e3eb]'
              }`}
            >
              <span className="text-[11px] text-[#787b86]">Market Cap</span>
              <p className="text-sm font-bold font-mono">{marketCap}</p>
            </div>
            <div
              className={`p-3 rounded-xl border ${
                theme === 'dark' ? 'bg-[#181b24] border-[#2a2e39]' : 'bg-[#f8f9fd] border-[#e0e3eb]'
              }`}
            >
              <span className="text-[11px] text-[#787b86]">P/E Ratio</span>
              <p className="text-sm font-bold font-mono">{peRatio > 0 ? peRatio.toFixed(1) : '—'}</p>
            </div>
            <div
              className={`p-3 rounded-xl border ${
                theme === 'dark' ? 'bg-[#181b24] border-[#2a2e39]' : 'bg-[#f8f9fd] border-[#e0e3eb]'
              }`}
            >
              <span className="text-[11px] text-[#787b86]">52-Week Range</span>
              <p className="text-xs font-bold font-mono truncate">
                ${yearLow.toFixed(2)} - ${yearHigh.toFixed(2)}
              </p>
            </div>
            <div
              className={`p-3 rounded-xl border ${
                theme === 'dark' ? 'bg-[#181b24] border-[#2a2e39]' : 'bg-[#f8f9fd] border-[#e0e3eb]'
              }`}
            >
              <span className="text-[11px] text-[#787b86]">Analyst Consensus</span>
              <p className="text-sm font-bold text-[#089981]">Strong Buy (88%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
