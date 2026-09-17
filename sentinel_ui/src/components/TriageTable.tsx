import React, { useState, useMemo } from 'react';
import { Search, Flame, Layers } from 'lucide-react';
import type { TenderSummary } from '../types';
import { PriorityBadge } from './PriorityBadge';

interface TriageTableProps {
  tenders: TenderSummary[];
  selectedTenderId: string | null;
  onSelectTender: (id: string) => void;
  isLoading: boolean;
}

export const TriageTable: React.FC<TriageTableProps> = ({
  tenders,
  selectedTenderId,
  onSelectTender,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCpv, setSelectedCpv] = useState<string | null>(null);
  const [selectedPriorityTab, setSelectedPriorityTab] = useState<'ALL' | 'CRIMSON' | 'AMBER' | 'CLEARED'>('ALL');

  // Sector categories matching Indian CPV reference data
  const sectors = useMemo(() => {
    const map: Record<string, { label: string; count: number; outliers: number }> = {
      '45233120-6': { label: 'NHAI Roads', count: 0, outliers: 0 },
      '33115100-3': { label: 'AIIMS Healthcare', count: 0, outliers: 0 },
      '72200000-7': { label: 'MeitY IT', count: 0, outliers: 0 },
      '35610000-8': { label: 'DRDO Defense', count: 0, outliers: 0 },
      '55524000-9': { label: 'PM-POSHAN Meals', count: 0, outliers: 0 },
      '30192000-1': { label: 'GeM Supplies', count: 0, outliers: 0 },
    };

    tenders.forEach((t) => {
      if (map[t.cpv_code]) {
        map[t.cpv_code].count += 1;
        if (t.priority_score >= 80) map[t.cpv_code].outliers += 1;
      }
    });

    return map;
  }, [tenders]);

  // Format currency into Crores / Lakhs
  const formatINR = (val: number) => {
    if (val >= 10000000) {
      return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    }
    return `₹ ${(val / 100000).toFixed(1)} L`;
  };

  // Filter tenders based on search, CPV, and priority tab
  const filteredTenders = useMemo(() => {
    return tenders.filter((t) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.buyer_name.toLowerCase().includes(q) ||
          t.winner_name.toLowerCase().includes(q) ||
          t.cpv_code.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 2. CPV filter
      if (selectedCpv && t.cpv_code !== selectedCpv) {
        return false;
      }

      // 3. Priority tab filter
      if (selectedPriorityTab === 'CRIMSON' && t.priority_score < 80) return false;
      if (selectedPriorityTab === 'AMBER' && (t.priority_score < 50 || t.priority_score >= 80)) return false;
      if (selectedPriorityTab === 'CLEARED' && (t.priority_score >= 50 && !t.dampened)) return false;

      return true;
    });
  }, [tenders, searchQuery, selectedCpv, selectedPriorityTab]);

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border select-none">
      {/* Search & Header */}
      <div className="p-3 border-b border-border space-y-2.5 bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200">
            <Layers className="w-3.5 h-3.5 text-signal-cobalt" />
            <span className="uppercase tracking-wider">Triage Queue</span>
            <span className="text-[10px] text-slate-400 font-normal">({filteredTenders.length})</span>
          </div>

          {/* Quick tab filter */}
          <div className="flex items-center gap-1 bg-canvas p-0.5 rounded border border-border text-[10px] font-mono">
            <button
              onClick={() => setSelectedPriorityTab('ALL')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                selectedPriorityTab === 'ALL' ? 'bg-surface-hover text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedPriorityTab('CRIMSON')}
              className={`px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-colors ${
                selectedPriorityTab === 'CRIMSON' ? 'bg-signal-critical/20 text-signal-critical font-bold' : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              <Flame className="w-2.5 h-2.5" /> &ge;80
            </button>
            <button
              onClick={() => setSelectedPriorityTab('AMBER')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                selectedPriorityTab === 'AMBER' ? 'bg-signal-amber/20 text-signal-amber font-semibold' : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              50–79
            </button>
            <button
              onClick={() => setSelectedPriorityTab('CLEARED')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                selectedPriorityTab === 'CLEARED' ? 'bg-signal-emerald/20 text-signal-emerald font-semibold' : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              Cleared
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tender ID, Indian vendor, procuring authority..."
            className="w-full pl-8 pr-3 py-1.5 bg-canvas border border-border rounded text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-signal-cobalt transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* SectorFacetFilter: Multi-select CPV pills with baseline outlier counts */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px] font-mono">
          <button
            onClick={() => setSelectedCpv(null)}
            className={`px-2 py-0.5 rounded border whitespace-nowrap transition-all ${
              selectedCpv === null
                ? 'bg-surface-hover border-border-muted text-white font-medium'
                : 'bg-canvas border-border text-slate-400 hover:border-border-muted'
            }`}
          >
            All Sectors
          </button>
          {Object.entries(sectors).map(([cpv, data]) => {
            const isSelected = selectedCpv === cpv;
            return (
              <button
                key={cpv}
                onClick={() => setSelectedCpv(isSelected ? null : cpv)}
                className={`px-1.5 py-0.5 rounded border whitespace-nowrap flex items-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-signal-cobalt/20 border-signal-cobalt text-signal-cobalt font-semibold'
                    : 'bg-canvas border-border text-slate-400 hover:border-border-muted'
                }`}
              >
                <span>{data.label}</span>
                {data.outliers > 0 && (
                  <span className="px-1 bg-signal-critical/20 text-signal-critical font-bold rounded">
                    {data.outliers}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Triage Table List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/50">
        {isLoading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-400 flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-signal-cobalt border-t-transparent rounded-full animate-spin" />
            <span>Scanning Procurement Ledger...</span>
          </div>
        ) : filteredTenders.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">
            No procurement tenders match the active criteria.
          </div>
        ) : (
          filteredTenders.map((t) => {
            const isSelected = t.id === selectedTenderId;
            return (
              <div
                key={t.id}
                onClick={() => onSelectTender(t.id)}
                className={`p-2.5 cursor-pointer transition-all duration-120 hover:bg-surface-hover/70 border-l-2 ${
                  isSelected
                    ? 'bg-surface-hover border-l-signal-cobalt shadow-xs'
                    : t.priority_score >= 80
                    ? 'border-l-signal-critical bg-signal-critical/5'
                    : t.priority_score >= 50
                    ? 'border-l-signal-amber bg-signal-amber/5'
                    : 'border-l-transparent'
                }`}
              >
                {/* Row 1: Priority Badge + ID + Value in INR */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <PriorityBadge
                      score={t.priority_score}
                      decomposition={t.decomposition}
                      dampened={t.dampened}
                      size="sm"
                    />
                    <span className="font-mono text-xs font-bold text-slate-200">{t.id}</span>
                    {t.has_cartel_ring && (
                      <span className="px-1 py-0.2 bg-signal-critical/15 border border-signal-critical/30 text-[9px] font-mono text-signal-critical font-semibold rounded">
                        CARTEL RING
                      </span>
                    )}
                    {t.dampened && (
                      <span className="px-1 py-0.2 bg-signal-emerald/15 border border-signal-emerald/30 text-[9px] font-mono text-signal-emerald font-semibold rounded">
                        GFR 166 PAC -80%
                      </span>
                    )}
                  </div>

                  <div className="font-mono font-bold text-xs text-slate-100 tabular-nums">
                    {formatINR(t.amount)}
                  </div>
                </div>

                {/* Row 2: Title */}
                <div className="text-[11px] font-medium text-slate-300 line-clamp-1 mb-1" title={t.title}>
                  {t.title}
                </div>

                {/* Row 3: Buyer & Winner */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="truncate max-w-[150px]" title={t.buyer_name}>
                    {t.buyer_name}
                  </span>
                  <span className="truncate max-w-[150px] text-slate-300 font-medium text-right" title={t.winner_name}>
                    &rarr; {t.winner_name}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
