import React, { useState } from 'react';
import { ShieldCheck, X, CheckCircle2, FileCheck } from 'lucide-react';

interface DismissModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenderId: string;
  tenderTitle: string;
  onConfirm: (reason: string) => Promise<void>;
}

export const DismissModal: React.FC<DismissModalProps> = ({
  isOpen,
  onClose,
  tenderId,
  tenderTitle,
  onConfirm,
}) => {
  const [reason, setReason] = useState(
    'Verified as legitimate specialized procurement under GFR 2017 Rule 166 (Proprietary Articles Certificate). High price aligns with authorized OEM manufacturing monopoly rather than collusive bid rigging.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      setConfirmed(true);
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
          <div className="flex items-center gap-2 text-signal-emerald">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wider uppercase">
              Log False Positive Override (GFR 2017 PAC)
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {confirmed ? (
          <div className="space-y-4 py-3 text-center font-mono">
            <CheckCircle2 className="w-10 h-10 text-signal-emerald mx-auto" />
            <div>
              <div className="text-base font-bold text-slate-100">Exclusion Profile Committed</div>
              <div className="text-xs text-slate-400 mt-1">
                Tender <span className="text-signal-emerald font-bold">{tenderId}</span> verified as legitimate variance.
              </div>
            </div>

            <div className="p-3 bg-canvas border border-border rounded text-xs text-left text-slate-300 leading-relaxed font-sans">
              <div className="text-signal-emerald font-bold mb-1 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Active Learning Feature Commitment:</span>
              </div>
              The feature signature for this tender has been recorded into the vector exclusion index. Similar proprietary OEM procurements will automatically receive calibrated alert dampening.
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2 bg-surface-hover hover:bg-surface-track text-slate-200 text-xs rounded border border-border transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-canvas p-3 rounded border border-border space-y-1 text-[11px]">
              <div><span className="text-slate-400">Tender:</span> <span className="text-slate-200 font-bold">{tenderId}</span></div>
              <div className="text-slate-300 truncate">{tenderTitle}</div>
              <div><span className="text-slate-400">Statute:</span> <span className="text-signal-emerald font-semibold">GFR 2017 Rule 166 (PAC Sole-Source)</span></div>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                AUDITOR VERIFICATION JUSTIFICATION:
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 bg-canvas border border-border rounded text-slate-200 font-sans text-xs focus:outline-none focus:border-signal-cobalt"
              />
            </div>

            <div className="p-2.5 bg-canvas border border-border rounded text-[10px] text-slate-400 leading-normal font-sans">
              <span className="text-signal-emerald font-bold">Feedback Loop Note:</span> Committing this action updates the active learning index to reduce false positives for authorized sole-source equipment.
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
                className="px-4 py-1.5 bg-signal-emerald hover:bg-emerald-700 text-white font-bold rounded border border-emerald-600 flex items-center gap-1.5 transition-colors"
              >
                {isSubmitting ? 'Committing...' : 'Commit Verified Override'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
