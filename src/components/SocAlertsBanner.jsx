import React from 'react';
import { AlertTriangle, ShieldAlert, X, ShieldCheck, Zap, Flame, Skull } from 'lucide-react';

export default function SocAlertsBanner({ alerts, onDismissAlert }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="absolute top-12 sm:top-14 left-2 right-2 sm:left-auto sm:right-3 z-40 flex flex-col gap-2 sm:max-w-sm pointer-events-none select-none font-mono">
      {alerts.slice(0, 3).map((al) => {
        const isCritical = al.severity === 'CRÍTICA' || al.dread >= 8.0;

        return (
          <div
            key={al.id}
            className={`pointer-events-auto p-3 rounded-lg border shadow-2xl backdrop-blur-md transition-all duration-300 animate-slideLeft ${
              isCritical
                ? 'bg-rose-950/90 border-rose-600 text-rose-100 shadow-rose-950/50'
                : 'bg-amber-950/90 border-amber-600 text-amber-100 shadow-amber-950/50'
            }`}
          >
            {/* Header: Threat ID & DREAD */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <AlertTriangle className={`w-3.5 h-3.5 ${isCritical ? 'text-rose-400' : 'text-amber-400'}`} />
                <span>[ALERTA SOC] {al.threatId}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 font-bold">
                  DREAD: {al.dread || '8.0'}
                </span>
                <button
                  onClick={() => onDismissAlert(al.id)}
                  className="p-0.5 rounded hover:bg-black/30 text-slate-400 hover:text-white transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Message Body */}
            <p className="text-[11px] leading-tight text-slate-200 mb-1.5">
              {al.message}
            </p>

            {/* Footer: Node & Defense applied */}
            <div className="flex items-center justify-between text-[9px] pt-1 border-t border-white/10 text-slate-300">
              <span>Dispositivo: <strong>{al.device}</strong></span>
              <span className={`font-bold ${al.status === 'DROP' ? 'text-emerald-300' : 'text-rose-300'}`}>
                {al.status === 'DROP' ? '✓ MITIGADO (DROP 403)' : '⚠ BRECHA ACTIVA'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
