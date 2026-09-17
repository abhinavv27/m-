import React, { useState } from 'react';
import { FileWarning, Download, X, CheckCircle2 } from 'lucide-react';
import { getExportDossierUrl } from '../api';

interface SubpoenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenderId: string;
  tenderTitle: string;
  winnerName: string;
  buyerName: string;
  onConfirm: (notes: string) => Promise<void>;
}

export const SubpoenaModal: React.FC<SubpoenaModalProps> = ({
  isOpen,
  onClose,
  tenderId,
  tenderTitle,
  winnerName,
  buyerName,
  onConfirm,
}) => {
  const [notes, setNotes] = useState(
    'Evidence indicates bid rotation cartel and cover-bidding margin collusion under Section 3(3) of Competition Act, 2002. Formal summons recommended for MCA-21 director records and IP submission logs.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedTrackingId, setConfirmedTrackingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(notes);
      setConfirmedTrackingId(`CCI-SUBPOENA-${tenderId.replace('T-', '')}-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none">
      <div className="bg-surface border border-border rounded-lg max-w-lg w-full p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-signal-critical">
            <FileWarning className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wider uppercase">
              Formal Case Escalation: Initiate Subpoena Draft
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {confirmedTrackingId ? (
          <div className="space-y-4 py-3 text-center font-mono">
            <CheckCircle2 className="w-10 h-10 text-signal-emerald mx-auto" />
            <div>
              <div className="text-base font-bold text-slate-100">Subpoena Draft Dispatched</div>
              <div className="text-xs text-slate-400 mt-1">
                CCI Case Tracking ID: <span className="text-signal-critical font-bold">{confirmedTrackingId}</span>
              </div>
            </div>

            <div className="p-3 bg-canvas border border-border rounded text-xs text-left text-slate-300 leading-relaxed font-sans">
              This case file has been transmitted to the Competition Commission of India (CCI) Antitrust Taskforce and CVC Vigilance Audit Cell. Full statutory evidence dossier has been generated.
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <a
                href={getExportDossierUrl(tenderId)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-signal-critical hover:bg-red-700 text-white font-bold text-xs rounded border border-red-500/80 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Open Printable Inquest Dossier</span>
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-surface-hover hover:bg-surface-track text-slate-300 text-xs rounded border border-border transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-canvas p-3 rounded border border-border space-y-1 text-[11px]">
              <div><span className="text-slate-400">Tender:</span> <span className="text-slate-200 font-bold">{tenderId} &bull; {tenderTitle}</span></div>
              <div><span className="text-slate-400">Target Vendors:</span> <span className="text-rose-400 font-bold">{winnerName}</span> (and linked consortium)</div>
              <div><span className="text-slate-400">Procuring Authority:</span> <span className="text-slate-200">{buyerName}</span></div>
              <div><span className="text-slate-400">Statutory Act:</span> <span className="text-signal-amber">Section 3(3) Competition Act 2002</span></div>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                INVESTIGATOR AUDIT NOTES & FORENSIC JUSTIFICATION:
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-canvas border border-border rounded text-slate-200 font-sans text-xs focus:outline-none focus:border-signal-cobalt"
              />
            </div>

            <div className="text-[10px] text-slate-400 leading-normal font-sans">
              * In strict compliance with statutory auditing standards and the Non-Defamation Mandate, this action initiates administrative inquiry rather than an ex-parte judicial conviction.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-surface-hover hover:bg-surface-track text-slate-300 rounded border border-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-signal-critical hover:bg-red-700 text-white font-bold rounded border border-red-500/80 flex items-center gap-1.5 transition-colors"
              >
                {isSubmitting ? 'Escalating...' : 'Confirm Subpoena Draft'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
