import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Presentation, ArrowRight, Layers } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import { ROUTES } from '../routes';

export default function WelcomeScreen() {
  return (
    <div className="min-h-dvh w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 py-10 sm:py-14 overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-cyan-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-800/15 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center shadow-lg shadow-cyan-900/40 mb-5">
          <Shield className="w-8 h-8 text-white" />
        </div>

        <p className="text-[11px] font-mono font-semibold tracking-widest text-cyan-400/90 uppercase mb-2">
          {APP_CONFIG.badgeText}
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
          {APP_CONFIG.projectName}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed mb-10 sm:mb-12">
          Simulador de arquitectura cloud y ciberdefensa — {APP_CONFIG.reportReference}
        </p>

        <p className="text-sm font-medium text-slate-300 mb-5 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          Elige el modo de presentación
        </p>

        <div className="w-full grid gap-4 sm:gap-5 sm:grid-cols-2">
          <Link
            to={ROUTES.quick}
            className="group text-left rounded-2xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-900 hover:border-amber-500/40 p-5 sm:p-6 transition-all shadow-xl hover:shadow-amber-900/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-amber-950/50 border border-amber-700/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1.5">Presentación rápida</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Solo arquitectura: recorrido por los límites de confianza TB-01 a TB-05, ideal para una explicación corta.
            </p>
            <span className="inline-block mt-4 text-[10px] font-mono font-semibold px-2 py-1 rounded bg-amber-950/50 text-amber-300 border border-amber-800/40">
              ~5 min · sin simulación
            </span>
          </Link>

          <Link
            to={ROUTES.professional}
            className="group text-left rounded-2xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-900 hover:border-cyan-600/50 p-5 sm:p-6 transition-all shadow-xl hover:shadow-cyan-900/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-950/80 border border-cyan-700/40 flex items-center justify-center">
                <Presentation className="w-5 h-5 text-cyan-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1.5">Presentación profesional</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Simulador completo: topología interactiva, inyección de ataques, telemetría SOC, PDU y modo vulnerable vs protegido.
            </p>
            <span className="inline-block mt-4 text-[10px] font-mono font-semibold px-2 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
              Experiencia al 100 %
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}