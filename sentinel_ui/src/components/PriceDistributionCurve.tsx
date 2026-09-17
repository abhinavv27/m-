import { BarChart3 } from 'lucide-react';
import type { PriceDistribution } from '../types';

interface PriceDistributionCurveProps {
  distribution: PriceDistribution | null;
  currentBidAmount: number;
}

export const PriceDistributionCurve: React.FC<PriceDistributionCurveProps> = ({
  distribution,
  currentBidAmount,
}) => {
  if (!distribution || !distribution.histogram || distribution.histogram.length === 0) {
    return (
      <div className="p-3 bg-surface border-t border-border text-center text-xs font-mono text-slate-500">
        Loading historical CPV price distribution curve...
      </div>
    );
  }

  const { histogram, median, mean, std, q25, q75, cpv_name, cpv_code } = distribution;
  const maxCount = Math.max(...histogram.map((h) => h.count), 1);
  const minVal = histogram[0].bin_start;
  const maxVal = histogram[histogram.length - 1].bin_end;

  // Format currency into INR Crores / Lakhs
  const formatINR = (val: number) => {
    if (val >= 10000000) {
      return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    }
    return `₹ ${(val / 100000).toFixed(1)} L`;
  };

  // Empirical mathematical indicators
  const zScore = std > 0 ? (currentBidAmount - mean) / std : 0;
  const iqr = q75 - q25;
  const pctFromMedian = median > 0 ? ((currentBidAmount - median) / median) * 100 : 0;

  // Compute horizontal percentage position for a given price
  const getPercentPos = (val: number) => {
    const p = ((val - minVal) / (maxVal - minVal)) * 100;
    return Math.min(Math.max(p, 2), 98);
  };

  const bidPos = getPercentPos(currentBidAmount);
  const medianPos = getPercentPos(median);
  const q25Pos = getPercentPos(q25);
  const q75Pos = getPercentPos(q75);

  const isAnomalous = Math.abs(zScore) >= 2.0;

  return (
    <div className="bg-surface border-t border-border p-3 select-none flex flex-col justify-between h-full">
      {/* Header: Title + Sector Info + Empirical Statistical Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-signal-cobalt" />
          <span className="font-semibold text-xs uppercase tracking-wider text-slate-200">
            Market Baseline Distribution
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            • CPV {cpv_code} ({cpv_name})
          </span>
        </div>

        {/* Empirical Math Indicators ($Z$-Score, IQR, Deviation %) */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-300">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Z-Score:</span>
            <span className={`font-bold px-1.5 py-0.2 rounded ${
              isAnomalous
                ? 'bg-signal-critical/20 text-signal-critical border border-signal-critical/40'
                : 'bg-surface-track text-slate-200 border border-border'
            }`}>
              {zScore >= 0 ? `+${zScore.toFixed(2)}σ` : `${zScore.toFixed(2)}σ`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400">&Delta; Median:</span>
            <span className={`font-bold ${pctFromMedian > 15 ? 'text-signal-amber' : 'text-signal-emerald'}`}>
              {pctFromMedian >= 0 ? `+${pctFromMedian.toFixed(1)}%` : `${pctFromMedian.toFixed(1)}%`}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <span>IQR Spread:</span>
            <span className="text-slate-200 font-semibold">{formatINR(iqr)}</span>
          </div>
        </div>
      </div>

      {/* Histogram bars + Density overlay container */}
      <div className="relative h-18 bg-canvas border border-border rounded p-1.5 flex items-end justify-between gap-1 overflow-hidden">
        {/* IQR (Interquartile Range) Confidence Band */}
        <div
          className="absolute top-0 bottom-0 bg-signal-cobalt/10 border-x border-signal-cobalt/30 pointer-events-none"
          style={{ left: `${q25Pos}%`, width: `${Math.max(q75Pos - q25Pos, 2)}%` }}
          title={`IQR 50% Confidence Range: ${formatINR(q25)} – ${formatINR(q75)}`}
        />

        {/* Median Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-400 border-dashed pointer-events-none z-10"
          style={{ left: `${medianPos}%` }}
          title={`Regional CPV Median: ${formatINR(median)}`}
        />

        {/* Current Bid Position Marker (Solid, no neon blur) */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-signal-critical pointer-events-none z-20"
          style={{ left: `${bidPos}%` }}
        >
          <div className="absolute -top-1 -left-3 bg-signal-critical text-white text-[8px] font-mono px-1 py-0.2 rounded font-bold whitespace-nowrap">
            AWARD
          </div>
        </div>

        {/* Histogram Bins */}
        {histogram.map((bin, i) => {
          const heightPct = (bin.count / maxCount) * 100;
          const isNearBid = Math.abs(currentBidAmount - (bin.bin_start + bin.bin_end) / 2) < (bin.bin_end - bin.bin_start);
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end h-full group relative"
            >
              <div
                className={`w-full rounded-t transition-all ${
                  isNearBid
                    ? 'bg-signal-critical/70 border-t border-signal-critical'
                    : 'bg-surface-track hover:bg-slate-600'
                }`}
                style={{ height: `${Math.max(heightPct, 4)}%` }}
              />
              {/* Contextual Market Benchmark Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:block z-30 p-2 bg-surface border border-border rounded text-[10px] font-mono text-slate-200 shadow-xl pointer-events-none whitespace-nowrap">
                <div className="font-bold text-white mb-0.5">{bin.bin_label}</div>
                <div className="text-slate-400">Sample Frequency: <span className="text-slate-200 font-semibold">{bin.count} historical tenders</span></div>
                <div className="text-slate-400">Bin Distance: <span className="text-signal-amber font-semibold">{formatINR(bin.bin_start)} – {formatINR(bin.bin_end)}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis Footer with Mathematical Justification Summary */}
      <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mt-1">
        <span>Min: {formatINR(minVal)}</span>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Regional Median: <strong className="text-slate-200">{formatINR(median)}</strong></span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">IQR Normal Band: <strong className="text-slate-200">[{formatINR(q25)} — {formatINR(q75)}]</strong></span>
        </div>
        <span>Max: {formatINR(maxVal)}</span>
      </div>
    </div>
  );
};
