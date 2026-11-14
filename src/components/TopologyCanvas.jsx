import React, { useState, useRef, useEffect } from 'react';
import { 
  Smartphone, 
  Skull, 
  ShieldCheck, 
  Router, 
  KeyRound, 
  Cpu, 
  Database, 
  Lock, 
  HardDrive, 
  Activity, 
  Flame, 
  AlertTriangle, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Move,
  Bug,
  Code2,
  Search,
  Info
} from 'lucide-react';

const ICON_MAP = {
  Smartphone,
  Skull,
  ShieldCheck,
  Router,
  KeyRound,
  Cpu,
  Database,
  Lock,
  HardDrive,
  Activity
};

// Brand accent colors for AWS components
const AWS_SERVICE_COLORS = {
  client_app: { border: '#06b6d4', text: '#38bdf8', bg: 'rgba(6, 182, 212, 0.1)' },
  attacker: { border: '#e11d48', text: '#fb7185', bg: 'rgba(225, 29, 72, 0.1)' },
  waf: { border: '#ef4444', text: '#f87171', bg: 'rgba(239, 68, 68, 0.1)' },
  apigw: { border: '#0ea5e9', text: '#38bdf8', bg: 'rgba(14, 165, 233, 0.1)' },
  cognito: { border: '#f97316', text: '#fb923c', bg: 'rgba(249, 115, 22, 0.1)' },
  eks_microservices: { border: '#f97316', text: '#fb923c', bg: 'rgba(249, 115, 22, 0.1)' },
  rds_db: { border: '#a855f7', text: '#c084fc', bg: 'rgba(168, 85, 247, 0.1)' },
  kms: { border: '#f43f5e', text: '#fb7185', bg: 'rgba(244, 63, 94, 0.1)' },
  s3_backups: { border: '#22c55e', text: '#4ade80', bg: 'rgba(34, 197, 94, 0.1)' },
  cloudwatch_siem: { border: '#10b981', text: '#34d399', bg: 'rgba(16, 185, 129, 0.1)' }
};

// High-contrast, glowing link category colors
const LINK_CATEGORY_COLORS = {
  app: { base: '#0284c7', active: '#38bdf8', aura: 'rgba(14, 165, 233, 0.35)' },
  auth: { base: '#d97706', active: '#fbbf24', aura: 'rgba(245, 158, 11, 0.35)' },
  data: { base: '#7c3aed', active: '#c084fc', aura: 'rgba(139, 92, 246, 0.35)' },
  crypto: { base: '#db2777', active: '#f472b6', aura: 'rgba(236, 72, 153, 0.35)' },
  storage: { base: '#059669', active: '#34d399', aura: 'rgba(16, 185, 129, 0.35)' },
  siem: { base: '#0d9488', active: '#2dd4bf', aura: 'rgba(13, 148, 136, 0.35)' },
  attack: { base: '#e11d48', active: '#fb7185', aura: 'rgba(225, 29, 72, 0.45)' }
};

