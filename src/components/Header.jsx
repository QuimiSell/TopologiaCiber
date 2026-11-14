import React from 'react';
import { Shield, Smartphone, BarChart3, Info, Activity } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

export default function Header({ 
  onToggleMobile, 
  onToggleMatrix, 
  onToggleTelemetry,
  isTelemetryOpen,
  onOpenInfo,
  mode
}) {
  return (
    <header className="shrink-0 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-3 sm:px-5 py-2 sm:py-2.5 flex flex-col gap-2 sm:gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between z-40 shadow-xl select-none font-mono">
      {/* Brand & Title */}
      <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center shadow-lg shadow-cyan-900/30">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-wide truncate max-w-[12rem] xs:max-w-none">
              {APP_CONFIG.projectName}
            </h1>
            <span className="text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50 whitespace-nowrap">
              {APP_CONFIG.badgeText}
            </span>
            <span className="hidden xs:inline text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-700/40 whitespace-nowrap">
              {APP_CONFIG.badgeSubtext}
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-slate-400 mt-0.5 leading-snug">
            Límites de Confianza TB-01 a TB-05 · Simulación de Amenazas y Mitigaciones DREAD
          </p>
        </div>
      </div>

      {/* Mode Banner Indicator */}
      <div
        className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-[10px] sm:text-xs font-semibold w-full sm:w-auto lg:max-w-md"
        style={{
          backgroundColor: mode === 'protected' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderColor: mode === 'protected' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          color: mode === 'protected' ? '#34d399' : '#f87171'
        }}
      >
        <span className={`shrink-0 w-2 h-2 rounded-full ${mode === 'protected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
        <span className="leading-tight">
          <span className="sm:hidden">
            {mode === 'protected' ? 'PROTEGIDO · WAF/EKS' : 'VULNERABLE · Sin controles'}
          </span>
          <span className="hidden sm:inline">
            {mode === 'protected' ? 'PROTEGIDO: Reglas AWS WAF & EKS Activas' : 'VULNERABLE: Arquitectura Base sin Controles'}
          </span>
        </span>
      </div>

      {/* Action Navigation Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end w-full lg:w-auto">
        <button
          onClick={onToggleTelemetry}
          className={`touch-target-sm flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-bold border transition ${
            isTelemetryOpen
              ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-sm'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title="Abrir telemetría de tráfico en vivo (PPS)"
        >
          <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">Telemetría SOC</span>
          <span className="sm:hidden">Tel.</span>
        </button>

        <button
          onClick={onToggleMobile}
          className="touch-target-sm flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          title="Abrir vista de la App Banca Móvil"
        >
          <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="hidden sm:inline">Banca Móvil</span>
        </button>

        <button
          onClick={onToggleMatrix}
          className="touch-target-sm flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          title="Ver Matriz de Riesgo y DREAD"
        >
          <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="hidden sm:inline">Matriz DREAD</span>
        </button>

        <button
          onClick={onOpenInfo}
          className="touch-target-sm p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
          title="Información y contexto del proyecto"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}