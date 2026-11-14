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
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-xl select-none font-mono">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center shadow-lg shadow-cyan-900/30">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-wide">
              {APP_CONFIG.projectName}
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
              {APP_CONFIG.badgeText}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-700/40">
              {APP_CONFIG.badgeSubtext}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Límites de Confianza TB-01 a TB-05 · Simulación de Amenazas y Mitigaciones DREAD
          </p>
        </div>
      </div>

      {/* Mode Banner Indicator */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-semibold"
        style={{
          backgroundColor: mode === 'protected' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderColor: mode === 'protected' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          color: mode === 'protected' ? '#34d399' : '#f87171'
        }}
      >
        <span className={`w-2 h-2 rounded-full ${mode === 'protected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
        <span>
          {mode === 'protected' ? 'PROTEGIDO: Reglas AWS WAF & EKS Activas' : 'VULNERABLE: Arquitectura Base sin Controles'}
        </span>
      </div>

      {/* Action Navigation Buttons */}
      <div className="flex items-center gap-2">
        {/* Live Telemetry Scope Toggle */}
        <button
          onClick={onToggleTelemetry}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
            isTelemetryOpen
              ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-sm'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title="Abrir telemetría de tráfico en vivo (PPS)"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Telemetría SOC</span>
        </button>

        <button
          onClick={onToggleMobile}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          title="Abrir vista de la App Banca Móvil"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>Banca Móvil</span>
        </button>

        <button
          onClick={onToggleMatrix}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          title="Ver Matriz de Riesgo y DREAD"
        >
          <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
          <span>Matriz DREAD</span>
        </button>

        <button
          onClick={onOpenInfo}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
          title="Información y contexto del proyecto"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