export default function TopologyCanvas({
  trustBoundaries,
  nodes,
  links,
  activePackets = [],
  nodeMetrics = {},
  breachedNodes = {},
  mode,
  onNodeClick,
  onPacketClick,
  onNodeMove
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartCoordsRef = useRef({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const pinchRef = useRef({ dist: 0, zoom: 1 });
  const didAutoFitRef = useRef(false);

  useEffect(() => {
    if (didAutoFitRef.current || !containerRef.current) return;
    const w = containerRef.current.clientWidth;
    if (w < 1280) {
      setZoom(Math.min(1, Math.max(0.32, w / 1680)));
    }
    didAutoFitRef.current = true;
  }, []);

  const getNodePos = (id) => {
    const node = nodes.find(n => n.id === id);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x + 107, y: node.y + 55 };
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.node-card')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (draggingNodeId) {
      const dist = Math.hypot(e.clientX - dragStartCoordsRef.current.x, e.clientY - dragStartCoordsRef.current.y);
      if (dist > 3) {
        isDraggingRef.current = true;
      }

      const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      const rawX = (e.clientX - containerRect.left - pan.x) / zoom - dragOffset.x;
      const rawY = (e.clientY - containerRect.top - pan.y) / zoom - dragOffset.y;

      const snappedX = Math.round(rawX / 16) * 16;
      const snappedY = Math.round(rawY / 16) * 16;

      if (onNodeMove) {
        onNodeMove(draggingNodeId, Math.max(10, snappedX), Math.max(10, snappedY));
      }
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    // Margen de 120ms para que el click posterior detecte que fue un arrastre y NO abra el modal
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 120);
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('.node-card')) return;
    if (e.touches.length === 1) {
      const t = e.touches[0];
      setIsPanning(true);
      setPanStart({ x: t.clientX - pan.x, y: t.clientY - pan.y });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchRef.current = { dist, zoom };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isPanning && !draggingNodeId) {
      const t = e.touches[0];
      setPan({ x: t.clientX - panStart.x, y: t.clientY - panStart.y });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (pinchRef.current.dist > 0) {
        const ratio = dist / pinchRef.current.dist;
        setZoom(Math.min(1.8, Math.max(0.35, pinchRef.current.zoom * ratio)));
      }
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    pinchRef.current.dist = 0;
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 120);
  };

  const handleNodeDragStart = (e, nodeId) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    dragStartCoordsRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;

    const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const mouseCanvasX = (e.clientX - containerRect.left - pan.x) / zoom;
    const mouseCanvasY = (e.clientY - containerRect.top - pan.y) / zoom;

    setDraggingNodeId(nodeId);
    setDragOffset({
      x: mouseCanvasX - node.x,
      y: mouseCanvasY - node.y
    });
  };

  const handleNodeCardClick = (e, node) => {
    e.stopPropagation();
    // Si el usuario movió o arrastró el nodo, NUNCA abrimos el menú/modal
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`relative w-full h-full min-h-[200px] min-[360px]:min-h-[260px] sm:min-h-[340px] md:min-h-[380px] tablet:min-h-[420px] xl:min-h-[480px] max-h-[75dvh] landscape:max-h-none overflow-hidden bg-slate-950 select-none topology-grid touch-none ${
        isPanning ? 'cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* Zoom / View Toolbar */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-30 flex items-center gap-0.5 sm:gap-1 bg-slate-900/95 border border-slate-700 p-1 rounded-lg shadow-xl backdrop-blur-md font-mono text-xs">
        <button
          onClick={() => setZoom(z => Math.max(0.35, z - 0.15))}
          className="touch-target-sm p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="px-2 py-0.5 text-[11px] font-bold text-cyan-400">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(z => Math.min(1.8, z + 0.15))}
          className="touch-target-sm p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            const w = containerRef.current?.clientWidth || 1200;
            const autoZoom = w < 1280 ? Math.min(1, Math.max(0.32, w / 1680)) : 1;
            setZoom(autoZoom);
            setPan({ x: 0, y: 0 });
          }}
          className="touch-target-sm p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition border-l border-slate-800 ml-0.5"
          title="Restablecer Vista"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Pannable / Scalable Board */}
      <div 
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isPanning || draggingNodeId ? 'none' : 'transform 0.1s ease-out'
        }}
        className="relative"
      >
        <svg 
          className="absolute inset-0 pointer-events-none" 
          width="1600" 
          height="660" 
          style={{ minWidth: '1600px', minHeight: '660px' }}
        >
          <defs>
            <filter id="glowPacket" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Trust Boundaries Containers */}
          {trustBoundaries.map((tb) => (
            <g key={tb.id}>
              <rect
                x={tb.x}
                y={tb.y}
                width={tb.width}
                height={tb.height}
                rx="10"
                fill={tb.color}
                stroke={tb.borderColor}
                strokeWidth="1.2"
                strokeDasharray="5,4"
              />
              <foreignObject x={tb.x + 10} y={tb.y + 8} width={tb.width - 20} height="40">
                <div className="flex flex-col font-mono">
                  <span className="text-[10px] font-bold text-slate-300 uppercase">
                    {tb.id}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate">
                    {tb.name}
                  </span>
                </div>
              </foreignObject>
            </g>
          ))}

          {/* 2. Topology Links */}
          {links.map((link) => {
            const sPos = getNodePos(link.source);
            const tPos = getNodePos(link.target);

            const midX = (sPos.x + tPos.x) / 2;
            const midY = (sPos.y + tPos.y) / 2;
            const deltaY = tPos.y - sPos.y;
            const curveY = midY + (deltaY === 0 ? -20 : 0);

            const pathD = `M ${sPos.x} ${sPos.y} Q ${midX} ${curveY} ${tPos.x} ${tPos.y}`;

            const packetsOnThisLink = activePackets.filter(
              pkt => pkt.state === 'traveling' &&
                     ((pkt.currentNode === link.source && pkt.nextNode === link.target) ||
                      (pkt.currentNode === link.target && pkt.nextNode === link.source))
            );
            const hasPacketsOnLink = packetsOnThisLink.length > 0;
            const hasAttackOnLink = packetsOnThisLink.some(p => p.category === 'attack');

            const colorConfig = LINK_CATEGORY_COLORS[link.category] || LINK_CATEGORY_COLORS.app;
            const linkColor = hasAttackOnLink ? '#f43f5e' : hasPacketsOnLink ? colorConfig.active : colorConfig.base;
            const labelWidth = Math.max(76, link.label.length * 6.3 + 18);

            return (
              <g key={link.id} className="transition-all duration-300">
                {/* Capa 1: Aura Difusa de Resplandor Fibra Óptica */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={linkColor}
                  strokeWidth={hasPacketsOnLink ? '9' : '5.5'}
                  opacity={hasPacketsOnLink ? '0.45' : '0.15'}
                />

                {/* Capa 2: Cable Central Sólido y Grueso */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={linkColor}
                  strokeWidth={hasPacketsOnLink ? '4' : '2.8'}
                  opacity={hasPacketsOnLink ? '1' : '0.8'}
                  className={hasAttackOnLink ? 'link-blocked' : hasPacketsOnLink ? 'link-flowing' : ''}
                />

                {/* Capa 3: Puertos Terminales Físicos en Origen y Destino */}
                <circle cx={sPos.x} cy={sPos.y} r="6" fill="#020617" stroke={linkColor} strokeWidth="2.2" />
                <circle cx={sPos.x} cy={sPos.y} r="2.5" fill={hasAttackOnLink ? '#f43f5e' : '#10b981'} />

                <circle cx={tPos.x} cy={tPos.y} r="6" fill="#020617" stroke={linkColor} strokeWidth="2.2" />
                <circle cx={tPos.x} cy={tPos.y} r="2.5" fill={hasAttackOnLink ? '#f43f5e' : '#10b981'} />

                {/* Capa 4: Chip Técnico Flotante con el Nombre del Protocolo / Enlace */}
                <g transform={`translate(${midX}, ${curveY - 7})`}>
                  <rect
                    x={-labelWidth / 2}
                    y="-9"
                    width={labelWidth}
                    height="18"
                    rx="4"
                    fill="#050914"
                    stroke={hasPacketsOnLink ? linkColor : 'rgba(148, 163, 184, 0.45)'}
                    strokeWidth="1.3"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill={hasPacketsOnLink ? '#ffffff' : '#cbd5e1'}
                    fontSize="8.5"
                    fontFamily="Fira Code, monospace"
                    fontWeight={hasPacketsOnLink ? 'bold' : '500'}
                  >
                    {link.label}
                  </text>
                </g>
              </g>
            );
          })}

          {/* 3. In-Flight Packets (Con interpolación Bezier exacta y estados persistentes) */}
          {activePackets.map((pkt) => {
            let curX, curY;
            const isDocked = ['inspecting', 'dropped', 'breached', 'delivered'].includes(pkt.state);

            if (isDocked) {
              const targetPos = getNodePos(pkt.nextNode);
              curX = targetPos.x;
              curY = targetPos.y - (pkt.state === 'dropped' || pkt.state === 'breached' ? 36 : 28);
            } else {
              // Interpolación exacta a lo largo de la curva Bezier del cable
              const sPos = getNodePos(pkt.currentNode);
              const tPos = getNodePos(pkt.nextNode);
              const midX = (sPos.x + tPos.x) / 2;
              const deltaY = tPos.y - sPos.y;
              const curveY = (sPos.y + tPos.y) / 2 + (deltaY === 0 ? -20 : 0);

              const t = Math.max(0, Math.min(1, pkt.progress));
              const oneMinusT = 1 - t;
              curX = oneMinusT * oneMinusT * sPos.x + 2 * oneMinusT * t * midX + t * t * tPos.x;
              curY = oneMinusT * oneMinusT * sPos.y + 2 * oneMinusT * t * curveY + t * t * tPos.y;
            }

            const isDrop = pkt.state === 'dropped';
            const isBreach = pkt.state === 'breached';
            const isInspect = pkt.state === 'inspecting';
            const isDelivered = pkt.state === 'delivered';

            return (
              <g 
                key={pkt.id} 
                transform={`translate(${curX}, ${curY})`}
                className="pointer-events-auto cursor-pointer"
                onClick={() => onPacketClick && onPacketClick(pkt)}
              >
                {/* 1. Halo de pulso radar */}
                <circle
                  r={isDrop || isBreach ? '18' : isInspect ? '14' : '10'}
                  fill={isDrop || isBreach ? '#ef4444' : isInspect ? '#06b6d4' : isDelivered ? '#10b981' : pkt.color}
                  opacity={isDocked ? '0.6' : '0.35'}
                  className="animate-ping"
                />

                {/* 2. Núcleo central del paquete */}
                <circle
                  r={isDocked ? '7.5' : '6'}
                  fill={isDrop || isBreach ? '#dc2626' : isInspect ? '#0891b2' : isDelivered ? '#059669' : pkt.color}
                  stroke="#ffffff"
                  strokeWidth={isDocked ? '2' : '1.5'}
                  filter="url(#glowPacket)"
                />

                {/* 3. Etiqueta / Tarjeta Flotante Técnica */}
                {isDrop ? (
                  <g transform="translate(0, -22)">
                    <rect
                      x="-65"
                      y="-12"
                      width="130"
                      height="22"
                      rx="5"
                      fill="#450a0a"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      filter="url(#glowPacket)"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill="#fecaca"
                      fontSize="9"
                      fontFamily="Fira Code, monospace"
                      fontWeight="bold"
                    >
                      ⛔ {pkt.id} · DROP 403
                    </text>
                  </g>
                ) : isBreach ? (
                  <g transform="translate(0, -22)">
                    <rect
                      x="-70"
                      y="-12"
                      width="140"
                      height="22"
                      rx="5"
                      fill="#4a044e"
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                      filter="url(#glowPacket)"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill="#fbcfe8"
                      fontSize="9"
                      fontFamily="Fira Code, monospace"
                      fontWeight="bold"
                    >
                      💥 {pkt.id} · ¡BRECHA!
                    </text>
                  </g>
                ) : isDelivered ? (
                  <g transform="translate(0, -22)">
                    <rect
                      x="-60"
                      y="-12"
                      width="120"
                      height="22"
                      rx="5"
                      fill="#064e3b"
                      stroke="#10b981"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill="#a7f3d0"
                      fontSize="9"
                      fontFamily="Fira Code, monospace"
                      fontWeight="bold"
                    >
                      ✅ {pkt.id} · 200 OK
                    </text>
                  </g>
                ) : isInspect ? (
                  <g transform="translate(0, -20)">
                    <rect
                      x="-60"
                      y="-10"
                      width="120"
                      height="18"
                      rx="4"
                      fill="#082f49"
                      stroke="#06b6d4"
                      strokeWidth="1.2"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill="#e0f2fe"
                      fontSize="8.5"
                      fontFamily="Fira Code, monospace"
                      fontWeight="bold"
                    >
                      🔍 {pkt.id} · EVALUANDO
                    </text>
                  </g>
                ) : (
                  <g transform="translate(0, -18)">
                    <rect
                      x="-42"
                      y="-9"
                      width="84"
                      height="16"
                      rx="4"
                      fill="#020617"
                      stroke={pkt.color}
                      strokeWidth="1.2"
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8"
                      fontFamily="Fira Code, monospace"
                      fontWeight="bold"
                    >
                      {pkt.id} · {pkt.method}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* 4. Draggable Nodes with Professional Cloud Architecture Styling */}
        <div className="relative z-10 min-w-[1600px] h-[660px]">
          {nodes.map((node) => {
            const IconComponent = ICON_MAP[node.icon] || Cpu;
            const metrics = nodeMetrics[node.id] || { processed: 0, drops: 0, load: 5 };
            const breachInfo = breachedNodes[node.id];
            const colors = AWS_SERVICE_COLORS[node.id] || { border: '#38bdf8', text: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)' };

            // Check if there is a packet currently inspecting, dropped or delivered inside this node
            const isInspecting = activePackets.some(p => p.state === 'inspecting' && p.nextNode === node.id);
            const activeDrop = activePackets.find(p => p.state === 'dropped' && p.nextNode === node.id);
            const activeDelivered = activePackets.find(p => p.state === 'delivered' && p.nextNode === node.id);

            return (
              <div
                key={node.id}
                onClick={(e) => handleNodeCardClick(e, node)}
                onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: '215px'
                }}
                className={`node-card cursor-grab active:cursor-grabbing rounded-xl p-3 transition-all duration-200 border shadow-xl font-mono text-xs select-none backdrop-blur-md ${
                  breachInfo
                    ? 'bg-rose-950/95 border-rose-500 node-danger-ring scale-105 z-30'
                    : activeDrop
                      ? 'bg-rose-950/80 border-rose-400 ring-2 ring-rose-500/60 scale-105 z-25 shadow-rose-950'
                      : isInspecting
                        ? 'bg-slate-900 border-cyan-400 node-active-ring scale-105 z-20 shadow-cyan-950/50'
                        : activeDelivered
                          ? 'bg-emerald-950/60 border-emerald-400 ring-1 ring-emerald-500/50 scale-105 z-20'
                          : 'bg-slate-900/90 hover:bg-slate-800/95 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Strip Accent with Service Color */}
                <div 
                  className="h-1 rounded-full mb-2 transition"
                  style={{ 
                    backgroundColor: breachInfo || activeDrop ? '#ef4444' : isInspecting ? '#06b6d4' : activeDelivered ? '#10b981' : colors.border 
                  }}
                />

                {/* Header: Asset Code, Boundary & Dedicated Move / Info buttons */}
                <div className="flex items-center justify-between text-[9px] mb-1.5 text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-slate-200">{node.assetId}</span>
                    <span className="text-[8px] px-1 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {node.boundaryId}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Botón explícito para inspeccionar arquitectura */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNodeClick) onNodeClick(node);
                      }}
                      className="p-1 rounded bg-slate-800/90 hover:bg-cyan-950 text-slate-400 hover:text-cyan-300 border border-slate-700/70 transition"
                      title="Ver detalles de configuración y amenazas"
                    >
                      <Info className="w-3 h-3" />
                    </button>

                    {/* Agarrador explícito para mover el nodo */}
                    <div
                      onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-grab active:cursor-grabbing px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 transition shadow-sm select-none"
                      title="Mantén presionado para arrastrar y mover el nodo libremente"
                    >
                      <Move className="w-2.5 h-2.5 text-cyan-400" />
                      <span className="text-[8px] font-bold tracking-tight">MOVER</span>
                    </div>
                  </div>
                </div>

                {/* Node Title & Icon */}
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="p-1.5 rounded-lg border transition"
                    style={{ 
                      backgroundColor: colors.bg, 
                      borderColor: colors.border,
                      color: colors.text
                    }}
                  >
                    {breachInfo?.type === 'worm' ? <Bug className="w-4 h-4 text-purple-300 animate-pulse" /> :
                     breachInfo?.type === 'ransomware' ? <Lock className="w-4 h-4 text-rose-300 animate-pulse" /> :
                     breachInfo?.type === 'xss' ? <Code2 className="w-4 h-4 text-amber-300 animate-pulse" /> :
                     <IconComponent className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-100 truncate text-[11px]" title={node.name}>
                      {node.name}
                    </h4>
                    <p className="text-[9px] text-slate-400 truncate">{node.role}</p>
                  </div>
                </div>

                {/* Technical Counters */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-[9px] text-center">
                  <div className="bg-slate-950 p-1 rounded border border-slate-800/60">
                    <span className="text-slate-500 block text-[8px]">PROCESADOS</span>
                    <span className="font-bold text-cyan-400">{metrics.processed}</span>
                  </div>
                  <div className="bg-slate-950 p-1 rounded border border-slate-800/60">
                    <span className="text-slate-500 block text-[8px]">DROPS</span>
                    <span className={`font-bold ${metrics.drops > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                      {metrics.drops}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-1 rounded border border-slate-800/60">
                    <span className="text-slate-500 block text-[8px]">CARGA</span>
                    <span className={`font-bold ${metrics.load > 70 ? 'text-rose-400' : metrics.load > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {metrics.load}%
                    </span>
                  </div>
                </div>

                {/* Mini Load Progress Bar */}
                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-1.5 border border-slate-800/70">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      metrics.load > 70 ? 'bg-rose-500' : metrics.load > 40 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, metrics.load)}%` }}
                  />
                </div>

                {/* Active Drop Banner when security rule blocked packet */}
                {activeDrop && (
                  <div className="mt-2 py-1 px-1.5 rounded bg-rose-950 border border-rose-500 text-[9px] text-rose-200 font-bold animate-pulse space-y-0.5 shadow-md">
                    <div className="flex items-center gap-1 text-rose-300">
                      <ShieldCheck className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>CONTROL ACTIVO: DROP {activeDrop.dropHttpCode || 403}</span>
                    </div>
                    <p className="text-[8px] text-rose-300/80 font-normal leading-tight truncate">
                      {activeDrop.dropReason || 'Petición maliciosa descartada'}
                    </p>
                  </div>
                )}

                {/* Active Inspection Balloon when packet is docked in node */}
                {isInspecting && !activeDrop && (
                  <div className="mt-2 py-0.5 px-1.5 rounded bg-cyan-950 border border-cyan-500 text-[9px] text-cyan-300 font-bold text-center animate-pulse flex items-center justify-center gap-1">
                    <Search className="w-3 h-3 text-cyan-400 animate-spin" />
                    <span>INSPECCIONANDO REGLA...</span>
                  </div>
                )}

                {/* Active Delivered Confirmation */}
                {activeDelivered && !isInspecting && !activeDrop && (
                  <div className="mt-2 py-0.5 px-1.5 rounded bg-emerald-950 border border-emerald-500 text-[9px] text-emerald-300 font-bold text-center flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>200 OK ENTREGADO</span>
                  </div>
                )}

                {/* Breach Banner */}
                {breachInfo && (
                  <div className="mt-2 p-1.5 rounded bg-rose-950/90 border border-rose-500 text-[9px] text-rose-200 font-bold animate-pulse space-y-0.5">
                    <div className="flex items-center gap-1 text-rose-300">
                      <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="leading-tight">{breachInfo.label}</span>
                    </div>
                    {breachInfo.subtext && (
                      <p className="text-[8px] text-rose-300/80 font-normal leading-tight">
                        {breachInfo.subtext}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
