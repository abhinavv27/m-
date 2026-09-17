import React from 'react';
import { 
  FileText, 
  FileWarning, 
  Send, 
  CheckCircle2, 
  Download, 
  IndianRupee,
  ClipboardPen
} from 'lucide-react';
import type { TenderDetail } from '../types';
import { getExportDossierUrl } from '../api';

interface EvidenceDossierProps {
  tenderDetail: TenderDetail | null;
  onEscalate: () => void;
  onPeerReview: () => void;
  onDismiss: () => void;
  onOpenAuditTrail?: () => void;
  isLoading: boolean;
}

export const EvidenceDossier: React.FC<EvidenceDossierProps> = ({
  tenderDetail,
  onEscalate,
  onPeerReview,
  onDismiss,
  onOpenAuditTrail,
  isLoading,
}) => {
  if (isLoading || !tenderDetail) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-xs font-mono text-slate-500 bg-surface">
        <FileText className="w-8 h-8 text-slate-600 mb-2" />
        <span>Select a tender from the triage ledger to inspect the Evidence Dossier.</span>
      </div>
    );
  }

  const { dossier, scoring, tender } = tenderDetail;
  const decomp = scoring.decomposition;
  const isHighAlert = scoring.priority_score >= 80;
  const isMedAlert = scoring.priority_score >= 50 && scoring.priority_score < 80;

  // Format currency into INR Crores / Lakhs
  const formatINR = (val: number) => {
    if (val >= 10000000) {
      return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    }
    return `₹ ${(val / 100000).toFixed(1)} L`;
  };

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border select-none overflow-hidden">
      {/* Dossier Header */}
      <div className="p-3 border-b border-border bg-canvas/60 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-100">{dossier.dossier_id}</span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                isHighAlert
                  ? 'bg-signal-critical/15 border-signal-critical/40 text-rose-300'
                  : isMedAlert
                  ? 'bg-signal-amber/15 border-signal-amber/40 text-amber-300'
                  : 'bg-signal-emerald/15 border-signal-emerald/40 text-emerald-300'
              }`}
            >
              {scoring.status_label.toUpperCase()}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 truncate max-w-[240px] mt-0.5">
            {tender.buyer_name} &bull; {tender.region}
          </div>
        </div>

        {/* 1-Click Printable Dossier Subpoena Export */}
        <a
          href={getExportDossierUrl(tender.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-hover hover:bg-surface-track border border-border rounded text-[11px] font-mono text-slate-200 transition-colors"
          title="Open printable forensic dossier"
        >
          <Download className="w-3.5 h-3.5 text-signal-cobalt" />
          <span>Export File</span>
        </a>
      </div>

      {/* Dossier Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Active Learning Exclusion Banner if discounted */}
        {scoring.active_learning_note && (
          <div className="p-2.5 bg-signal-emerald/10 border border-signal-emerald/30 rounded text-[11px] font-mono text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-signal-emerald shrink-0 mt-0.5" />
            <span>{scoring.active_learning_note}</span>
          </div>
        )}

        {/* SCORE DECOMPOSITION BREAKDOWN (Proportional Bar System with Neutral Tracks) */}
        <div className="bg-canvas p-3 rounded border border-border space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Priority Score Decomposition
            </span>
            <span className="text-[10px] font-mono text-slate-500">IPI Model</span>
          </div>

          {/* Calibrated Priority Score */}
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono text-2xl font-bold tabular-nums ${
                isHighAlert ? 'text-signal-critical' : isMedAlert ? 'text-signal-amber' : 'text-signal-emerald'
              }`}
            >
              {scoring.priority_score.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100 Index</span>
          </div>

          {/* Unified Proportional Bar System with Neutral Tracks (#1E293B) */}
          <div className="space-y-2 text-[11px] font-mono">
            {/* Relational Density (40% Weight) */}
            <div>
              <div className="flex justify-between text-slate-300 mb-0.5">
                <span>Relational Density (40%):</span>
                <span className="font-semibold text-rose-300">
                  {decomp.relational_density.score.toFixed(1)} / 100
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-signal-critical rounded-full transition-all duration-300"
                  style={{ width: `${decomp.relational_density.score}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {dossier.score_decomposition.relational_density.text}
              </div>
            </div>

            {/* Price Outlier (35% Weight) */}
            <div>
              <div className="flex justify-between text-slate-300 mb-0.5">
                <span>Price Outlier (35%):</span>
                <span className="font-semibold text-amber-300">
                  {decomp.price_outlier.score.toFixed(1)} / 100
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-signal-amber rounded-full transition-all duration-300"
                  style={{ width: `${decomp.price_outlier.score}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {dossier.score_decomposition.price_outlier.text}
              </div>
            </div>

            {/* Procedural Irregularity (25% Weight) */}
            <div>
              <div className="flex justify-between text-slate-300 mb-0.5">
                <span>Procedural Irregularity (25%):</span>
                <span className="font-semibold text-slate-200">
                  {decomp.procedural_irregularity.score.toFixed(1)} / 100
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-signal-cobalt rounded-full transition-all duration-300"
                  style={{ width: `${decomp.procedural_irregularity.score}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {dossier.score_decomposition.procedural_irregularity.text}
              </div>
            </div>
          </div>
        </div>

        {/* VERIFIED EVIDENCE FINDINGS */}
        <div className="bg-canvas p-3 rounded border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Verified Forensic Evidence
            </span>
            <span className="text-[10px] font-mono text-slate-500">Statutory Record</span>
          </div>

          <div className="space-y-1.5">
            {dossier.verified_evidence_findings.map((finding, idx) => {
              const isCartel = finding.includes('Cartel') || finding.includes('Bid-Rotation') || finding.includes('Shell');
              const isCeiling = finding.includes('Ceiling Proximity');
              const isPAC = finding.includes('Proprietary Articles') || finding.includes('GFR 2017');

              return (
                <div
                  key={idx}
                  className="p-2 bg-surface rounded border border-border text-[11px] font-sans leading-relaxed text-slate-200 flex flex-col gap-1"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      isCartel
                        ? 'bg-signal-critical/15 text-rose-300 border-signal-critical/30'
                        : isCeiling
                        ? 'bg-signal-amber/15 text-amber-300 border-signal-amber/30'
                        : isPAC
                        ? 'bg-signal-emerald/15 text-emerald-300 border-signal-emerald/30'
                        : 'bg-surface-track text-slate-300 border-border'
                    }`}>
                      {isCartel ? 'CARTEL VIOLATION' : isCeiling ? 'PRICE ELEVATION' : isPAC ? 'GFR 166 EXEMPTION' : 'FINDING'}
                    </span>
                  </div>
                  <div>{finding}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contract Particulars (INR Currency, Indian Public Authority) */}
        <div className="bg-canvas p-3 rounded border border-border text-[11px] font-mono space-y-1.5 text-slate-300">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
            <span>Contract Particulars</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Award Amount:</span>
            <span className="font-bold text-slate-100">{formatINR(tender.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Budget Cap:</span>
            <span className="text-slate-300">{formatINR(tender.budget)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Awardee:</span>
            <span className="text-slate-200 font-semibold truncate max-w-[170px]" title={tender.winning_vendor_name}>
              {tender.winning_vendor_name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Bid Window:</span>
            <span className="text-slate-300">{tender.duration_days} days ({tender.duration_days * 24} hrs)</span>
          </div>
        </div>
      </div>

      {/* COMPACT INSTITUTIONAL ACTION BUTTONS */}
      <div className="p-3 border-t border-border bg-canvas/90 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          <span>Auditor Disposition</span>
          {onOpenAuditTrail && (
            <button
              onClick={onOpenAuditTrail}
              className="text-signal-amber hover:underline flex items-center gap-1"
            >
              <ClipboardPen className="w-3 h-3" />
              <span>Log Note</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          {/* Action 1: Initiate Subpoena Draft (Subtle filled state) */}
          <button
            onClick={onEscalate}
            className="w-full py-1.5 px-3 bg-signal-critical hover:bg-red-700 text-white font-mono text-xs font-semibold rounded border border-red-500/80 shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FileWarning className="w-3.5 h-3.5" />
            <span>Initiate Subpoena Draft</span>
          </button>

          {/* Action 2: Request Agency Inquest (Bordered state) */}
          <button
            onClick={onPeerReview}
            className="w-full py-1.5 px-3 bg-surface hover:bg-surface-hover text-slate-200 font-mono text-xs font-medium rounded border border-border hover:border-border-muted flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-signal-amber" />
            <span>Request Agency Inquest</span>
          </button>

          {/* Action 3: Log False Positive Override (Ghost muted state) */}
          <button
            onClick={onDismiss}
            className="w-full py-1.5 px-3 bg-transparent hover:bg-surface-hover text-slate-400 hover:text-slate-200 font-mono text-xs font-medium rounded border border-transparent hover:border-border/60 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-signal-emerald" />
            <span>Log False Positive Override</span>
          </button>
        </div>
      </div>
    </div>
  );
};
