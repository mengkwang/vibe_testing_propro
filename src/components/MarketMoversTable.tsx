import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Table as TableIcon,
  PieChart,
  Search,
  Star,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { StockMover, MoverTab, ThemeMode, ScreenerViewMode } from '../types';
import { STOCK_MOVERS_DATA } from '../data/marketData';
import { playTickSound } from '../utils/soundEffects';

interface MarketMoversTableProps {
  theme: ThemeMode;
  onSelectStock: (stock: StockMover) => void;
  soundEnabled?: boolean;
}

type SortField = 'symbol' | 'last' | 'changePct' | 'volume' | 'marketCap' | 'peRatio';

export const MarketMoversTable: React.FC<MarketMoversTableProps> = ({
  theme,
  onSelectStock,
  soundEnabled = true,
}) => {
  const [activeTab, setActiveTab] = useState<MoverTab>('Most active');
  const [viewMode, setViewMode] = useState<ScreenerViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('changePct');
  const [sortAsc, setSortAsc] = useState(false);
  const [hoveredRowSymbol, setHoveredRowSymbol] = useState<string | null>(null);

  const tabs: MoverTab[] = [
    'Most active',
    'Gainers',
    'Losers',
    'All-time high',
    'Overbought',
    'Oversold',
  ];

  // Base list
  const baseStocks = useMemo(() => {
    return STOCK_MOVERS_DATA[activeTab] || STOCK_MOVERS_DATA['Most active'] || [];
  }, [activeTab]);

  // Filtered & sorted list
  const processedStocks = useMemo(() => {
    let list = [...baseStocks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortField === 'symbol') {
        return sortAsc ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol);
      }

      let valA = 0;
      let valB = 0;

      if (sortField === 'last') {
        valA = a.last;
        valB = b.last;
      } else if (sortField === 'changePct') {
        valA = a.changePct;
        valB = b.changePct;
      } else if (sortField === 'volume') {
        valA = parseFloat(a.volume.replace('M', '').replace('B', ''));
        valB = parseFloat(b.volume.replace('M', '').replace('B', ''));
      } else if (sortField === 'marketCap') {
        valA = parseFloat(a.marketCap.replace('$', '').replace('T', '000').replace('B', ''));
        valB = parseFloat(b.marketCap.replace('$', '').replace('T', '000').replace('B', ''));
      } else if (sortField === 'peRatio') {
        valA = a.peRatio;
        valB = b.peRatio;
      }

      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    return list;
  }, [baseStocks, searchQuery, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    playTickSound(soundEnabled);
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const renderRatingBadge = (rating: StockMover['rating']) => {
    if (rating === 'Strong Buy' || rating === 'Buy') {
      return (
        <span
          className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md ${
            theme === 'dark' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#e8f7f5] text-[#089981]'
          }`}
        >
          {rating}
        </span>
      );
    }
    if (rating === 'Neutral') {
      return (
        <span
          className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-md ${
            theme === 'dark' ? 'bg-[#2a2e39] text-[#787b86]' : 'bg-[#f0f3fa] text-[#787b86]'
          }`}
        >
          Neutral
        </span>
      );
    }
    return (
      <span
        className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md ${
          theme === 'dark' ? 'bg-[#f23645]/20 text-[#f23645]' : 'bg-[#fdecee] text-[#f23645]'
        }`}
      >
        {rating}
      </span>
    );
  };

  return (
    <section aria-labelledby="movers-heading" className="space-y-4">
      {/* Table Header Bar with Tabs & View Mode Controls */}
      <div
        className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b pb-3 ${
          theme === 'dark' ? 'border-[#2a2e39]' : 'border-[#e0e3eb]'
        }`}
      >
        <div className="flex items-center gap-3">
          <h2
            id="movers-heading"
            className={`text-xl sm:text-2xl font-bold tracking-tight ${
              theme === 'dark' ? 'text-[#f0f3fa]' : 'text-[#131722]'
            }`}
          >
            Market Screener & Movers
          </h2>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono rounded-full bg-[#2962ff]/10 text-[#2962ff] font-bold border border-[#2962ff]/20">
            {processedStocks.length} ASSETS
          </span>
        </div>

        {/* Action Controls: Search, View Mode, and Tabs */}
        <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
          {/* In-table Filter Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#787b86]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter symbols..."
              className={`pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none font-mono transition-colors ${
                theme === 'dark'
                  ? 'bg-[#1e222d] border-[#2a2e39] text-white focus:border-[#2962ff]'
                  : 'bg-[#f0f3fa] border-[#d1d4dc] text-[#131722] focus:border-[#2962ff]'
              }`}
            />
          </div>

          {/* View Mode Toggle Switcher */}
          <div
            className={`flex items-center p-0.5 rounded-lg border ${
              theme === 'dark' ? 'bg-[#171b24] border-[#2a2e39]' : 'bg-[#f0f3fa] border-[#e0e3eb]'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                playTickSound(soundEnabled);
                setViewMode('table');
              }}
              title="Table View"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#2962ff] text-white shadow-xs'
                  : 'text-[#787b86] hover:text-white'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                playTickSound(soundEnabled);
                setViewMode('heatmap');
              }}
              title="Market Heatmap"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'heatmap'
                  ? 'bg-[#2962ff] text-white shadow-xs'
                  : 'text-[#787b86] hover:text-white'
              }`}
            >
              <PieChart className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                playTickSound(soundEnabled);
                setViewMode('grid');
              }}
              title="Grid Cards View"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#2962ff] text-white shadow-xs'
                  : 'text-[#787b86] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Screener Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              id={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => {
                playTickSound(soundEnabled);
                setActiveTab(tab);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? theme === 'dark'
                    ? 'bg-[#2a2e39] text-[#f0f3fa] font-bold shadow-xs'
                    : 'bg-[#131722] text-white font-bold shadow-xs'
                  : theme === 'dark'
                  ? 'font-medium text-[#787b86] hover:text-[#f0f3fa] hover:bg-[#1e222d]'
                  : 'font-medium text-[#787b86] hover:text-[#131722] hover:bg-[#f0f3fa]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 1. TABLE VIEW */}
      {viewMode === 'table' && (
        <div
          className={`overflow-x-auto rounded-2xl border shadow-xs transition-colors ${
            theme === 'dark' ? 'bg-[#1e222d] border-[#2a2e39]' : 'bg-white border-[#e0e3eb]'
          }`}
        >
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr
                className={`border-b text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark'
                    ? 'bg-[#181b24] border-[#2a2e39] text-[#787b86]'
                    : 'bg-[#f8f9fd] border-[#e0e3eb] text-[#787b86]'
                }`}
              >
                <th
                  onClick={() => handleSort('symbol')}
                  className="py-3 pl-5 pr-4 text-left font-semibold cursor-pointer select-none hover:text-[#2962ff]"
                  scope="col"
                >
                  <div className="flex items-center gap-1">
                    <span>Symbol / Company</span>
                    {sortField === 'symbol' && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('last')}
                  className="py-3 px-4 text-right font-semibold cursor-pointer select-none hover:text-[#2962ff]"
                  scope="col"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Last</span>
                    {sortField === 'last' && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('changePct')}
                  className="py-3 px-4 text-right font-semibold cursor-pointer select-none hover:text-[#2962ff]"
                  scope="col"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Chg %</span>
                    {sortField === 'changePct' && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 text-right font-semibold hidden sm:table-cell" scope="col">
                  Chg $
                </th>
                <th className="py-3 px-4 text-center hidden md:table-cell font-semibold" scope="col">
                  Trend (1D)
                </th>
                <th
                  onClick={() => handleSort('volume')}
                  className="py-3 px-4 text-right hidden lg:table-cell font-semibold cursor-pointer select-none hover:text-[#2962ff]"
                  scope="col"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Volume</span>
                    {sortField === 'volume' && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('marketCap')}
                  className="py-3 px-4 text-right hidden xl:table-cell font-semibold cursor-pointer select-none hover:text-[#2962ff]"
                  scope="col"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Mkt Cap</span>
                    {sortField === 'marketCap' && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('peRatio')}
                  className="py-3 px-4 text-right hidden xl:table-cell font-semibold cursor-pointer select-none hover:text-[#2962ff]"
                  scope="col"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>P/E</span>
                    {sortField === 'peRatio' && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 pr-5 pl-4 text-right font-semibold" scope="col">
                  Analyst Rating
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y font-medium ${
                theme === 'dark' ? 'divide-[#2a2e39]' : 'divide-[#e0e3eb]'
              }`}
            >
              {processedStocks.map((stock) => {
                const isUp = stock.change >= 0;
                const strokeColor = isUp ? '#089981' : '#f23645';

                return (
                  <tr
                    key={stock.symbol}
                    id={`stock-row-${stock.symbol.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                    onClick={() => {
                      playTickSound(soundEnabled);
                      onSelectStock(stock);
                    }}
                    onMouseEnter={() => setHoveredRowSymbol(stock.symbol)}
                    onMouseLeave={() => setHoveredRowSymbol(null)}
                    className={`transition-colors cursor-pointer group ${
                      theme === 'dark' ? 'hover:bg-[#262b3d]' : 'hover:bg-[#f8f9fd]'
                    }`}
                  >
                    {/* Symbol / Company */}
                    <td className="py-3.5 pl-5 pr-4 flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs"
                        style={{
                          backgroundColor: stock.badgeBg,
                          color: stock.badgeTextColor,
                          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        }}
                      >
                        {stock.symbol.slice(0, 3)}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`font-bold font-mono text-sm leading-snug group-hover:text-[#2962ff] transition-colors ${
                            theme === 'dark' ? 'text-[#f0f3fa]' : 'text-[#131722]'
                          }`}
                        >
                          {stock.symbol}
                        </span>
                        <span className="text-xs text-[#787b86] truncate max-w-[140px] sm:max-w-[200px]">
                          {stock.name}
                        </span>
                      </div>
                    </td>

                    {/* Last Price */}
                    <td
                      className={`py-3.5 px-4 text-right font-mono font-bold ${
                        theme === 'dark' ? 'text-[#f0f3fa]' : 'text-[#131722]'
                      }`}
                    >
                      ${stock.last > 1000 ? stock.last.toLocaleString() : stock.last.toFixed(2)}
                    </td>

                    {/* Change % */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold ${
                          isUp
                            ? 'bg-[#089981]/15 text-[#089981]'
                            : 'bg-[#f23645]/15 text-[#f23645]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {stock.changePct.toFixed(2)}%
                      </span>
                    </td>

                    {/* Change $ */}
                    <td
                      className={`py-3.5 px-4 text-right font-mono text-xs hidden sm:table-cell font-semibold ${
                        isUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isUp ? '+' : ''}${stock.change.toFixed(2)}
                    </td>

                    {/* Trend Sparkline with Gradient */}
                    <td className="py-3.5 px-4 text-center hidden md:table-cell">
                      <div className="w-20 h-6 mx-auto relative">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 60 15">
                          <polyline
                            fill="none"
                            points={stock.trendPoints}
                            stroke={strokeColor}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-[#787b86] hidden lg:table-cell">
                      {stock.volume}
                    </td>

                    {/* Market Cap */}
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-[#787b86] hidden xl:table-cell">
                      {stock.marketCap}
                    </td>

                    {/* P/E Ratio */}
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-[#787b86] hidden xl:table-cell">
                      {stock.peRatio > 0 ? stock.peRatio.toFixed(1) : '—'}
                    </td>

                    {/* Rating Badge */}
                    <td className="py-3.5 pr-5 pl-4 text-right">
                      {renderRatingBadge(stock.rating)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. PRO MARKET HEATMAP VIEW (Finviz / TradingView Style) */}
      {viewMode === 'heatmap' && (
        <div
          className={`p-4 rounded-2xl border shadow-xs ${
            theme === 'dark' ? 'bg-[#1e222d] border-[#2a2e39]' : 'bg-white border-[#e0e3eb]'
          }`}
        >
          <div className="flex items-center justify-between mb-3 text-xs text-[#787b86]">
            <span>Heatmap sized by Market Cap • Colored by % Change</span>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#f23645]" /> &lt; -2%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#2a2e39]" /> Neutral
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#089981]" /> &gt; +2%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 min-h-[320px]">
            {processedStocks.map((stock) => {
              const pct = stock.changePct;
              let bg = '#2a2e39';
              if (pct >= 4) bg = '#065f46';
              else if (pct >= 2) bg = '#047857';
              else if (pct > 0) bg = '#064e3b';
              else if (pct <= -4) bg = '#991b1b';
              else if (pct <= -2) bg = '#b91c1c';
              else if (pct < 0) bg = '#7f1d1d';

              return (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    playTickSound(soundEnabled);
                    onSelectStock(stock);
                  }}
                  style={{ backgroundColor: bg }}
                  className="p-3 rounded-xl flex flex-col justify-between cursor-pointer transition-transform hover:scale-[1.03] shadow-sm text-white select-none relative group border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold font-mono text-sm tracking-tight">{stock.symbol}</span>
                    <span className="text-[10px] opacity-80">{stock.sector.slice(0, 10)}</span>
                  </div>
                  <div className="my-2">
                    <p className="text-base font-extrabold font-mono leading-tight">
                      {pct >= 0 ? '+' : ''}
                      {pct.toFixed(2)}%
                    </p>
                    <p className="text-xs opacity-90 font-mono">${stock.last.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] opacity-75 font-mono">
                    <span>{stock.marketCap}</span>
                    <span>Vol: {stock.volume}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. PERFORMANCE GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {processedStocks.map((stock) => {
            const isUp = stock.change >= 0;
            const strokeColor = isUp ? '#089981' : '#f23645';

            return (
              <div
                key={stock.symbol}
                onClick={() => {
                  playTickSound(soundEnabled);
                  onSelectStock(stock);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                  theme === 'dark'
                    ? 'bg-[#1e222d] hover:bg-[#262b3d] border-[#2a2e39] hover:border-[#363a45]'
                    : 'bg-white hover:bg-[#f8f9fd] border-[#e0e3eb] hover:border-[#d1d4dc]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                      style={{ backgroundColor: stock.badgeBg }}
                    >
                      {stock.symbol.slice(0, 3)}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{stock.symbol}</h4>
                      <p className="text-[10px] text-[#787b86] truncate max-w-[120px]">{stock.name}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isUp ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
                    }`}
                  >
                    {isUp ? '+' : ''}
                    {stock.changePct.toFixed(2)}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between my-2">
                  <span className="text-xl font-bold font-mono">
                    ${stock.last > 1000 ? stock.last.toLocaleString() : stock.last.toFixed(2)}
                  </span>
                  <span className={`text-xs font-mono font-semibold ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                    {isUp ? '+' : ''}${stock.change.toFixed(2)}
                  </span>
                </div>

                {/* Mini SVG Sparkline */}
                <div className="h-10 w-full my-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 60 15">
                    <polyline
                      fill="none"
                      points={stock.trendPoints}
                      stroke={strokeColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="pt-2 border-t border-inherit flex items-center justify-between text-[11px] text-[#787b86]">
                  <span>Vol: {stock.volume}</span>
                  <span>{renderRatingBadge(stock.rating)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
