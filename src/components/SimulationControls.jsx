import React from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  SlidersHorizontal,
  Flame,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function SimulationControls({
  scenarios,
  selectedScenario,
  onSelectScenario,
  mode,
  onToggleMode,
  isPlaying,
  onPlayPause,
  onNextHop,
  onReset,
  speed,
  onChangeSpeed,
  currentHopIndex,
  totalHops,
  currentNodeId,
  isFinished,
  finalStatus
}) {
  return (
    <div className="bg-slate-900/95 border-b border-slate-800 px-6 py-3 shadow-lg flex flex-col gap-3">
      {/* Top Row: Mode Switcher & Scenario Selector & Main Player Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Mode Switcher Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onToggleMode('vulnerable')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'vulnerable'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Sin Control (Vulnerable)</span>
          </button>
          <button
            onClick={() => onToggleMode('protected')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'protected'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Propuesta AWS (Mitigado)</span>
          </button>
        </div>

        {/* Scenario Dropdown */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <label className="text-xs font-medium text-slate-400 whitespace-nowrap">
            Escenario de Prueba:
          </label>
          <select
            value={selectedScenario.id}
            onChange={(e) => {
              const sc = scenarios.find(s => s.id === e.target.value);
              if (sc) onSelectScenario(sc);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          >
            <optgroup label="⚠️ Amenazas Críticas y Ataques (Informe 2026)">
              {scenarios.filter(s => s.category === 'attack').map(s => (
                <option key={s.id} value={s.id}>
                  [{s.id}] {s.name} — DREAD: {s.dreadRating}
                </option>
              ))}
            </optgroup>
            <optgroup label="✅ Operaciones Legítimas y Flujos Seguros">
              {scenarios.filter(s => s.category === 'legitimate').map(s => (
                <option key={s.id} value={s.id}>
                  [{s.id}] {s.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Packet Tracer Simulation Controls */}
        <div className="flex items-center gap-2">
          {/* Play / Pause */}
          <button
            onClick={onPlayPause}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-md ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/30'
            }`}
            title={isPlaying ? "Pausar animación de paquetes" : "Iniciar flujo de paquetes"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pausar' : 'Simular'}</span>
          </button>

          {/* Next Hop (Paso a Paso) */}
          <button
            onClick={onNextHop}
            disabled={isPlaying || isFinished}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs font-medium border border-slate-700 transition"
            title="Avanzar un solo salto (Paso a paso estilo Packet Tracer)"
          >
            <SkipForward className="w-4 h-4 text-cyan-400" />
            <span>Paso a Paso</span>
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
            title="Reiniciar simulación"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs text-slate-400">
            <span className="text-[10px] text-slate-500 font-mono">Vel:</span>
            {[0.5, 1, 2].map((sp) => (
              <button
                key={sp}
                onClick={() => onChangeSpeed(sp)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${
                  speed === sp ? 'bg-cyan-900 text-cyan-300 font-bold' : 'hover:text-slate-200'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row: Quick Launch Scenario Pills & Step Progress Tracker */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
        
        {/* Quick Launch Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-3xl">
          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap mr-1">
            Accesos Rápidos:
          </span>
          {scenarios.map((s) => {
            const isSelected = selectedScenario.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectScenario(s)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-sm'
                    : s.category === 'attack'
                      ? 'bg-slate-950 text-slate-300 border-slate-800 hover:border-rose-700/50 hover:text-rose-300'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-emerald-700/50 hover:text-emerald-300'
                }`}
              >
                {s.category === 'attack' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />}
                {s.category === 'legitimate' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />}
                {s.id}: {s.code}
              </button>
            );
          })}
        </div>

        {/* Progress & Current Hop Tracker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Salto:</span>
            <span className="font-mono font-bold text-cyan-400">
              {currentHopIndex >= 0 ? currentHopIndex + 1 : 0}
            </span>
            <span>/</span>
            <span className="font-mono text-slate-500">{totalHops}</span>
          </div>

          {/* Progress bar */}
          <div className="w-28 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-300 ${
                mode === 'protected' ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-rose-500'
              }`}
              style={{ width: `${totalHops > 0 && currentHopIndex >= 0 ? ((currentHopIndex + 1) / totalHops) * 100 : 0}%` }}
            />
          </div>

          {/* Outcome Badge if finished */}
          {isFinished && finalStatus && (
            <span 
              className="px-2 py-0.5 rounded text-[11px] font-bold font-mono tracking-wider animate-bounce"
              style={{
                backgroundColor: finalStatus.type === 'blocked' || finalStatus.type === 'delivered' || finalStatus.code === 200
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'rgba(239, 68, 68, 0.2)',
                color: finalStatus.type === 'blocked' || finalStatus.type === 'delivered' || finalStatus.code === 200
                  ? '#34d399'
                  : '#f87171',
                border: `1px solid ${finalStatus.type === 'blocked' || finalStatus.type === 'delivered' || finalStatus.code === 200 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
              }}
            >
              HTTP {finalStatus.code} · {finalStatus.label}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
