import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import { ROUTES } from '../routes';

export default function PresentationModeNav({ compact = false, showHome = true }) {
  const { pathname } = useLocation();
  const isHome = pathname === ROUTES.home;
  const isQuick = pathname.startsWith(ROUTES.quick);
  const isPro = pathname.startsWith(ROUTES.professional);

  const base =
    'touch-target-sm px-2.5 sm:px-3 py-2 rounded-lg text-xs font-semibold border transition inline-flex items-center gap-1.5';
  const activeQuick = 'bg-amber-950/50 text-amber-200 border-amber-700/50';
  const activePro = 'bg-cyan-950/60 text-cyan-200 border-cyan-700/50';
  const idle = 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800';
  const activeHome = 'bg-slate-800 text-white border-slate-600';

  return (
    <nav
      className={`flex items-center gap-1 flex-wrap ${compact ? '' : 'shrink-0'}`}
      aria-label="Modo de presentación"
    >
      {showHome && (
        <Link
          to={ROUTES.home}
          className={`${base} ${isHome ? activeHome : idle}`}
          title="Volver al inicio"
        >
          <Home className="w-3.5 h-3.5 shrink-0 opacity-80" />
          Inicio
        </Link>
      )}
      <Link
        to={ROUTES.quick}
        className={`${base} ${isQuick ? activeQuick : idle}`}
      >
        {compact ? 'Rápida' : 'Presentación rápida'}
      </Link>
      <Link
        to={ROUTES.professional}
        className={`${base} ${isPro ? activePro : idle}`}
      >
        {compact ? 'Profesional' : 'Presentación profesional'}
      </Link>
    </nav>
  );
}