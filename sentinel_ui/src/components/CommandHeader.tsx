import React, { useState } from 'react';
import { 
  Shield, 
  Database, 
  Calendar, 
  Building2, 
  FileSpreadsheet, 
  ClipboardList, 
  Network, 
  AlertOctagon, 
  CheckCircle2, 
  IndianRupee, 
  Layers
} from 'lucide-react';
import type { OperationalStats } from '../types';
import { getExportDossierUrl } from '../api';

interface CommandHeaderProps {
  stats: OperationalStats | null;
  selectedTenderId: string | null;
  onOpenAuditTrail: () => void;
  auditLogCount?: number;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  stats,
  selectedTenderId,
  onOpenAuditTrail,
  auditLogCount = 3,
}) => {
  const [selectedAgency, setSelectedAgency] = useState('CCI (Competition Commission of India)');
  const [selectedDateRange, setSelectedDateRange] = useState('FY 2024-25 (Q1–Q4)');

  const handleExportClick = () => {
    if (selectedTenderId) {
      window.open(getExportDossierUrl(selectedTenderId), '_blank');
    } else {
      window.open(getExportDossierUrl('T-8841'), '_blank');
    }
  };

  const capitalCr = stats?.capital_at_risk 
    ? (stats.capital_at_risk / 10000000).toFixed(2)
    : '51.39';

  return (
    <header className="bg-surface border-b border-border px-4 py-2.5 flex flex-col gap-2.5 select-none">
      {/* Top row: Authentic Global Institutional Audit Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Authority & System Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-canvas border border-border rounded">
            <Shield className="w-4 h-4 text-signal-cobalt" />
            <span className="font-semibold text-xs tracking-wider text-slate-100 uppercase">
              PROJECT SENTINEL
            </span>
            <span className="text-[10px] text-slate-400 font-mono px-1 rounded bg-surface-track border border-border">
              IN-GOV
            </span>
          </div>

          {/* Active Dataset Indicator with Live Status */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-canvas/80 border border-border rounded text-[11px] font-mono">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-signal-emerald animate-pulse" />
            <span className="text-slate-400">DATASET:</span>
            <span className="text-slate-200 font-semibold">GeM_CAG_Sync_2026Q3</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">OCDS v1.4 IN</span>
          </div>

          {/* Data Lineage & Hash Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 bg-canvas/50 border border-border/80 rounded text-[10px] font-mono text-slate-400">
            <Database className="w-3 h-3 text-slate-500" />
            <span>SHA-256:</span>
            <span className="text-slate-300">7f8a92b10dc9...</span>
          </div>
        </div>

        {/* Right: Operational Controls (Agency Selector, Date Range, Audit Logs, Export Subpoena Dossier) */}
        <div className="flex items-center gap-2">
          {/* Agency Selector */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-canvas border border-border rounded text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer pr-1"
            >
              <option value="CCI (Competition Commission of India)">CCI (Antitrust Unit)</option>
              <option value="CVC (Central Vigilance Commission)">CVC (Vigilance Audit)</option>
              <option value="CAG Anti-Fraud Cell">CAG (Anti-Fraud Cell)</option>
              <option value="ED Special Taskforce">ED (Special Taskforce)</option>
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-canvas border border-border rounded text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer pr-1"
            >
              <option value="FY 2024-25 (Q1–Q4)">FY 2024-25 (All Qs)</option>
              <option value="FY 2024-25 (Q3–Q4)">FY 2024-25 (H2)</option>
              <option value="FY 2023-24 (Audited)">FY 2023-24 (Audited)</option>
            </select>
          </div>

          {/* Investigator Audit Trail Drawer Trigger */}
          <button
            onClick={onOpenAuditTrail}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-hover hover:bg-surface-track border border-border rounded text-xs text-slate-200 transition-colors"
            title="Open timestamped investigator note log and audit trail"
          >
            <ClipboardList className="w-3.5 h-3.5 text-signal-amber" />
            <span className="font-medium">Audit Trail</span>
            <span className="px-1 py-0.2 rounded bg-canvas text-[10px] font-mono text-signal-amber font-semibold border border-border">
              {auditLogCount}
            </span>
          </button>

          {/* Export Subpoena Dossier Button */}
          <button
            onClick={handleExportClick}
            className="flex items-center gap-1.5 px-3 py-1 bg-signal-cobalt hover:bg-blue-600 text-white rounded text-xs font-semibold shadow-xs transition-colors"
            title="Generate formal printable legal audit file / subpoena evidence dossier"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Subpoena Dossier</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Actionable Operational Indicators (Split Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* Metric 1: Total Capital Under Review */}
        <div className="bg-canvas border border-border px-3 py-1.5 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Capital Under Review</div>
            <div className="font-mono font-bold text-sm text-slate-100 tabular-nums flex items-baseline gap-1">
              <span>₹ {capitalCr} Cr</span>
              <span className="text-[10px] font-normal text-slate-500 font-sans">({stats?.high_priority_count ?? 2} cases)</span>
            </div>
          </div>
          <div className="p-1 rounded bg-surface-track">
            <IndianRupee className="w-3.5 h-3.5 text-signal-amber" />
          </div>
        </div>

        {/* Metric 2: Critical Cartel Signals */}
        <div className="bg-signal-critical/5 border border-signal-critical/30 px-3 py-1.5 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-rose-300">Critical Signals (&gt;80)</div>
            <div className="font-mono font-bold text-sm text-signal-critical tabular-nums flex items-baseline gap-1">
              <span>{stats?.high_priority_count ?? 2} Tenders</span>
              <span className="text-[10px] text-rose-400/80 font-sans">Active</span>
            </div>
          </div>
          <div className="p-1 rounded bg-signal-critical/10">
            <AlertOctagon className="w-3.5 h-3.5 text-signal-critical" />
          </div>
        </div>

        {/* Metric 3: Identified Cartel Rings */}
        <div className="bg-signal-amber/5 border border-signal-amber/30 px-3 py-1.5 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-amber-300">Identified Cartel Rings</div>
            <div className="font-mono font-bold text-sm text-signal-amber tabular-nums flex items-baseline gap-1">
              <span>{stats?.active_collusion_rings ?? 2} Shell Rings</span>
              <span className="text-[10px] text-amber-400/80 font-sans">Cluster</span>
            </div>
          </div>
          <div className="p-1 rounded bg-signal-amber/10">
            <Network className="w-3.5 h-3.5 text-signal-amber" />
          </div>
        </div>

        {/* Metric 4: False-Positive Suppression Rate (GFR 2017 Rule 166 PAC) */}
        <div className="bg-signal-emerald/5 border border-signal-emerald/30 px-3 py-1.5 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-300">FP Suppression Rate</div>
            <div className="font-mono font-bold text-sm text-signal-emerald tabular-nums flex items-baseline gap-1">
              <span>{stats?.dampened_rate_pct ?? '25.0'}%</span>
              <span className="text-[10px] text-emerald-400/80 font-sans">GFR PAC</span>
            </div>
          </div>
          <div className="p-1 rounded bg-signal-emerald/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-signal-emerald" />
          </div>
        </div>

        {/* Metric 5: Active Entities Monitored */}
        <div className="bg-canvas border border-border px-3 py-1.5 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Entities Monitored</div>
            <div className="font-mono font-bold text-sm text-slate-100 tabular-nums flex items-baseline gap-1">
              <span>19 Vendors</span>
              <span className="text-[10px] font-normal text-slate-500 font-sans">500 Tenders</span>
            </div>
          </div>
          <div className="p-1 rounded bg-surface-track">
            <Layers className="w-3.5 h-3.5 text-signal-cobalt" />
          </div>
        </div>
      </div>
    </header>
  );
};
