import React, { useState, useEffect, useCallback } from 'react';
import { CommandHeader } from './components/CommandHeader';
import { TriageTable } from './components/TriageTable';
import { CollusionGraph } from './components/CollusionGraph';
import { PriceDistributionCurve } from './components/PriceDistributionCurve';
import { EvidenceDossier } from './components/EvidenceDossier';
import { SubpoenaModal } from './components/SubpoenaModal';
import { DismissModal } from './components/DismissModal';
import { AuditTrailDrawer } from './components/AuditTrailDrawer';
import {
  fetchStats,
  fetchTenders,
  fetchTenderDetail,
  fetchPriceDistribution,
  fetchAuditLogs,
  postDisposition,
} from './api';
import type { TenderSummary, TenderDetail, PriceDistribution, OperationalStats } from './types';

export const App: React.FC = () => {
  const [stats, setStats] = useState<OperationalStats | null>(null);
  const [tenders, setTenders] = useState<TenderSummary[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [tenderDetail, setTenderDetail] = useState<TenderDetail | null>(null);
  const [priceDist, setPriceDist] = useState<PriceDistribution | null>(null);
  const [auditLogCount, setAuditLogCount] = useState(3);

  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [isSubpoenaOpen, setIsSubpoenaOpen] = useState(false);
  const [isDismissOpen, setIsDismissOpen] = useState(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);

  // Load initial data
  const loadInitialData = async () => {
    try {
      setIsLoadingList(true);
      const [s, tData, logs] = await Promise.all([
        fetchStats(),
        fetchTenders({ limit: 500 }),
        fetchAuditLogs(),
      ]);
      setStats(s);
      setTenders(tData.items);
      setAuditLogCount(logs.length);

      // Default select the apex cartel tender #8841 or the first tender
      const defaultId = tData.items.find((t) => t.id === 'T-8841')?.id || tData.items[0]?.id;
      if (defaultId) {
        setSelectedTenderId(defaultId);
      }
    } catch (e) {
      console.error('API Error:', e);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // When selected tender changes, fetch details & graph
  useEffect(() => {
    if (!selectedTenderId) return;

    let isMounted = true;
    setIsLoadingDetail(true);

    Promise.all([fetchTenderDetail(selectedTenderId), fetchPriceDistribution(selectedTenderId)])
      .then(([detail, dist]) => {
        if (isMounted) {
          setTenderDetail(detail);
          setPriceDist(dist);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        if (isMounted) setIsLoadingDetail(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedTenderId]);

  // Keyboard navigation: J (down), K (up), E (subpoena), A (audit trail), Esc (close)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape') {
        setIsSubpoenaOpen(false);
        setIsDismissOpen(false);
        setIsAuditTrailOpen(false);
        return;
      }

      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setIsSubpoenaOpen(true);
        return;
      }

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setIsAuditTrailOpen((prev) => !prev);
        return;
      }

      if (!tenders || tenders.length === 0) return;
      const currentIndex = tenders.findIndex((t) => t.id === selectedTenderId);

      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, tenders.length - 1);
        setSelectedTenderId(tenders[nextIndex].id);
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        setSelectedTenderId(tenders[prevIndex].id);
      }
    },
    [tenders, selectedTenderId]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auditor action handlers
  const handleConfirmSubpoena = async (notes: string) => {
    if (!selectedTenderId) return;
    await postDisposition(selectedTenderId, 'ESCALATE', notes);
    const [updatedStats, logs] = await Promise.all([fetchStats(), fetchAuditLogs()]);
    setStats(updatedStats);
    setAuditLogCount(logs.length);
  };

  const handleConfirmDismiss = async (reason: string) => {
    if (!selectedTenderId) return;
    await postDisposition(selectedTenderId, 'DISMISS', reason);
    // Refresh tender list and detail to reflect active learning discount
    const [s, tData, detail, logs] = await Promise.all([
      fetchStats(),
      fetchTenders({ limit: 500 }),
      fetchTenderDetail(selectedTenderId),
      fetchAuditLogs(),
    ]);
    setStats(s);
    setTenders(tData.items);
    setTenderDetail(detail);
    setAuditLogCount(logs.length);
  };

  const handleAgencyInquest = async () => {
    if (!selectedTenderId) return;
    await postDisposition(
      selectedTenderId,
      'INQUEST',
      'Dispatched to Section 3(3) Cartel Inquest Unit for multi-agency forensic verification.'
    );
    const logs = await fetchAuditLogs();
    setAuditLogCount(logs.length);
    setIsAuditTrailOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-canvas text-slate-100 overflow-hidden font-sans">
      {/* Top Authentic Global Institutional Audit Header */}
      <CommandHeader
        stats={stats}
        selectedTenderId={selectedTenderId}
        onOpenAuditTrail={() => setIsAuditTrailOpen(true)}
        auditLogCount={auditLogCount}
      />

      {/* 3-Pane High-Density Unified Cockpit */}
      <main className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Pane 1: Feed & Filter / Triage Table (cols 1-3, ~25%) */}
        <section className="col-span-12 md:col-span-4 lg:col-span-3.5 xl:col-span-3 h-full overflow-hidden">
          <TriageTable
            tenders={tenders}
            selectedTenderId={selectedTenderId}
            onSelectTender={setSelectedTenderId}
            isLoading={isLoadingList}
          />
        </section>

        {/* Pane 2: Central Visual Anchor - Collusion Subgraph Canvas & Price Curve (cols 4-8, ~45%) */}
        <section className="col-span-12 md:col-span-5 lg:col-span-5 xl:col-span-5.5 h-full flex flex-col overflow-hidden border-r border-border">
          {/* Subgraph Canvas */}
          <div className="flex-1 h-3/5 overflow-hidden">
            <CollusionGraph
              nodes={tenderDetail?.graph_eval.subgraph.nodes || []}
              edges={tenderDetail?.graph_eval.subgraph.edges || []}
              tenderTitle={tenderDetail?.tender.title || 'Collusion Network'}
            />
          </div>

          {/* Historical CPV Price Distribution Curve */}
          <div className="h-2/5 overflow-hidden">
            <PriceDistributionCurve
              distribution={priceDist}
              currentBidAmount={tenderDetail?.tender.amount || 0}
            />
          </div>
        </section>

        {/* Pane 3: Natural-Language Evidence Dossier & Disposition (cols 9-12, ~30%) */}
        <section className="col-span-12 md:col-span-3 lg:col-span-3.5 xl:col-span-3.5 h-full overflow-hidden">
          <EvidenceDossier
            tenderDetail={tenderDetail}
            onEscalate={() => setIsSubpoenaOpen(true)}
            onPeerReview={handleAgencyInquest}
            onDismiss={() => setIsDismissOpen(true)}
            onOpenAuditTrail={() => setIsAuditTrailOpen(true)}
            isLoading={isLoadingDetail}
          />
        </section>
      </main>

      {/* Modals & Slide-over Drawer */}
      <SubpoenaModal
        isOpen={isSubpoenaOpen}
        onClose={() => setIsSubpoenaOpen(false)}
        tenderId={tenderDetail?.tender.id || ''}
        tenderTitle={tenderDetail?.tender.title || ''}
        winnerName={tenderDetail?.tender.winning_vendor_name || ''}
        buyerName={tenderDetail?.tender.buyer_name || ''}
        onConfirm={handleConfirmSubpoena}
      />

      <DismissModal
        isOpen={isDismissOpen}
        onClose={() => setIsDismissOpen(false)}
        tenderId={tenderDetail?.tender.id || ''}
        tenderTitle={tenderDetail?.tender.title || ''}
        onConfirm={handleConfirmDismiss}
      />

      <AuditTrailDrawer
        isOpen={isAuditTrailOpen}
        onClose={() => setIsAuditTrailOpen(false)}
        activeTenderId={selectedTenderId || undefined}
      />
    </div>
  );
};

export default App;
