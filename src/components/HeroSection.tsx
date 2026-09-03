import React, { useState } from 'react';
import { ChevronDown, Check, Globe2 } from 'lucide-react';
import { CategoryType, ThemeMode } from '../types';
import { CATEGORIES, REGIONS } from '../data/marketData';

interface HeroSectionProps {
  theme: ThemeMode;
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  theme,
  selectedCategory,
  onSelectCategory,
  selectedRegion,
  onSelectRegion,
}) => {
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);

  const currentRegionLabel =
    REGIONS.find((r) => r.id === selectedRegion)?.label || 'United States';

  return (
    <section className="text-center pt-4 pb-4 sm:pb-6 relative">
      {/* Title with Dropdown Chevron */}
      <div className="relative inline-block">
        <button
          id="markets-everywhere-header-btn"
          type="button"
          onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
          className="inline-flex items-center justify-center gap-3 cursor-pointer group focus:outline-none"
          aria-expanded={regionDropdownOpen}
          aria-haspopup="true"
        >
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight transition-colors ${
              theme === 'dark'
                ? 'text-[#f0f3fa] group-hover:text-[#2962ff]'
                : 'text-[#131722] group-hover:text-[#2962ff]'
            }`}
          >
            Markets, everywhere
          </h1>
          <ChevronDown
            className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-transform duration-200 stroke-[2.5] ${
              regionDropdownOpen ? 'rotate-180 text-[#2962ff]' : ''
            } ${
              theme === 'dark'
                ? 'text-[#f0f3fa] group-hover:text-[#2962ff]'
                : 'text-[#131722] group-hover:text-[#2962ff]'
            }`}
          />
        </button>

        {/* Region selector popup */}
        {regionDropdownOpen && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 mt-3 w-64 rounded-2xl p-2 shadow-2xl border z-40 text-left animate-in fade-in zoom-in-95 duration-150 ${
              theme === 'dark'
                ? 'bg-[#1e222d] border-[#2a2e39] text-[#f0f3fa]'
                : 'bg-white border-[#e0e3eb] text-[#131722]'
            }`}
          >
            <div className="px-3 py-2 border-b border-inherit flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-[#2962ff]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#787b86]">
                Market Region
              </span>
            </div>
            <div className="py-1 space-y-0.5">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    onSelectRegion(r.id);
                    setRegionDropdownOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm flex items-center justify-between transition-colors ${
                    selectedRegion === r.id
                      ? theme === 'dark'
                        ? 'bg-[#2a2e39] text-[#2962ff] font-bold'
                        : 'bg-[#f0f3fa] text-[#2962ff] font-bold'
                      : theme === 'dark'
                      ? 'hover:bg-[#2a2e39]/60 text-[#d1d4dc]'
                      : 'hover:bg-[#f0f3fa] text-[#131722]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#787b86] px-1.5 py-0.5 rounded bg-black/10">
                      {r.code}
                    </span>
                    {r.label}
                  </span>
                  {selectedRegion === r.id && <Check className="w-4 h-4 text-[#2962ff]" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Region subtitle hint if not default */}
      {selectedRegion !== 'us' && (
        <div className="mt-1">
          <span className="text-xs font-medium text-[#2962ff] bg-[#2962ff]/10 px-3 py-1 rounded-full">
            Viewing {currentRegionLabel}
          </span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="mt-6 sm:mt-8 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              id={`filter-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-4 sm:px-5 py-2 rounded-full text-sm transition-all duration-150 whitespace-nowrap cursor-pointer ${
                isActive
                  ? theme === 'dark'
                    ? 'bg-[#2a2e39] text-[#f0f3fa] font-semibold shadow-sm border border-[#363a45]'
                    : 'bg-[#131722] text-white font-semibold shadow-sm'
                  : theme === 'dark'
                  ? 'font-medium text-[#787b86] hover:text-[#f0f3fa] hover:bg-[#1e222d]'
                  : 'font-medium text-[#787b86] hover:text-[#131722] hover:bg-[#f0f3fa]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </section>
  );
};
