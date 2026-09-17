import React, { useState } from 'react';

interface PriorityBadgeProps {
  score: number;
  decomposition?: {
    relational_density?: { weight: number; score: number; weighted_contribution: number; label: string };
    price_outlier?: { weight: number; score: number; weighted_contribution: number; label: string };
    procedural_irregularity?: { weight: number; score: number; weighted_contribution: number; label: string };
  };
  dampened?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  score,
  decomposition,
  dampened,
  size = 'md',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  let bg = 'bg-surface-track text-slate-300 border-border';
  let dotColor = 'bg-slate-400';
  if (score >= 80) {
    bg = 'bg-signal-critical/15 text-rose-300 border-signal-critical/40';
    dotColor = 'bg-signal-critical';
  } else if (score >= 50) {
    bg = 'bg-signal-amber/15 text-amber-300 border-signal-amber/40';
    dotColor = 'bg-signal-amber';
  } else if (dampened) {
    bg = 'bg-signal-emerald/15 text-emerald-300 border-signal-emerald/40';
    dotColor = 'bg-signal-emerald';
  } else {
    bg = 'bg-signal-emerald/10 text-emerald-300 border-signal-emerald/30';
    dotColor = 'bg-signal-emerald';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  }[size];

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`inline-flex items-center gap-1.5 font-mono font-bold rounded border ${bg} ${sizeClasses} cursor-help transition-all duration-120`}
      >
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span className="tabular-nums">{score.toFixed(1)}</span>
      </div>

      {/* Breakdown weights tooltip */}
      {showTooltip && decomposition && (
        <div className="absolute z-50 bottom-full left-0 mb-1.5 w-64 p-2.5 bg-canvas border border-border rounded shadow-2xl text-[11px] font-mono text-slate-300 pointer-events-none">
          <div className="font-bold text-slate-100 flex items-center justify-between border-b border-border pb-1 mb-1.5">
            <span>PRIORITY BREAKDOWN</span>
            <span className={score >= 80 ? 'text-signal-critical' : score >= 50 ? 'text-signal-amber' : 'text-signal-emerald'}>
              {score.toFixed(1)} / 100
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Relational Density (40%):</span>
              <span className="font-semibold text-rose-300">
                {decomposition.relational_density?.score.toFixed(1)} ({decomposition.relational_density?.weighted_contribution.toFixed(1)} pts)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Price Outlier (35%):</span>
              <span className="font-semibold text-amber-300">
                {decomposition.price_outlier?.score.toFixed(1)} ({decomposition.price_outlier?.weighted_contribution.toFixed(1)} pts)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Procedural Irreg. (25%):</span>
              <span className="font-semibold text-slate-200">
                {decomposition.procedural_irregularity?.score.toFixed(1)} ({decomposition.procedural_irregularity?.weighted_contribution.toFixed(1)} pts)
              </span>
            </div>
          </div>

          {dampened && (
            <div className="mt-1.5 pt-1 border-t border-border text-[10px] text-signal-emerald font-semibold">
              * Context Filter: GFR 2017 Rule 166 PAC Sole-Source Dampened (-80%)
            </div>
          )}
        </div>
      )}
    </div>
  );
};
