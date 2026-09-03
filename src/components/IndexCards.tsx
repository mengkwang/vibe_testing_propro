import React, { useState, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { MarketIndex, Timeframe, ThemeMode } from '../types';

interface IndexCardsProps {
  theme: ThemeMode;
  indices: MarketIndex[];
  onSelectIndex: (index: MarketIndex) => void;
}

interface HoverState {
  x: number;
  y: number;
  price: string;
  time: string;
  active: boolean;
}

export const IndexCards: React.FC<IndexCardsProps> = ({
  theme,
  indices,
  onSelectIndex,
}) => {
  // Store timeframe per index card (default '1D')
  const [timeframes, setTimeframes] = useState<Record<string, Timeframe>>({
    spx: '1D',
    ndx: '1D',
    dji: '1D',
    rut: '1D',
  });

  const [hoverStates, setHoverStates] = useState<Record<string, HoverState>>({});

  const handleTimeframeChange = (indexId: string, tf: Timeframe, e: React.MouseEvent) => {
    e.stopPropagation();
    setTimeframes((prev) => ({ ...prev, [indexId]: tf }));
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    indexId: string,
    pointsStr: string,
    minVal: number,
    maxVal: number,
    timeDomain: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const clientX = Math.max(0, Math.min(rect.width, rawX));
    const ratio = clientX / rect.width;

    // SVG coordinates (viewbox 0 0 100 25)
    const maxSvgX = 100;
    const maxSvgY = 25;
    const svgX = ratio * maxSvgX;

    // Parse points
    const points = pointsStr
      .trim()
      .split(/\s+/)
      .map((pt) => {
        const [px, py] = pt.split(',').map(Number);
        return { x: px, y: py };
      });

    // Interpolate Y
    let svgY = points[0].y;
    if (svgX <= points[0].x) {
      svgY = points[0].y;
    } else if (svgX >= points[points.length - 1].x) {
      svgY = points[points.length - 1].y;
    } else {
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        if (svgX >= p1.x && svgX <= p2.x) {
          const r = (svgX - p1.x) / (p2.x - p1.x);
          svgY = p1.y + r * (p2.y - p1.y);
          break;
        }
      }
    }

    // Interpolate Price
    const yRatio = 1 - svgY / maxSvgY;
    const interpPrice = minVal + yRatio * (maxVal - minVal);
    const formattedPrice = interpPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Time representation
    let timeLabel = '14:35';
    if (timeDomain === 'intraday') {
      const startMin = 570; // 09:30
      const endMin = 960; // 16:00
      const currentMin = Math.round(startMin + ratio * (endMin - startMin));
      const hh = String(Math.floor(currentMin / 60)).padStart(2, '0');
      const mm = String(currentMin % 60).padStart(2, '0');
      timeLabel = `${hh}:${mm}`;
    } else if (timeDomain === 'days') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const idx = Math.min(4, Math.floor(ratio * 5));
      timeLabel = days[idx];
    } else if (timeDomain === 'month') {
      const dayNum = Math.min(30, Math.max(1, Math.round(ratio * 30)));
      timeLabel = `Oct ${dayNum}`;
    } else if (timeDomain === 'year') {
      const months = ['Nov', 'Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];
      const mIdx = Math.min(months.length - 1, Math.floor(ratio * months.length));
      timeLabel = months[mIdx];
    }

    setHoverStates((prev) => ({
      ...prev,
      [indexId]: {
        x: svgX,
        y: svgY,
        price: formattedPrice,
        time: timeLabel,
        active: true,
      },
    }));
  };

  const handleMouseLeave = (indexId: string) => {
    setHoverStates((prev) => ({
      ...prev,
      [indexId]: { ...prev[indexId], active: false },
    }));
  };

  return (
    <section aria-labelledby="indices-heading" className="space-y-4">
      {/* Section Title & Link */}
      <div className="flex items-center">
        <a
          href="#indices"
          id="indices-heading"
          className={`inline-flex items-center gap-1.5 text-2xl font-bold transition-colors group ${
            theme === 'dark'
              ? 'text-[#f0f3fa] hover:text-[#2962ff]'
              : 'text-[#131722] hover:text-[#2962ff]'
          }`}
        >
          <span>Indices</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      {/* Indices Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {indices.map((index) => {
          const currentTf = timeframes[index.id] || '1D';
          const rangeData = index.timeframeData[currentTf];
          const isPositive = rangeData.isUp;
          const strokeColor = isPositive ? '#089981' : '#f23645';
          const hover = hoverStates[index.id];

          return (
            <article
              key={index.id}
              id={`index-card-${index.id}`}
              onClick={() => onSelectIndex(index)}
              className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md relative ${
                theme === 'dark'
                  ? 'bg-[#1e222d] hover:bg-[#262b3d] border-[#2a2e39] hover:border-[#363a45]'
                  : 'bg-[#f8f9fd] hover:bg-[#f0f3fa] border-[#e0e3eb] hover:border-[#d1d4dc]'
              }`}
            >
              {/* Header Row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-sm"
                    style={{ backgroundColor: index.badgeBg }}
                  >
                    {index.badgeNumber}
                  </span>
                  <div>
                    <h3
                      className={`font-bold text-base ${
                        theme === 'dark' ? 'text-[#f0f3fa]' : 'text-[#131722]'
                      }`}
                    >
                      {index.name}
                    </h3>
                    <span className="text-xs text-[#787b86] uppercase font-semibold">
                      {index.exchange}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                    isPositive
                      ? 'bg-[rgba(8,153,129,0.15)] text-[#089981]'
                      : 'bg-[rgba(242,54,69,0.15)] text-[#f23645]'
                  }`}
                >
                  {rangeData.pct}
                </span>
              </div>

              {/* Time Range Toggles */}
              <div
                className={`mt-3 flex items-center justify-between border-b pb-2.5 ${
                  theme === 'dark' ? 'border-[#2a2e39]/60' : 'border-[#e0e3eb]'
                }`}
              >
                <div
                  className={`inline-flex p-0.5 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-[#171b24] border-[#2a2e39]/80'
                      : 'bg-white border-[#e0e3eb]'
                  }`}
                  role="tablist"
                  onClick={(e) => e.stopPropagation()}
                >
                  {(['1D', '5D', '1M', '1Y'] as Timeframe[]).map((tf) => {
                    const activeTf = currentTf === tf;
                    return (
                      <button
                        key={tf}
                        id={`tf-${index.id}-${tf}`}
                        type="button"
                        onClick={(e) => handleTimeframeChange(index.id, tf, e)}
                        className={`px-2.5 py-0.5 text-xs rounded-md transition-all ${
                          activeTf
                            ? theme === 'dark'
                              ? 'font-semibold bg-[#2a2e39] text-[#f0f3fa] shadow-sm'
                              : 'font-semibold bg-[#131722] text-white shadow-sm'
                            : 'font-medium text-[#787b86] hover:text-[#d1d4dc]'
                        }`}
                      >
                        {tf}
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] font-mono text-[#787b86] tracking-tight">
                  {index.exchangeShort}
                </span>
              </div>

              {/* Price & Change Row */}
              <div className="mt-3 flex items-baseline justify-between">
                <span
                  className={`text-2xl font-bold font-mono tracking-tight ${
                    theme === 'dark' ? 'text-[#f0f3fa]' : 'text-[#131722]'
                  }`}
                >
                  {hover?.active ? hover.price : rangeData.price}
                </span>
                <span
                  className={`text-xs font-semibold font-mono flex items-center gap-0.5 ${
                    isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {rangeData.change}
                </span>
              </div>

              {/* Interactive SVG Gradient Area Sparkline with Volume Bars */}
              <div
                className="mt-3 h-12 w-full sparkline-interactive select-none relative"
                onMouseMove={(e) =>
                  handleMouseMove(
                    e,
                    index.id,
                    rangeData.points,
                    rangeData.min,
                    rangeData.max,
                    rangeData.timeDomain
                  )
                }
                onMouseLeave={() => handleMouseLeave(index.id)}
              >
                <svg
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 25"
                >
                  <defs>
                    <linearGradient id={`grad-${index.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={strokeColor} stopOpacity="0.32" />
                      <stop offset="85%" stopColor={strokeColor} stopOpacity="0.04" />
                      <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Micro volume histogram bars at base */}
                  <g opacity="0.25">
                    <rect x="5" y="21" width="3" height="4" fill={strokeColor} />
                    <rect x="18" y="19" width="3" height="6" fill={strokeColor} />
                    <rect x="32" y="17" width="3" height="8" fill={strokeColor} />
                    <rect x="46" y="20" width="3" height="5" fill={strokeColor} />
                    <rect x="60" y="15" width="3" height="10" fill={strokeColor} />
                    <rect x="74" y="18" width="3" height="7" fill={strokeColor} />
                    <rect x="88" y="14" width="3" height="11" fill={strokeColor} />
                  </g>

                  {/* Area fill under curve */}
                  <polygon
                    points={`0,25 ${rangeData.points} 100,25`}
                    fill={`url(#grad-${index.id})`}
                  />

                  {/* Stroke curve line */}
                  <polyline
                    fill="none"
                    points={rangeData.points}
                    stroke={strokeColor}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />

                  {hover?.active && (
                    <>
                      {/* Vertical crosshair line */}
                      <line
                        x1={hover.x}
                        x2={hover.x}
                        y1="0"
                        y2="25"
                        stroke="#787b86"
                        strokeDasharray="2 2"
                        strokeWidth="1"
                      />
                      {/* Tracking dot */}
                      <circle
                        cx={hover.x}
                        cy={hover.y}
                        r="3.5"
                        fill={strokeColor}
                        stroke={theme === 'dark' ? '#1e222d' : '#ffffff'}
                        strokeWidth="1.5"
                      />
                    </>
                  )}
                </svg>

                {/* Floating Tooltip */}
                {hover?.active && (
                  <div
                    className={`sparkline-tooltip absolute pointer-events-none -top-9 z-40 text-[11px] font-mono px-2 py-1 rounded shadow-lg backdrop-blur-sm flex items-center gap-1.5 border transition-all ${
                      theme === 'dark'
                        ? 'bg-[#131722]/95 border-[#2a2e39] text-[#f0f3fa]'
                        : 'bg-white/95 border-[#e0e3eb] text-[#131722]'
                    }`}
                    style={{
                      left: `${(hover.x / 100) * 100}%`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <span className="text-[#787b86]">{hover.time}</span>
                    <span
                      className="font-semibold"
                      style={{ color: strokeColor }}
                    >
                      {hover.price}
                    </span>
                  </div>
                )}
              </div>

              {/* Day Range Bar */}
              <div className="mt-2.5 pt-2 border-t border-inherit flex items-center justify-between text-[10px] font-mono text-[#787b86]">
                <span>L: {index.dayLow > 1000 ? index.dayLow.toLocaleString() : index.dayLow.toFixed(2)}</span>
                <div className="flex-1 mx-2 h-1 bg-black/15 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-[#2962ff] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          ((parseFloat(rangeData.price.replace(/,/g, '')) - index.dayLow) /
                            (index.dayHigh - index.dayLow || 1)) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
                <span>H: {index.dayHigh > 1000 ? index.dayHigh.toLocaleString() : index.dayHigh.toFixed(2)}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
