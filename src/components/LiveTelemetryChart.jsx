import React from 'react';
import { Activity, X, ShieldAlert, ShieldCheck, Zap, Radio, RefreshCw } from 'lucide-react';

export default function LiveTelemetryChart({
  isOpen,
  onClose,
  trafficHistory = [],
  mode,
  stats,
  simSpeed
}) {
  if (!isOpen) return null;

  // Chart Dimensions
  const chartWidth = 440;
  const chartHeight = 130;
  const maxPps = Math.max(10, ...trafficHistory.map(d => Math.max(d.legitPps || 0, d.attackPps || 0)));

  // Build SVG polyline points for legit (green) and attack (red)
  const legitPoints = trafficHistory.map((d, i) => {
    const x = (i / Math.max(1, trafficHistory.length - 1)) * chartWidth;
    const y = chartHeight - ((d.legitPps || 0) / maxPps) * (chartHeight - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  const attackPoints = trafficHistory.map((d, i) => {
    const x = (i / Math.max(1, trafficHistory.length - 1)) * chartWidth;
    const y = chartHeight - ((d.attackPps || 0) / maxPps) * (chartHeight - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  const currentLegitPps = trafficHistory.length > 0 ? trafficHistory[trafficHistory.length - 1].legitPps : 0;
  const currentAttackPps = trafficHistory.length > 0 ? trafficHistory[trafficHistory.length - 1].attackPps : 0;

  return (
    <div className="fixed bottom-68 right-6 z-40 w-[480px] bg-slate-950/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl font-mono text-xs select-none animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-slate-200 text-xs tracking-wider uppercase">
            Telemetría de Tráfico en Vivo (Osciloscopio SOC)
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-slate-900/50 border-b border-slate-800 text-center text-[10px]">
        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
          <span className="text-slate-500 block text-[9px]">TRÁFICO VÁLIDO</span>
          <span className="font-bold text-emerald-400 text-xs">{currentLegitPps} pps</span>
        </div>
        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
          <span className="text-slate-500 block text-[9px]">AMENAZAS / SEG</span>
          <span className="font-bold text-rose-400 text-xs">{currentAttackPps} pps</span>
        </div>
        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
          <span className="text-slate-500 block text-[9px]">LATENCIA PROMEDIO</span>
          <span className="font-bold text-cyan-400 text-xs">{(16 / simSpeed).toFixed(0)} ms</span>
        </div>
        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
          <span className="text-slate-500 block text-[9px]">EFECTIVIDAD WAF</span>
          <span className={`font-bold text-xs ${mode === 'protected' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {mode === 'protected' ? '100% (ACTIVO)' : '0% (VULN)'}
          </span>
        </div>
      </div>

      {/* SVG Real-Time Scope Chart */}
      <div className="p-3 bg-slate-950">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
            <span>Tráfico Legítimo</span>
            <span className="w-2.5 h-0.5 bg-rose-500 inline-block ml-2" />
            <span>Ataques Detectados</span>
          </span>
          <span className="text-slate-500">Escala: máx {maxPps} PPS</span>
        </div>

        <div className="relative border border-slate-800/80 rounded bg-slate-900/60 overflow-hidden">
          {/* Oscilloscope Grid Lines */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 pointer-events-none opacity-20">
            {Array.from({ length: 18 }).map((_, idx) => (
              <div key={idx} className="border-r border-b border-cyan-500" />
            ))}
          </div>

          <svg width={chartWidth} height={chartHeight} className="w-full">
            {/* Legit Traffic Line */}
            {legitPoints && (
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                points={legitPoints}
              />
            )}
            {/* Attack Traffic Line */}
            {attackPoints && (
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                points={attackPoints}
                strokeDasharray="4,2"
              />
            )}
          </svg>
        </div>

        {/* Legend / Status Footer */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1 text-slate-400">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Muestreo continuo (1000ms)</span>
          </span>
          <span className="text-slate-500">
            Total Drops: <strong className="text-rose-400">{stats.drops}</strong> · Brechas: <strong className="text-purple-400">{stats.breaches}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
