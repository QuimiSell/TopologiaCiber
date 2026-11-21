import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import SimulationRibbon from './components/SimulationRibbon';
import TopologyCanvas from './components/TopologyCanvas';
import DeviceToolbox from './components/DeviceToolbox';
import PacketTracerEventList from './components/PacketTracerEventList';
import LiveTelemetryChart from './components/LiveTelemetryChart';
import SocAlertsBanner from './components/SocAlertsBanner';
import SocIncidentModal from './components/SocIncidentModal';
import PduInspectionModal from './components/PduInspectionModal';
import NodeDetailsModal from './components/NodeDetailsModal';
import RiskMatrixModal from './components/RiskMatrixModal';
import InfoModal from './components/InfoModal';
import MobileBankMockup from './components/MobileBankMockup';

import { TRUST_BOUNDARIES, TOPOLOGY_NODES, TOPOLOGY_LINKS } from './data/topologyData';
import { createPacket } from './engine/packetEngine';
import {
  MEDIA_COMPACT_LANDSCAPE,
  MEDIA_SIDEBAR_LAYOUT
} from './config/layoutConfig';

export default function SimulatorApp() {
  // Mode: Protected (AWS Hardened) vs Vulnerable (Base architecture)
  const [mode, setMode] = useState('protected');
  const [isBackgroundTrafficOn, setIsBackgroundTrafficOn] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  // VELOCIDAD CALIBRADA: por defecto 0.5x para ritmo cómodo (opciones: 0.1x a 2x)
  const [simSpeed, setSimSpeed] = useState(0.5);

  // Dynamic Nodes State (Supports drag-and-drop repositioning)
  const [nodes, setNodes] = useState(TOPOLOGY_NODES);

  // Active in-flight packets and event history
  const [activePackets, setActivePackets] = useState([]);
  const [events, setEvents] = useState([]);
  
  // Active Breaches on Nodes: { [nodeId]: { label, subtext, type } }
  const [breachedNodes, setBreachedNodes] = useState({});

  // Active SOC Incident (P1 Critical Disaster modal)
  const [activeIncident, setActiveIncident] = useState(null);

  // Rolling Traffic History for Live Oscilloscope
  const [trafficHistory, setTrafficHistory] = useState([
    { time: '00', legitPps: 1, attackPps: 0 },
    { time: '01', legitPps: 2, attackPps: 0 },
    { time: '02', legitPps: 1, attackPps: 0 },
    { time: '03', legitPps: 2, attackPps: 0 }
  ]);
  const legitCounterRef = useRef(0);
  const attackCounterRef = useRef(0);

  // Real-time SOC Alarms
  const [socAlerts, setSocAlerts] = useState([]);

  // Technical counters & metrics per node
  const [stats, setStats] = useState({
    delivered: 0,
    drops: 0,
    breaches: 0
  });

  const [nodeMetrics, setNodeMetrics] = useState(() => {
    const init = {};
    TOPOLOGY_NODES.forEach(n => {
      init[n.id] = { processed: 0, drops: 0, load: Math.floor(Math.random() * 8 + 4) };
    });
    return init;
  });

  // UI Drawers & Modals State
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [isEventListOpen, setIsEventListOpen] = useState(true);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [selectedPduEvent, setSelectedPduEvent] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [isCompactLandscape, setIsCompactLandscape] = useState(false);

  // PC (≥1280): sidebar + PDU open; phones/tablets: drawer + collapse PDU in landscape
  useEffect(() => {
    const mqSidebar = window.matchMedia(MEDIA_SIDEBAR_LAYOUT);
    const mqLandscape = window.matchMedia(MEDIA_COMPACT_LANDSCAPE);

    const syncLayout = () => {
      const sidebar = mqSidebar.matches;
      const compact = mqLandscape.matches;
      setIsCompactLandscape(compact);
      setIsToolboxOpen(sidebar);
      setIsEventListOpen(sidebar && !compact);
    };

    syncLayout();
    mqSidebar.addEventListener('change', syncLayout);
    mqLandscape.addEventListener('change', syncLayout);
    return () => {
      mqSidebar.removeEventListener('change', syncLayout);
      mqLandscape.removeEventListener('change', syncLayout);
    };
  }, []);

  // Trigger SOC Alert helper
  const triggerAlert = useCallback((threatId, dread, message, device, status) => {
    const alertId = `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setSocAlerts(prev => [
      { id: alertId, threatId, dread, message, device, status, severity: dread >= 8.0 ? 'CRÍTICA' : 'ALTA' },
      ...prev.slice(0, 4)
    ]);

    setTimeout(() => {
      setSocAlerts(prev => prev.filter(a => a.id !== alertId));
    }, 6000);
  }, []);

  // Node Dragging Handler
  const handleNodeMove = (nodeId, newX, newY) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x: newX, y: newY } : n));
  };

  // Helper to add an event to the Packet Tracer table
  const addEvent = useCallback((eventData) => {
    const newEv = {
      eventId: `EV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('es-GT') + '.' + Math.floor(Math.random() * 900 + 100),
      ...eventData
    };
    setEvents(prev => [newEv, ...prev.slice(0, 200)]);
  }, []);

  // Helper to inject a packet
  const injectPacket = useCallback((typeKey, customOrigin = null) => {
    const newPkt = createPacket(typeKey, customOrigin);
    setActivePackets(prev => [...prev, newPkt]);

    if (newPkt.category === 'attack') {
      attackCounterRef.current += 1;
      triggerAlert(
        newPkt.threatId || 'AMZ-007',
        newPkt.dread || 8.2,
        `Petición maliciosa detectada: ${newPkt.method} ${newPkt.path}`,
        'Perímetro de Red',
        'DROP'
      );
    } else {
      legitCounterRef.current += 1;
    }

    const originNodeObj = nodes.find(n => n.id === newPkt.currentNode);
    addEvent({
      packetId: newPkt.id,
      deviceLabel: originNodeObj?.name || newPkt.currentNode,
      protocol: newPkt.protocol,
      method: newPkt.method,
      path: newPkt.path,
      payload: newPkt.payload,
      threatId: newPkt.threatId,
      dread: newPkt.dread,
      action: 'FORWARD',
      category: newPkt.category,
      sourceIp: newPkt.currentNode === 'client_app' ? '181.174.102.45' : '198.51.100.77'
    });
  }, [addEvent, nodes, triggerAlert]);

  // Attack injector wrapper
  const handleInjectAttack = (typeKey, customOrigin = null) => {
    if (typeKey === 'ATTACK_SERVER_COLLAPSE') {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => injectPacket('ATTACK_SERVER_COLLAPSE', customOrigin), (i * 250) / Math.max(0.2, simSpeed));
      }
    } else {
      injectPacket(typeKey, customOrigin);
    }
  };

  // Continuous background traffic interval (calibrated so canvas stays clean)
  useEffect(() => {
    if (!isBackgroundTrafficOn || isPaused) return;

    const baseInterval = 4200 / Math.max(0.2, simSpeed);
    const interval = setInterval(() => {
      const typeKey = Math.random() > 0.3 ? 'LEGITIMATE_QUERY' : 'LEGITIMATE_TRANSFER';
      injectPacket(typeKey);
    }, baseInterval);

    return () => clearInterval(interval);
  }, [isBackgroundTrafficOn, isPaused, injectPacket, simSpeed]);

  // Rolling Traffic Sampling (every 1 second)
  useEffect(() => {
    const sampleInterval = setInterval(() => {
      const nowTime = new Date().getSeconds().toString().padStart(2, '0');
      const legitPps = legitCounterRef.current;
      const attackPps = attackCounterRef.current;

      legitCounterRef.current = 0;
      attackCounterRef.current = 0;

      setTrafficHistory(prev => [
        ...prev.slice(prev.length > 25 ? 1 : 0),
        { time: nowTime, legitPps, attackPps }
      ]);
    }, 1000);

    return () => clearInterval(sampleInterval);
  }, []);

  // Main Packet Engine Tick (calibrated travel step + node inspection pause + persistent drop/breach display)
  useEffect(() => {
    if (isPaused) return;

    const tickInterval = setInterval(() => {
      setActivePackets(prevPackets => {
        if (prevPackets.length === 0) return prevPackets;

        const nextPackets = [];
        // CALIBRACIÓN DE VELOCIDAD:
        // A 1.0x -> 0.012 por tick (83 ticks * 50ms = ~4.1s por enlace)
        // A 0.5x -> 0.006 por tick (166 ticks * 50ms = ~8.3s por enlace)
        // A 0.25x -> 0.003 por tick (333 ticks * 50ms = ~16.6s por enlace, totalmente observable para narrar)
        // A 0.1x -> 0.0012 por tick (~41s por enlace)
        // A 0.05x -> 0.0006 por tick (~83s por enlace)
        const travelStep = 0.012 * Math.max(0.04, simSpeed);

        prevPackets.forEach(pkt => {
          // 1. ESTADOS DE PERMANENCIA VISUAL EN EL NODO (DROPPED / BREACHED / DELIVERED / INSPECTING)
          if (pkt.state === 'dropped' || pkt.state === 'breached' || pkt.state === 'delivered') {
            const remaining = pkt.dwellTicks - 1;
            if (remaining > 0) {
              nextPackets.push({ ...pkt, dwellTicks: remaining });
            }
            // Al agotarse el tiempo de exhibición visual, el paquete se retira limpiamente
            return;
          }

          if (pkt.state === 'inspecting') {
            const remaining = pkt.dwellTicks - 1;
            if (remaining > 0) {
              nextPackets.push({ ...pkt, dwellTicks: remaining });
            } else {
              // Pausa de inspección finalizada: avanzar al siguiente salto
              const nextHopIdx = pkt.currentHopIdx + 1;
              const hasMoreHops = nextHopIdx < pkt.fullPath.length - 1;

              if (hasMoreHops) {
                nextPackets.push({
                  ...pkt,
                  state: 'traveling',
                  currentHopIdx: nextHopIdx,
                  currentNode: pkt.nextNode,
                  nextNode: pkt.fullPath[nextHopIdx + 1],
                  progress: 0,
                  dwellTicks: 0,
                  statusText: `Enviando de ${pkt.nextNode} hacia ${pkt.fullPath[nextHopIdx + 1]}`
                });
              } else {
                // Llegada a destino final exitoso
                setStats(s => ({ ...s, delivered: s.delivered + 1 }));
                nextPackets.push({
                  ...pkt,
                  state: 'delivered',
                  progress: 1.0,
                  dwellTicks: Math.round(45 / Math.max(0.12, simSpeed)),
                  statusText: 'Transacción completada con éxito (HTTP 200 OK)'
                });
              }
            }
            return;
          }

          // 2. VIAJANDO A LO LARGO DEL ENLACE (CURVA BEZIER)
          const nextProgress = pkt.progress + travelStep;

          if (nextProgress < 1.0) {
            nextPackets.push({
              ...pkt,
              progress: nextProgress
            });
          } else {
            // LLEGADA AL NODO DESTINO DE ESTE SALTO
            const arrivedNodeId = pkt.nextNode;
            const nodeObj = nodes.find(n => n.id === arrivedNodeId);
            const nodeLabel = nodeObj?.name || arrivedNodeId;

            // Actualizar métricas del nodo
            setNodeMetrics(prev => ({
              ...prev,
              [arrivedNodeId]: {
                ...prev[arrivedNodeId],
                processed: (prev[arrivedNodeId]?.processed || 0) + 1,
                load: Math.min(95, (prev[arrivedNodeId]?.load || 5) + 6)
              }
            }));

            // Comprobar política de seguridad
            const isProtected = mode === 'protected';
            const isAttack = pkt.category === 'attack';
            const shouldDrop = isProtected && isAttack && pkt.dropAtNode === arrivedNodeId;

            // CASO A: BLOQUEO POR CONTROL DE SEGURIDAD (DROP)
            // IMPORTANTE: El paquete NO desaparece; se estaciona en el nodo mostrando la tarjeta de bloqueo
            if (shouldDrop) {
              setStats(s => ({ ...s, drops: s.drops + 1 }));
              setNodeMetrics(prev => ({
                ...prev,
                [arrivedNodeId]: {
                  ...prev[arrivedNodeId],
                  drops: (prev[arrivedNodeId]?.drops || 0) + 1
                }
              }));

              const dropCode = pkt.dropHttpCode || 403;
              const reasonText = pkt.dropReason || 'Petición bloqueada por reglas de seguridad perimetral';

              addEvent({
                packetId: pkt.id,
                deviceLabel: nodeLabel,
                protocol: pkt.protocol,
                method: pkt.method,
                path: pkt.path,
                payload: pkt.payload,
                threatId: pkt.threatId,
                dread: pkt.dread,
                action: 'DROP',
                httpCode: dropCode,
                dropReason: reasonText,
                category: pkt.category,
                sourceIp: pkt.currentNode === 'client_app' ? '181.174.102.45' : '198.51.100.77'
              });

              // Mantener visible en el nodo con tiempo calibrado (a 0.25x = ~12 segundos de exhibición)
              const dropDwell = Math.round(75 / Math.max(0.12, simSpeed));
              nextPackets.push({
                ...pkt,
                state: 'dropped',
                progress: 1.0,
                dwellTicks: dropDwell,
                statusText: `⛔ BLOQUEADO EN ${nodeLabel} (HTTP ${dropCode})`
              });
              return;
            }

            // CASO B: BRECHA EN ARQUITECTURA VULNERABLE
            // El paquete tampoco desaparece; se estaciona alertando la brecha
            if (!isProtected && isAttack && pkt.breachEffect && pkt.breachEffect.targetNode === arrivedNodeId) {
              setStats(s => ({ ...s, breaches: s.breaches + 1 }));
              
              setBreachedNodes(prev => ({
                ...prev,
                [arrivedNodeId]: pkt.breachEffect
              }));

              setActiveIncident({
                title: pkt.breachEffect.label,
                description: pkt.breachEffect.subtext,
                nodeLabel,
                assetId: nodeObj?.assetId || 'ACT-012',
                boundaryId: nodeObj?.boundaryId || 'TB-03',
                threatId: pkt.threatId || 'AMZ-021'
              });

              triggerAlert(
                pkt.threatId || 'AMZ-007',
                pkt.dread || 8.4,
                `¡BRECHA ACTIVA! ${pkt.breachEffect.label}`,
                nodeLabel,
                'BREACH'
              );

              const breachCode = pkt.typeKey === 'ATTACK_SERVER_COLLAPSE' ? 503 : 200;
              addEvent({
                packetId: pkt.id,
                deviceLabel: nodeLabel,
                protocol: pkt.protocol,
                method: pkt.method,
                path: pkt.path,
                payload: pkt.payload,
                threatId: pkt.threatId,
                dread: pkt.dread,
                action: 'BREACH',
                httpCode: breachCode,
                dropReason: `VULNERABILIDAD EXPLOTADA: ${pkt.breachEffect.subtext}`,
                category: pkt.category,
                sourceIp: pkt.currentNode === 'client_app' ? '181.174.102.45' : '198.51.100.77'
              });

              const breachDwell = Math.round(85 / Math.max(0.12, simSpeed));
              nextPackets.push({
                ...pkt,
                state: 'breached',
                progress: 1.0,
                dwellTicks: breachDwell,
                statusText: `💥 ${pkt.breachEffect.label}`
              });
              return;
            }

            // CASO C: TRÁFICO VÁLIDO / INSPECCIÓN INTERMEDIA
            addEvent({
              packetId: pkt.id,
              deviceLabel: nodeLabel,
              protocol: pkt.protocol,
              method: pkt.method,
              path: pkt.path,
              payload: pkt.payload,
              threatId: pkt.threatId,
              dread: pkt.dread,
              action: 'FORWARD',
              httpCode: 200,
              category: pkt.category,
              sourceIp: pkt.currentNode === 'client_app' ? '181.174.102.45' : '198.51.100.77'
            });

            // Permanencia de inspección visual en el nodo (a 0.25x = ~8 segundos)
            const dwellDuration = Math.round(45 / Math.max(0.12, simSpeed));

            nextPackets.push({
              ...pkt,
              state: 'inspecting',
              progress: 1.0,
              dwellTicks: dwellDuration,
              statusText: `Inspeccionando políticas en ${nodeLabel}...`
            });
          }
        });

        return nextPackets;
      });

      // Enfriar medidores de carga suavemente
      setNodeMetrics(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(k => {
          if (updated[k].load > 8) {
            updated[k] = { ...updated[k], load: Math.max(8, updated[k].load - 1) };
          }
        });
        return updated;
      });
    }, 50);

    return () => clearInterval(tickInterval);
  }, [isPaused, mode, addEvent, nodes, simSpeed, triggerAlert]);

  // Apply AWS Defense Playbook
  const handleApplyMitigation = () => {
    setMode('protected');
    setBreachedNodes({});
    setActivePackets([]);
    setActiveIncident(null);
    triggerAlert(
      'PLAYBOOK AWS',
      9.0,
      'Aislamiento de seguridad Calico, reglas WAF y KMS CMK aplicados con éxito. Infraestructura restaurada.',
      'AWS CloudWatch Security Hub',
      'DROP'
    );
  };

  // Reset counters & clear breaches
  const handleResetStats = () => {
    setActivePackets([]);
    setEvents([]);
    setSocAlerts([]);
    setBreachedNodes({});
    setActiveIncident(null);
    setStats({ delivered: 0, drops: 0, breaches: 0 });
    setNodeMetrics(() => {
      const init = {};
      TOPOLOGY_NODES.forEach(n => {
        init[n.id] = { processed: 0, drops: 0, load: 8 };
      });
      return init;
    });
  };

  // Step-by-Step execution handler (Avanzar 1 Salto en Modo Demostración)
  const handleStepForward = () => {
    setActivePackets(prevPackets => {
      if (prevPackets.length === 0) return prevPackets;

      return prevPackets.map(pkt => {
        // Si está viajando por el enlace, forzar llegada al nodo destino
        if (pkt.state === 'traveling') {
          return { ...pkt, progress: 0.999 };
        }
        // Si está en pausa de inspección, completar inspección y avanzar al siguiente salto
        if (pkt.state === 'inspecting') {
          const nextHopIdx = pkt.currentHopIdx + 1;
          const hasMoreHops = nextHopIdx < pkt.fullPath.length - 1;
          if (hasMoreHops) {
            return {
              ...pkt,
              state: 'traveling',
              currentHopIdx: nextHopIdx,
              currentNode: pkt.nextNode,
              nextNode: pkt.fullPath[nextHopIdx + 1],
              progress: 0,
              dwellTicks: 0,
              statusText: `Avanzando hacia ${pkt.fullPath[nextHopIdx + 1]}`
            };
          } else {
            return {
              ...pkt,
              state: 'delivered',
              dwellTicks: 30,
              statusText: 'Transacción completada (HTTP 200)'
            };
          }
        }
        // Si está en drop, breach o delivered, finalizar exhibición visual
        if (['dropped', 'breached', 'delivered'].includes(pkt.state)) {
          return { ...pkt, dwellTicks: 1 };
        }
        return pkt;
      });
    });
  };

  return (
    <div
      className={`app-shell h-dvh max-h-dvh min-h-0 w-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden ${
        isCompactLandscape ? 'app-shell-landscape-compact' : ''
      }`}
    >
      
      {/* 1. Header Bar */}
      <Header
        mode={mode}
        onToggleMobile={() => setIsMobileOpen(prev => !prev)}
        onToggleMatrix={() => setIsMatrixOpen(true)}
        onToggleTelemetry={() => setIsTelemetryOpen(prev => !prev)}
        isTelemetryOpen={isTelemetryOpen}
        onOpenInfo={() => setIsInfoOpen(true)}
      />

      {/* 2. Simulation Ribbon */}
      <SimulationRibbon
        mode={mode}
        onToggleMode={(newMode) => {
          setMode(newMode);
          setActivePackets([]);
          if (newMode === 'protected') setBreachedNodes({});
        }}
        isBackgroundTrafficOn={isBackgroundTrafficOn}
        onToggleBackgroundTraffic={() => setIsBackgroundTrafficOn(prev => !prev)}
        onInjectAttack={handleInjectAttack}
        inFlightCount={activePackets.length}
        stats={stats}
        onResetStats={handleResetStats}
        simSpeed={simSpeed}
        onChangeSpeed={setSimSpeed}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(prev => !prev)}
        onStepForward={handleStepForward}
        hasBreaches={Object.keys(breachedNodes).length > 0}
        onClearBreaches={() => setBreachedNodes({})}
      />

      {/* 3. Central Workspace */}
      <div className="flex-1 relative flex flex-col xl:flex-row overflow-hidden min-h-0 min-w-0 w-full 3xl:max-w-[2400px] 3xl:mx-auto">
        
        {/* Left Side: Device Rack */}
        <DeviceToolbox
          nodes={nodes}
          nodeMetrics={nodeMetrics}
          onSelectNode={(node) => setSelectedNode(node)}
          isOpen={isToolboxOpen}
          onToggle={() => setIsToolboxOpen(prev => !prev)}
        />

        {/* Central Area: Draggable Canvas with Active Breach States */}
        <main className="flex-1 relative overflow-hidden flex flex-col min-h-0 min-w-0 h-full">
          <TopologyCanvas
            trustBoundaries={TRUST_BOUNDARIES}
            nodes={nodes}
            links={TOPOLOGY_LINKS}
            activePackets={activePackets}
            nodeMetrics={nodeMetrics}
            breachedNodes={breachedNodes}
            mode={mode}
            onNodeClick={(node) => setSelectedNode(node)}
            onPacketClick={(pkt) => {
              const ev = events.find(e => e.packetId === pkt.id);
              if (ev) setSelectedPduEvent(ev);
            }}
            onNodeMove={handleNodeMove}
          />

          {/* Real-Time SOC Alerts Banner */}
          <SocAlertsBanner
            alerts={socAlerts}
            onDismissAlert={(id) => setSocAlerts(prev => prev.filter(a => a.id !== id))}
          />
        </main>
      </div>

      {/* 4. Live Oscilloscope / Telemetry Chart Widget */}
      <LiveTelemetryChart
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        trafficHistory={trafficHistory}
        mode={mode}
        stats={stats}
        simSpeed={simSpeed}
      />

      {/* 5. Bottom Packet Event Table */}
      <PacketTracerEventList
        events={events}
        onClearEvents={() => setEvents([])}
        onSelectEvent={(ev) => setSelectedPduEvent(ev)}
        selectedEvent={selectedPduEvent}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(prev => !prev)}
        isExpanded={isEventListOpen}
        onToggleExpanded={() => setIsEventListOpen(prev => !prev)}
      />

      {/* 6. SOC P1 Incident Command Modal */}
      <SocIncidentModal
        incident={activeIncident}
        onClose={() => setActiveIncident(null)}
        onApplyMitigation={handleApplyMitigation}
      />

      {/* 7. Other Modals & Mobile View */}
      <PduInspectionModal
        event={selectedPduEvent}
        onClose={() => setSelectedPduEvent(null)}
      />

      <NodeDetailsModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      <RiskMatrixModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
      />

      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Mobile Banking View with Full In-App Injection Deck */}
      <MobileBankMockup
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        onTriggerScenario={(typeKey, origin) => {
          injectPacket(typeKey, origin || 'client_app');
        }}
        mode={mode}
        activePackets={activePackets}
        events={events}
      />

    </div>
  );
}
