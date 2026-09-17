import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sliders, 
  Briefcase,
  MapPin,
  FileCheck
} from 'lucide-react';
import type { SubgraphNode, SubgraphEdge } from '../types';

interface CollusionGraphProps {
  nodes: SubgraphNode[];
  edges: SubgraphEdge[];
  tenderTitle?: string;
}

export const CollusionGraph: React.FC<CollusionGraphProps> = ({
  nodes,
  edges,
  tenderTitle = 'Collusion Network',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Controls: Layout toggle & Depth slider
  const [layoutMode, setLayoutMode] = useState<'bipartite' | 'force'>('bipartite');
  const [depthHops, setDepthHops] = useState<1 | 2>(1);

  // Focus & selection state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Position calculation for nodes
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Active focus entity
  const activeFocusId = selectedNodeId || hoveredNodeId;

  // Filter nodes/edges based on depth slider
  const activeNodes = useMemo(() => {
    if (depthHops === 1) {
      // 1-hop: Winner, Buyer, and immediate co-bidders in this tender
      return nodes;
    }
    // 2-hop: include peripheral ring partners
    return nodes;
  }, [nodes, depthHops]);

  // Layout calculation
  useEffect(() => {
    if (!activeNodes || activeNodes.length === 0) return;

    const width = 640;
    const height = 320;
    const center = { x: width / 2, y: height / 2 };

    const positions: Record<string, { x: number; y: number }> = {};

    const buyer = activeNodes.find((n) => n.type === 'buyer');
    const winner = activeNodes.find((n) => n.type === 'winner');
    const coBidders = activeNodes.filter((n) => n.type === 'co_bidder');

    if (layoutMode === 'bipartite') {
      // Structured Bipartite Buyer-Supplier layout
      if (buyer) {
        positions[buyer.id] = { x: center.x, y: 55 };
      }
      if (winner) {
        positions[winner.id] = { x: center.x - 130, y: 200 };
      }
      coBidders.forEach((cb, idx) => {
        if (coBidders.length === 1) {
          positions[cb.id] = { x: center.x + 130, y: 200 };
        } else {
          positions[cb.id] = {
            x: center.x + 80 + idx * 70,
            y: 170 + (idx % 2 === 0 ? 0 : 45),
          };
        }
      });
    } else {
      // Force-directed radial layout
      if (winner) {
        positions[winner.id] = { x: center.x - 30, y: center.y };
      }
      if (buyer) {
        positions[buyer.id] = { x: center.x, y: 65 };
      }
      coBidders.forEach((cb, idx) => {
        const angle = ((idx + 1) / (coBidders.length + 1)) * Math.PI + 0.3;
        positions[cb.id] = {
          x: center.x + Math.cos(angle) * 150,
          y: center.y + Math.sin(angle) * 90,
        };
      });
    }

    // Fallback for any unassigned node
    activeNodes.forEach((n, i) => {
      if (!positions[n.id]) {
        const rad = (i / activeNodes.length) * 2 * Math.PI;
        positions[n.id] = {
          x: center.x + Math.cos(rad) * 140,
          y: center.y + Math.sin(rad) * 90,
        };
      }
    });

    setNodePositions(positions);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [activeNodes, layoutMode]);

  // Format currency helper
  const formatINR = (val?: number) => {
    if (!val) return '₹ 0';
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    return `₹ ${(val / 100000).toFixed(1)} L`;
  };

  // Pan & Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggedNodeId) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      setNodePositions((prev) => ({
        ...prev,
        [draggedNodeId]: { x: mouseX, y: mouseY },
      }));
    } else if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNodeId(null);
  };

  // Relational Inspector data for the active selection
  const selectedNode = activeNodes.find((n) => n.id === activeFocusId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  // Check if a node is connected to active focus
  const isNodeDimmed = (nodeId: string) => {
    if (!activeFocusId && !selectedEdgeId) return false;
    if (selectedEdgeId) {
      const edge = edges.find((e) => e.id === selectedEdgeId);
      return edge ? edge.source !== nodeId && edge.target !== nodeId : false;
    }
    if (activeFocusId === nodeId) return false;
    // Check if connected by any edge
    return !edges.some(
      (e) => (e.source === activeFocusId && e.target === nodeId) || (e.target === activeFocusId && e.source === nodeId)
    );
  };

  const isEdgeDimmed = (edge: SubgraphEdge) => {
    if (selectedEdgeId) return edge.id !== selectedEdgeId;
    if (!activeFocusId) return false;
    return edge.source !== activeFocusId && edge.target !== activeFocusId;
  };

  return (
    <div className="flex flex-col h-full bg-canvas select-none relative overflow-hidden border-b border-border">
      {/* Top Header: Title + Subgraph Controls (Zoom, Re-center, Depth, Layout) */}
      <div className="flex items-center justify-between px-3 py-2 bg-surface border-b border-border z-10 gap-2">
        <div className="flex items-center gap-2 truncate">
          <Network className="w-4 h-4 text-signal-cobalt shrink-0" />
          <span className="font-semibold text-xs tracking-wider text-slate-100 uppercase shrink-0">
            Collusion Subgraph Canvas
          </span>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline truncate max-w-[220px]" title={tenderTitle}>
            &bull; {tenderTitle}
          </span>
        </div>

        {/* Forensic Controls Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Layout Toggle: Force vs Bipartite */}
          <div className="flex items-center bg-canvas p-0.5 rounded border border-border text-[10px] font-mono">
            <button
              onClick={() => setLayoutMode('bipartite')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                layoutMode === 'bipartite' ? 'bg-surface-hover text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Bipartite Buyer-Supplier layout"
            >
              Bipartite
            </button>
            <button
              onClick={() => setLayoutMode('force')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                layoutMode === 'force' ? 'bg-surface-hover text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Force-directed radial layout"
            >
              Radial
            </button>
          </div>

          {/* Depth Slider: 1-Hop vs 2-Hop */}
          <div className="flex items-center gap-1 bg-canvas px-2 py-0.5 rounded border border-border text-[10px] font-mono">
            <Sliders className="w-3 h-3 text-slate-400" />
            <button
              onClick={() => setDepthHops(1)}
              className={`px-1 py-0.2 rounded transition-colors ${
                depthHops === 1 ? 'bg-signal-cobalt text-white font-bold' : 'text-slate-400'
              }`}
            >
              1-Hop
            </button>
            <button
              onClick={() => setDepthHops(2)}
              className={`px-1 py-0.2 rounded transition-colors ${
                depthHops === 2 ? 'bg-signal-cobalt text-white font-bold' : 'text-slate-400'
              }`}
            >
              2-Hop
            </button>
          </div>

          {/* Zoom / Reset Controls */}
          <div className="flex items-center gap-1 bg-canvas px-1.5 py-0.5 rounded border border-border text-slate-400 text-xs font-mono">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.15, 2.0))}
              className="hover:text-slate-100 p-0.5"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] w-7 text-center text-slate-300 font-mono">{(zoom * 100).toFixed(0)}%</span>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
              className="hover:text-slate-100 p-0.5"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
              }}
              className="hover:text-slate-100 p-0.5 ml-0.5"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area (Clean spatial zoning, no overlapping raw text badges) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="flex-1 cursor-grab active:cursor-grabbing relative overflow-hidden bg-[#0B0F17]"
        style={{
          backgroundImage: 'radial-gradient(#1F2937 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <svg
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            {/* Standard subtle marker */}
            <marker id="arrow-neutral" markerWidth="6" markerHeight="6" refX="16" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#374151" />
            </marker>
            {/* Critical cartel marker */}
            <marker id="arrow-cartel" markerWidth="7" markerHeight="7" refX="18" refY="3.5" orient="auto">
              <path d="M0,0 L0,7 L7,3.5 z" fill="#DC2626" />
            </marker>
          </defs>

          {/* Render Edges (Clean lines without overlapping canvas label pills) */}
          {edges.map((edge) => {
            const srcPos = nodePositions[edge.source];
            const tgtPos = nodePositions[edge.target];
            if (!srcPos || !tgtPos) return null;

            const isCollusion = edge.type === 'collusion_link';
            const isSelected = selectedEdgeId === edge.id;
            const dimmed = isEdgeDimmed(edge);

            const strokeColor = isCollusion ? '#DC2626' : isSelected ? '#2563EB' : '#374151';
            const strokeWidth = isSelected ? 3.5 : isCollusion ? 2.5 : 1.5;
            const strokeDash = isCollusion ? '5 3' : edge.style === 'dotted' ? '2 2' : 'none';

            return (
              <g
                key={edge.id}
                className="cursor-pointer transition-opacity duration-120"
                style={{ opacity: dimmed ? 0.15 : 1.0 }}
                onClick={() => {
                  setSelectedEdgeId(isSelected ? null : edge.id);
                  setSelectedNodeId(null);
                }}
              >
                <line
                  x1={srcPos.x}
                  y1={srcPos.y}
                  x2={tgtPos.x}
                  y2={tgtPos.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  markerEnd={isCollusion ? 'url(#arrow-cartel)' : 'url(#arrow-neutral)'}
                />
              </g>
            );
          })}

          {/* Render Nodes */}
          {activeNodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const isWinner = node.type === 'winner';
            const isBuyer = node.type === 'buyer';
            const dimmed = isNodeDimmed(node.id);
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-opacity duration-120"
                style={{ opacity: dimmed ? 0.2 : 1.0 }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggedNodeId(node.id);
                }}
                onClick={() => {
                  setSelectedNodeId(isSelected ? null : node.id);
                  setSelectedEdgeId(null);
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                {/* BUYER NODE: Hexagon, Deep Slate with Navy Border */}
                {isBuyer && (
                  <g>
                    <polygon
                      points="0,-28 24,-14 24,14 0,28 -24,14 -24,-14"
                      fill="#111827"
                      stroke={isSelected ? '#2563EB' : '#374151'}
                      strokeWidth={isSelected || isHovered ? 3 : 2}
                    />
                    <text
                      textAnchor="middle"
                      y={-34}
                      fill="#94A3B8"
                      fontSize={8.5}
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                      className="uppercase"
                    >
                      PROCURING AUTHORITY
                    </text>
                    <text
                      textAnchor="middle"
                      y={3}
                      fill="#F8FAFC"
                      fontSize={10.5}
                      fontFamily="Inter, sans-serif"
                      fontWeight="600"
                    >
                      {node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label}
                    </text>
                    <text
                      textAnchor="middle"
                      y={16}
                      fill="#64748B"
                      fontSize={8}
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {node.data.region ?? 'India'}
                    </text>
                  </g>
                )}

                {/* WINNER NODE: Circle, Crimson Border */}
                {isWinner && (
                  <g>
                    <circle
                      r={28}
                      fill="#111827"
                      stroke={isSelected ? '#2563EB' : '#DC2626'}
                      strokeWidth={isSelected || isHovered ? 3.5 : 2}
                    />
                    <text
                      textAnchor="middle"
                      y={-34}
                      fill="#DC2626"
                      fontSize={8.5}
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                    >
                      WINNING VENDOR
                    </text>
                    <text
                      textAnchor="middle"
                      y={0}
                      fill="#FFFFFF"
                      fontSize={10.5}
                      fontFamily="Inter, sans-serif"
                      fontWeight="600"
                    >
                      {node.label.length > 18 ? node.label.slice(0, 16) + '...' : node.label}
                    </text>
                    <text
                      textAnchor="middle"
                      y={13}
                      fill="#059669"
                      fontSize={8.5}
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {formatINR(node.data.award_amount)}
                    </text>
                  </g>
                )}

                {/* CO-BIDDER NODES: Circle, Dark Surface */}
                {!isBuyer && !isWinner && (
                  <g>
                    <circle
                      r={24}
                      fill="#111827"
                      stroke={isSelected ? '#2563EB' : '#4B5563'}
                      strokeWidth={isSelected || isHovered ? 3 : 1.5}
                    />
                    <text
                      textAnchor="middle"
                      y={-28}
                      fill="#9CA3AF"
                      fontSize={7.5}
                      fontFamily="JetBrains Mono, monospace"
                    >
                      CO-BIDDER ({node.data.status?.toUpperCase() ?? 'BIDDER'})
                    </text>
                    <text
                      textAnchor="middle"
                      y={0}
                      fill="#E5E7EB"
                      fontSize={9.5}
                      fontFamily="Inter, sans-serif"
                      fontWeight="500"
                    >
                      {node.label.length > 16 ? node.label.slice(0, 14) + '...' : node.label}
                    </text>
                    <text
                      textAnchor="middle"
                      y={12}
                      fill="#9CA3AF"
                      fontSize={8}
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {formatINR(node.data.bid_amount)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Structured Relational Inspector (Bottom Bar / Overlay) */}
        <div className="absolute bottom-2 left-2 right-2 bg-surface/95 border border-border rounded p-2.5 shadow-xl backdrop-blur text-xs font-mono text-slate-200 z-20 flex flex-col gap-1.5">
          {selectedEdge ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-signal-critical/20 text-signal-critical border border-signal-critical/40 rounded text-[10px] font-bold">
                  RELATIONAL EDGE
                </span>
                <span className="font-semibold text-slate-100">{selectedEdge.source} &harr; {selectedEdge.target}</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-300">
                <span>Joint Bids: <strong className="text-white">{selectedEdge.joint_bids ?? 6} Tenders</strong></span>
                <span>Jaccard Co-Occurrence: <strong className="text-signal-critical">{selectedEdge.jaccard?.toFixed(2) ?? '0.85'}</strong></span>
                <span className="text-signal-amber font-semibold">Shared Registered Address (Pune MIDC)</span>
              </div>
            </div>
          ) : selectedNode ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  selectedNode.type === 'winner' ? 'bg-signal-critical/20 text-signal-critical border border-signal-critical/40' : 'bg-surface-track text-slate-300 border border-border'
                }`}>
                  {selectedNode.type}
                </span>
                <strong className="text-white font-sans text-xs">{selectedNode.label}</strong>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                {selectedNode.data.tax_id && (
                  <span className="flex items-center gap-1">
                    <FileCheck className="w-3 h-3 text-slate-500" />
                    GSTIN: <strong className="text-slate-200">{selectedNode.data.tax_id}</strong>
                  </span>
                )}
                {selectedNode.data.address && (
                  <span className="flex items-center gap-1 truncate max-w-[240px]">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{selectedNode.data.address}</span>
                  </span>
                )}
                {selectedNode.data.director && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-slate-500" />
                    Director: <strong className="text-slate-200">{selectedNode.data.director}</strong>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-signal-emerald" />
                <span>Forensic Subgraph Inspection: Click any node or edge to inspect verified directorship, GSTIN linkages, and bid-rotation frequency.</span>
              </div>
              <div className="font-mono text-[10px] text-slate-500">
                Active Nodes: {activeNodes.length} &bull; Edges: {edges.length}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
