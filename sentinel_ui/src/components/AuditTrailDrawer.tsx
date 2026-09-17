import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Plus, FileText, Clock, User, Building2, CheckCircle } from 'lucide-react';
import type { AuditLogEntry } from '../types';
import { fetchAuditLogs, postAuditLog } from '../api';

interface AuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTenderId?: string;
}

export const AuditTrailDrawer: React.FC<AuditTrailDrawerProps> = ({
  isOpen,
  onClose,
  activeTenderId,
}) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [officerName, setOfficerName] = useState('Insp. R. Venkatesh');
  const [agency, setAgency] = useState('CCI (Antitrust Taskforce)');
  const [actionTag, setActionTag] = useState('BENEFICIAL_OWNERSHIP');
  const [noteText, setNoteText] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      setIsSubmitting(true);
      await postAuditLog({
        tender_id: activeTenderId || 'T-8841',
        officer_name: officerName,
        agency: agency,
        action: actionTag,
        notes: noteText.trim(),
      });
      setNoteText('');
      setSuccessMsg('Finding successfully logged into legal custody chain.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowAddForm(false);
      await loadLogs();
    } catch (err) {
      console.error('Failed to log audit note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-xl bg-surface border-l border-border flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-canvas/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-surface-hover border border-border flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-signal-emerald" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-100">Investigator Audit Trail & Evidence Log</h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-track text-slate-300 border border-border">
                  {logs.length} Records
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Immutable evidentiary log • CVC / CCI statutory compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action Bar */}
        <div className="px-5 py-2.5 bg-surface-card border-b border-border flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Current Case Context: <span className="font-mono text-slate-200 font-semibold">{activeTenderId || 'Global'}</span>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-surface-hover hover:bg-surface-track text-slate-200 border border-border rounded transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-signal-emerald" />
            {showAddForm ? 'Cancel Note' : 'Log New Finding'}
          </button>
        </div>

        {successMsg && (
          <div className="mx-5 my-2 p-2.5 rounded bg-signal-emerald/10 border border-signal-emerald/30 text-signal-emerald text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* New Finding Form Drawer */}
        {showAddForm && (
          <form onSubmit={handleSubmitNote} className="m-5 p-4 rounded bg-canvas border border-border flex flex-col gap-3">
            <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-signal-amber" />
              <span>Record Officer Assessment</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Officer Name</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full bg-surface border border-border rounded px-2.5 py-1 text-slate-200 text-xs focus:border-signal-cobalt outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Investigating Agency</label>
                <select
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full bg-surface border border-border rounded px-2.5 py-1 text-slate-200 text-xs focus:border-signal-cobalt outline-none"
                >
                  <option value="CCI (Antitrust Taskforce)">CCI (Antitrust Taskforce)</option>
                  <option value="CVC (Vigilance Audit Cell)">CVC (Vigilance Audit Cell)</option>
                  <option value="CAG (Forensic Audit Wing)">CAG (Forensic Audit Wing)</option>
                  <option value="ED (Special Investigation Desk)">ED (Special Investigation Desk)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Tender Reference</label>
                <input
                  type="text"
                  value={activeTenderId || 'T-8841'}
                  disabled
                  className="w-full bg-surface-track border border-border rounded px-2.5 py-1 text-slate-400 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Finding Category</label>
                <select
                  value={actionTag}
                  onChange={(e) => setActionTag(e.target.value)}
                  className="w-full bg-surface border border-border rounded px-2.5 py-1 text-slate-200 text-xs focus:border-signal-cobalt outline-none font-mono"
                >
                  <option value="BENEFICIAL_OWNERSHIP">BENEFICIAL_OWNERSHIP</option>
                  <option value="BID_ROTATION">BID_ROTATION</option>
                  <option value="PAC_VERIFIED">PAC_VERIFIED (GFR 166)</option>
                  <option value="SUBPOENA_ISSUED">SUBPOENA_ISSUED</option>
                  <option value="NOTE">INVESTIGATOR_NOTE</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Forensic Notes / Factual Evidence</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g. 2026-09-17: Cross-referenced GSTIN prefix against MCA-21 filings. Shared directorship confirmed between Vendor A and Vendor B."
                className="w-full h-20 bg-surface border border-border rounded p-2.5 text-slate-200 text-xs focus:border-signal-cobalt outline-none resize-none font-sans"
                required
              />
            </div>

            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3.5 py-1 text-xs font-semibold bg-signal-cobalt hover:bg-blue-600 text-white rounded transition-colors"
              >
                {isSubmitting ? 'Recording...' : 'Commit to Log'}
              </button>
            </div>
          </form>
        )}

        {/* Audit Log Entries List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-border/60">
          {isLoading ? (
            <div className="text-center py-10 text-xs text-slate-500 font-mono">Loading legal chain of custody...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500 font-mono">No audit notes recorded yet.</div>
          ) : (
            logs.map((log, idx) => (
              <div key={log.tracking_id || idx} className="py-3 first:pt-0 last:pb-0 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-300">{log.tracking_id}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold uppercase ${
                      log.action === 'BENEFICIAL_OWNERSHIP' || log.action === 'ESCALATE'
                        ? 'bg-signal-critical/15 text-signal-critical border border-signal-critical/30'
                        : log.action === 'PAC_VERIFIED' || log.action === 'DISMISS'
                        ? 'bg-signal-emerald/15 text-signal-emerald border border-signal-emerald/30'
                        : 'bg-signal-amber/15 text-signal-amber border border-signal-amber/30'
                    }`}>
                      {log.action}
                    </span>
                    <span className="font-mono text-slate-500">[{log.tender_id}]</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) : ''}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans bg-surface-card/60 p-2 rounded border border-border/40">
                  {log.auditor_notes}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>{log.officer_name || 'Forensic Officer'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span>{log.agency || 'CVC / CCI Desk'}</span>
                  </div>
                  {log.exclusion_committed && (
                    <span className="text-signal-emerald text-[10px] font-mono">✓ Exclusion Committed</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-5 py-3 border-t border-border bg-canvas/80 text-[11px] font-mono text-slate-500 flex justify-between items-center">
          <span>Indian Evidence Act Sec 65B Electronic Record Hash</span>
          <span className="text-slate-400">SHA-256: 7f8a92b1...</span>
        </div>
      </div>
    </div>
  );
};
