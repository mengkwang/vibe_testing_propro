import React, { useState, useEffect } from 'react';
import { LiveTickerItem, ThemeMode } from '../types';

interface LiveTickerBarProps {
  theme: ThemeMode;
  initialTickers: LiveTickerItem[];
  onSelectTicker?: (symbol: string) => void;
}

export const LiveTickerBar: React.FC<LiveTickerBarProps> = ({
  theme,
  initialTickers,
  onSelectTicker,
}) => {
  const [tickers, setTickers] = useState<LiveTickerItem[]>(initialTickers);
  const [lastUpdatedSymbol, setLastUpdatedSymbol] = useState<string | null>(null);

  // Micro-simulation of real-time ticks
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random ticker to subtly fluctuate
      const randomIndex = Math.floor(Math.random() * tickers.length);
      const target = tickers[randomIndex];

      // Parse price
      let raw = parseFloat(target.price.replace(/,/g, '').replace('%', ''));
      if (isNaN(raw)) return;

      const deltaFactor = (Math.random() - 0.49) * 0.002;
      const newRaw = raw * (1 + deltaFactor);

      let formattedPrice = '';
      if (target.type === 'forex') {
        formattedPrice = newRaw.toFixed(4);
      } else if (target.type === 'bond') {
        formattedPrice = `${newRaw.toFixed(2)}%`;
      } else if (newRaw > 1000) {
        formattedPrice = newRaw.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      } else {
        formattedPrice = newRaw.toFixed(2);
      }

      const isUp = deltaFactor >= 0;
      const currentPct = parseFloat(target.change.replace('%', '').replace('+', ''));
      const newPct = (currentPct + deltaFactor * 10).toFixed(2);
      const formattedChange = `${parseFloat(newPct) >= 0 ? '+' : ''}${newPct}%`;

      setTickers((prev) =>
        prev.map((item, idx) =>
          idx === randomIndex
            ? { ...item, price: formattedPrice, change: formattedChange, isUp }
            : item
        )
      );

      setLastUpdatedSymbol(target.symbol);
      const timeout = setTimeout(() => setLastUpdatedSymbol(null), 1200);
      return () => clearTimeout(timeout);
    }, 3800);

    return () => clearInterval(interval);
  }, [tickers]);

  return (
    <section
      aria-label="Live Market Ticker"
      id="live-market-ticker"
      className={`border-b py-2 overflow-x-auto no-scrollbar transition-colors duration-200 select-none ${
        theme === 'dark'
          ? 'bg-[#131722] border-[#2a2e39]'
          : 'bg-[#f8f9fd] border-[#e0e3eb]'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 flex items-center space-x-6 text-xs whitespace-nowrap">
        {tickers.map((item, index) => {
          const isFlashing = lastUpdatedSymbol === item.symbol;
          return (
            <React.Fragment key={item.id}>
              <div
                onClick={() => onSelectTicker?.(item.symbol)}
                className={`flex items-center space-x-2 cursor-pointer transition-all duration-150 rounded px-1.5 py-0.5 ${
                  isFlashing
                    ? item.isUp
                      ? 'bg-[#089981]/15'
                      : 'bg-[#f23645]/15'
                    : 'hover:opacity-80'
                }`}
                title={`Click to analyze ${item.symbol}`}
              >
                <span
                  className={`font-bold ${
                    theme === 'dark' ? 'text-[#f0f3fa]' : 'text-[#131722]'
                  }`}
                >
                  {item.symbol}
                </span>
                <span
                  className={`font-medium ${
                    theme === 'dark' ? 'text-[#d1d4dc]' : 'text-[#131722]'
                  }`}
                >
                  {item.price}
                </span>
                <span
                  className={`font-semibold flex items-center ${
                    item.isUp ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {item.change}
                </span>
              </div>
              {index < tickers.length - 1 && (
                <div
                  className={`h-3 w-[1px] ${
                    theme === 'dark' ? 'bg-[#2a2e39]' : 'bg-[#e0e3eb]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};
