import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Map, Move } from 'lucide-react';
import { ROUTES, quickPathForSlideIndex, slideIndexFromQuickParam } from '../routes';
import TopologyCanvas from './TopologyCanvas';
import NodeDetailsModal from './NodeDetailsModal';
import PresentationModeNav from './PresentationModeNav';
import { TRUST_BOUNDARIES, TOPOLOGY_NODES, TOPOLOGY_LINKS } from '../data/topologyData';
import { APP_CONFIG } from '../config/appConfig';

const OVERVIEW_SLIDE = {
  id: 'overview',
  title: 'Arquitectura AWS — Vista general',
  subtitle: 'Flujo cliente → perímetro → VPC → datos → SOC',
  description:
    'Topología en AWS con cinco límites de confianza (TB-01 a TB-05): internet, perímetro, cómputo privado, datos cifrados y monitoreo SOC.',
  boundaryId: null
};

const BOUNDARY_SLIDES = TRUST_BOUNDARIES.map((tb) => ({
  id: tb.id,
  title: tb.name.replace(/^TB-\d+:\s*/, ''),
  subtitle: `${tb.id} · ${tb.badge}`,
  description: tb.description,
  boundaryId: tb.id
}));

const SLIDES = [OVERVIEW_SLIDE, ...BOUNDARY_SLIDES];

export default function QuickArchitecturePresentation() {
  const { slideId } = useParams();
  const navigate = useNavigate();
  const slideIndex = slideIndexFromQuickParam(slideId);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState(TOPOLOGY_NODES);

  const slide = SLIDES[slideIndex];
  const focusedBoundaryId = slide.boundaryId;

  const nodesInSlide = useMemo(
    () => nodes.filter((n) => !focusedBoundaryId || n.boundaryId === focusedBoundaryId),
    [focusedBoundaryId, nodes]
  );

  const handleNodeMove = useCallback((nodeId, x, y) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, x, y } : n)));
  }, []);

  const goToSlide = (index) => navigate(quickPathForSlideIndex(index));
  const goPrev = () => goToSlide(Math.max(0, slideIndex - 1));
  const goNext = () => goToSlide(Math.min(SLIDES.length - 1, slideIndex + 1));

  return (
    <div className="h-dvh max-h-dvh min-h-0 w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-3 sm:px-5 py-2.5 flex flex-wrap items-center gap-2 sm:gap-3 z-40">
        <PresentationModeNav />

        <div className="flex items-center gap-2 min-w-0 flex-1 order-3 sm:order-2 w-full sm:w-auto">
          <Map className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate">Presentación rápida</h1>
            <p className="text-[10px] text-slate-500 font-mono truncate">{APP_CONFIG.projectName}</p>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 shrink-0 order-2 sm:order-3 ml-auto">
          {slideIndex + 1} / {SLIDES.length}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0 overflow-hidden">
        <section className="flex-1 relative min-h-[min(55dvh,520px)] lg:min-h-0 flex flex-col min-w-0">
          <TopologyCanvas
            trustBoundaries={TRUST_BOUNDARIES}
            nodes={nodes}
            links={TOPOLOGY_LINKS}
            activePackets={[]}
            breachedNodes={{}}
            mode="protected"
            focusedBoundaryId={focusedBoundaryId}
            onNodeMove={handleNodeMove}
            onNodeClick={(node) => setSelectedNode(node)}
          />
          <p className="absolute bottom-2 left-2 right-2 sm:left-auto sm:right-14 sm:max-w-xs z-20 pointer-events-none flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-950/80 border border-slate-800/80 rounded-md px-2 py-1">
            <Move className="w-3 h-3 shrink-0 text-cyan-600" />
            Arrastrá el fondo o los nodos para ajustar la vista
          </p>
        </section>

        <aside className="shrink-0 lg:w-[min(24rem,38vw)] xl:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/60 flex flex-col min-h-0 max-h-[42dvh] lg:max-h-none">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 min-h-0">
            <p className="text-[10px] font-mono font-bold text-amber-400/90 uppercase tracking-wide mb-1">
              {slide.subtitle}
            </p>
            <h2 className="text-lg font-bold text-white mb-2 leading-snug">{slide.title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">{slide.description}</p>

            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">Componentes en esta zona</p>
              <ul className="space-y-1">
                {(focusedBoundaryId ? nodesInSlide : nodes).map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedNode(n)}
                      className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition border border-transparent hover:border-slate-700"
                    >
                      {n.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="shrink-0 p-4 border-t border-slate-800 flex items-center justify-between gap-2 bg-slate-950/80">
            <button
              type="button"
              onClick={goPrev}
              disabled={slideIndex === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <div className="flex gap-1">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToSlide(i)}
                  className={`w-2 h-2 rounded-full transition ${
                    i === slideIndex ? 'bg-amber-400' : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  aria-label={`Ir a diapositiva ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={goNext}
              disabled={slideIndex === SLIDES.length - 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border border-amber-700/50 text-amber-200 bg-amber-950/30 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-950/50 transition"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </main>

      <NodeDetailsModal node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}