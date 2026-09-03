import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, Clock, ArrowRight } from 'lucide-react';
import { StockMover, MarketIndex, ThemeMode } from '../types';
import { MARKET_INDICES, STOCK_MOVERS_DATA, INITIAL_TICKERS } from '../data/marketData';

interface SearchModalProps {
  theme: ThemeMode;
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: StockMover | MarketIndex) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  theme,
  isOpen,
  onClose,
  onSelectItem,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Stocks' | 'Indices' | 'Crypto'>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Flatten searchable symbols
  const allStocks = STOCK_MOVERS_DATA['Most active'];
  const allIndices = MARKET_INDICES;

  const filteredItems: Array<{
    type: 'stock' | 'index';
    symbol: string;
    name: string;
    price: string;
    change: string;
    isUp: boolean;
    raw: StockMover | MarketIndex;
  }> = [];

  if (activeFilter === 'All' || activeFilter === 'Indices') {
    allIndices.forEach((idx) => {
      const q = query.toLowerCase();
      if (!q || idx.symbol.toLowerCase().includes(q) || idx.name.toLowerCase().includes(q)) {
        filteredItems.push({
          type: 'index',
          symbol: idx.symbol,
          name: idx.name,
          price: idx.timeframeData['1D'].price,
          change: idx.timeframeData['1D'].pct,
          isUp: idx.timeframeData['1D'].isUp,
          raw: idx,
        });
      }
    });
  }

  if (activeFilter === 'All' || activeFilter === 'Stocks') {
    allStocks.forEach((stk) => {
      const q = query.toLowerCase();
      if (!q || stk.symbol.toLowerCase().includes(q) || stk.name.toLowerCase().includes(q)) {
        filteredItems.push({
          type: 'stock',
          symbol: stk.symbol,
          name: stk.name,
          price: `$${stk.last.toFixed(2)}`,
          change: `${stk.changePct >= 0 ? '+' : ''}${stk.changePct.toFixed(2)}%`,
          isUp: stk.changePct >= 0,
          raw: stk,
        });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-100">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-colors ${
          theme === 'dark'
            ? 'bg-[#1e222d] border-[#2a2e39] text-[#f0f3fa]'
            : 'bg-white border-[#e0e3eb] text-[#131722]'
        }`}
      >
        {/* Search Input Bar */}
        <div
          className={`p-4 border-b flex items-center gap-3 ${
            theme === 'dark' ? 'border-[#2a2e39]' : 'border-[#e0e3eb]'
          }`}
        >
          <Search className="w-5 h-5 text-[#787b86]" />
          <input
            ref={inputRef}
            id="symbol-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbols, companies, or indices (e.g., NVDA, SPX)..."
            className="w-full bg-transparent text-base focus:outline-none placeholder-[#787b86]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#787b86] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-[#787b86] border border-inherit px-2 py-1 rounded"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div
          className={`px-4 py-2.5 border-b flex items-center gap-2 text-xs font-semibold overflow-x-auto no-scrollbar ${
            theme === 'dark' ? 'bg-[#181b24] border-[#2a2e39]' : 'bg-[#f8f9fd] border-[#e0e3eb]'
          }`}
        >
          {(['All', 'Stocks', 'Indices'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeFilter === filter
                  ? 'bg-[#2962ff] text-white'
                  : theme === 'dark'
                  ? 'text-[#787b86] hover:text-[#f0f3fa] hover:bg-[#2a2e39]'
                  : 'text-[#787b86] hover:text-[#131722] hover:bg-[#e0e3eb]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-inherit">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-[#787b86] text-sm">
              No symbols found matching "{query}"
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.symbol}
                onClick={() => {
                  onSelectItem(item.raw);
                  onClose();
                }}
                className={`px-5 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                  theme === 'dark' ? 'hover:bg-[#262b3d]' : 'hover:bg-[#f8f9fd]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      item.type === 'index'
                        ? 'bg-[#2962ff]/20 text-[#2962ff]'
                        : 'bg-[#089981]/20 text-[#089981]'
                    }`}
                  >
                    {item.symbol.slice(0, 3)}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{item.symbol}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-neutral-500/15 text-[#787b86]">
                        {item.type}
                      </span>
                    </div>
                    <span className="text-xs text-[#787b86]">{item.name}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold font-mono text-sm">{item.price}</div>
                  <div
                    className={`text-xs font-semibold ${
                      item.isUp ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {item.change}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer tip */}
        <div
          className={`px-4 py-2 border-t text-[11px] text-[#787b86] flex items-center justify-between ${
            theme === 'dark' ? 'bg-[#181b24] border-[#2a2e39]' : 'bg-[#f8f9fd] border-[#e0e3eb]'
          }`}
        >
          <span>Use ⌘K / Ctrl+K anywhere to search</span>
          <span className="flex items-center gap-1">
            <span>Select to open detailed analysis</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
