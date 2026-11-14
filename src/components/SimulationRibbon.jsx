import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Flame, 
  Skull, 
  Zap, 
  Send, 
  Lock, 
  RotateCcw, 
  Gauge,
  Bug,
  Code2,
  Wrench,
  ServerCrash,
  Play,
  Pause,
  SkipForward
} from 'lucide-react';

export default function SimulationRibbon({
  mode,
  onToggleMode,
  isBackgroundTrafficOn,
  onToggleBackgroundTraffic,
  onInjectAttack,
  inFlightCount,
  stats,
  onResetStats,
  simSpeed,
  onChangeSpeed,
  isPaused,
  onTogglePause,
  onStepForward,
  hasBreaches,
  onClearBreaches
}) {
  const SPEED_PRESETS = [
    { value: 0.05, label: '0.05x', title: 'Cámara Súper Lenta (~1 min/salto - Máximo detalle para jurado)' },
    { value: 0.1, label: '0.1x', title: 'Ultra Lento (~35s/salto)' },
    { value: 0.25, label: '0.25x', title: 'Lento Recomendado (~15s/salto)' },
    { value: 0.5, label: '0.5x', title: 'Moderado (~7s/salto)' },
    { value: 1.0, label: '1x', title: 'Velocidad Normal (~3s/salto)' }
  ];

  return (
    <div className="shrink-0 bg-slate-900/95 border-b border-slate-800 px-2 sm:px-4 py-2 text-xs select-none shadow-md backdrop-blur-md space-y-2">
      <div className="ribbon-scroll items-center gap-2 sm:gap-3">
      
      {/* 1. SECCIÓN: MODO DE ARQUITECTURA */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 shadow-inner shrink-0">
        <button
          onClick={() => onToggleMode('vulnerable')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
            mode === 'vulnerable'
              ? 'bg-rose-700 text-white shadow-md shadow-rose-950 ring-1 ring-rose-500'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Modo vulnerable: Sin WAF ni autorización estricta en EKS"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-300 shrink-0" />
          <span className="whitespace-nowrap"><span className="hidden md:inline">Sin Control (Vulnerable)</span><span className="md:hidden">Vulnerable</span></span>
        </button>

        <button
          onClick={() => onToggleMode('protected')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
            mode === 'protected'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950 ring-1 ring-emerald-500'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Modo mitigado: WAF, Cognito PKCE, EKS AuthGuard y KMS"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span className="whitespace-nowrap"><span className="hidden md:inline">Propuesta AWS (Mitigado)</span><span className="md:hidden">Mitigado</span></span>
        </button>
      </div>

      {/* 2. SECCIÓN: CONTROL DE REPRODUCCIÓN Y PASO A PASO */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
        <button
          onClick={onTogglePause}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-bold transition ${
            isPaused
              ? 'bg-amber-950 text-amber-300 border border-amber-600'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title={isPaused ? "Reanudar simulación en vivo" : "Pausar simulación para explicar al jurado"}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-current text-amber-400" /> : <Pause className="w-3.5 h-3.5 fill-current text-slate-300" />}
          <span>{isPaused ? 'Pausado' : 'En Vivo'}</span>
        </button>

        <button
          onClick={onStepForward}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 transition"
          title="Avanzar 1 Salto (Modo Paso a Paso para presentación docente)"
        >
          <SkipForward className="w-3.5 h-3.5 text-cyan-400" />
          <span>Avanzar Salto</span>
        </button>
      </div>

      {/* 3. SECCIÓN: CONTROL DE VELOCIDAD CALIBRADO CON SLIDER Y PRESETS */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
        <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 font-bold shrink-0">
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Velocidad:</span>
        </div>
        
        {/* Presets */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {SPEED_PRESETS.map((p) => {
            const mobileOnly = [0.25, 0.5, 1.0].includes(p.value);
            const hideOnMobile = !mobileOnly;
            return (
            <button
              key={p.value}
              onClick={() => onChangeSpeed(p.value)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                hideOnMobile ? 'hidden sm:inline-flex' : ''
              } ${
                Math.abs(simSpeed - p.value) < 0.01
                  ? 'bg-cyan-900 text-cyan-300 border border-cyan-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={p.title}
            >
              {p.label}
            </button>
          );
          })}
        </div>

        {/* Continuous Slider */}
        <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
          <input
            type="range"
            min="0.05"
            max="1.5"
            step="0.05"
            value={simSpeed}
            onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
            className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            title={`Velocidad fina: ${simSpeed}x`}
          />
          <span className="text-[10px] text-cyan-300 font-bold font-mono w-8">{simSpeed}x</span>
        </div>
      </div>

      {/* 4. SECCIÓN: TRÁFICO BASE CONTINUO */}
      <div className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
        <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap hidden xs:inline">Tráfico Base:</span>
        <button
          onClick={onToggleBackgroundTraffic}
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition flex items-center gap-1.5 ${
            isBackgroundTrafficOn
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isBackgroundTrafficOn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          <span>{isBackgroundTrafficOn ? 'ACTIVO' : 'PAUSADO'}</span>
        </button>
      </div>

      {/* 5. SECCIÓN: DECK DE DISPARO DE AMENAZAS */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 shrink-0 max-w-[min(100vw,42rem)] scrollbar-thin-x">
        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase mr-1 whitespace-nowrap shrink-0">
          Inyectar:
        </span>

        {/* Transf. Segura */}
        <button
          onClick={() => onInjectAttack('LEGITIMATE_TRANSFER')}
          className="shrink-0 whitespace-nowrap flex items-center gap-1 px-2.5 py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600 font-mono font-bold text-[11px] transition shadow touch-target-sm"
          title="Transacción segura de cliente con token en 2 pasos y firma KMS (Q 1,500)"
        >
          <Send className="w-3.5 h-3.5 text-emerald-400" />
          <span>Transf. Segura</span>
        </button>

        {/* Troyano Bancario */}
        <button
          onClick={() => onInjectAttack('ATTACK_BANKING_TROJAN')}
          className="shrink-0 whitespace-nowrap flex items-center gap-1 px-2 py-1.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 font-mono font-bold text-[11px] transition shadow hover:shadow-rose-950 touch-target-sm"
          title="Troyano Bancario en móvil: Desvía Q 11,500 hacia cuenta mula externa (AMZ-006/010)"
        >
          <Skull className="w-3.5 h-3.5 text-rose-400" />
          <span>Troyano Móvil</span>
        </button>

        {/* SQLi */}
        <button
          onClick={() => onInjectAttack('ATTACK_SQLI')}
          className="shrink-0 whitespace-nowrap flex items-center gap-1 px-2 py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 font-mono font-bold text-[11px] transition touch-target-sm"
          title="Inyección SQL perimetral (' OR 1=1 --) (AMZ-007)"
        >
          <Flame className="w-3 h-3 text-rose-400" />
          <span>SQLi</span>
        </button>

        {/* BOLA */}
        <button
          onClick={() => onInjectAttack('ATTACK_BOLA')}
          className="shrink-0 whitespace-nowrap flex items-center gap-1 px-2 py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 font-mono font-bold text-[11px] transition touch-target-sm"
          title="BOLA: Acceso a objeto de cuenta ajena cta-202 (AMZ-016)"
        >
          <Skull className="w-3 h-3 text-rose-400" />
          <span>BOLA</span>
        </button>

        {/* XSS */}
        <button
          onClick={() => onInjectAttack('ATTACK_XSS')}
          className="shrink-0 whitespace-nowrap flex items-center gap-1 px-2 py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 font-mono font-bold text-[11px] transition touch-target-sm"
          title="Inyección XSS en parámetro de transferencia (AMZ-005/010)"
        >
          <Code2 className="w-3 h-3 text-rose-400" />
          <span>XSS</span>
        </button>

        {/* Ransomware */}
        <button
          onClick={() => onInjectAttack('ATTACK_RANSOMWARE')}
          className="shrink-0 whitespace-nowrap flex items-center gap-1 px-2 py-1.5 rounded bg-rose-950/90 hover:bg-rose-900 text-rose-300 border border-rose-800 font-mono font-bold text-[11px] transition touch-target-sm"
          title="Ransomware: Cifrado forzado y secuestro de base de datos PostgreSQL (AMZ-019/013)"
        >
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span>Ransomware DB</span>
        </button>

        {/* Worm */}
        <button
          onClick={() => onInjectAttack('ATTACK_WORM_LATERAL')}
          className="shrink-0 whitespace-nowrap flex items-center gap-1 px-2 py-1.5 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 font-mono font-bold text-[11px] transition touch-target-sm"
          title="Worm: Movimiento lateral entre pods de microservicios EKS (AMZ-012/014)"
        >
          <Bug className="w-3.5 h-3.5 text-purple-400" />
          <span>Worm EKS</span>
        </button>

        {/* Colapso DoS */}
        <button
          onClick={() => onInjectAttack('ATTACK_SERVER_COLLAPSE')}
          className="shrink-0 whitespace-nowrap flex items-center gap-1 px-2 py-1.5 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700 font-mono font-bold text-[11px] transition shadow touch-target-sm"
          title="Colapso de Servidor: Inundación masiva de memoria (HTTP 503) (AMZ-021)"
        >
          <ServerCrash className="w-3.5 h-3.5 text-amber-400" />
          <span>Colapso DoS (503)</span>
        </button>

        {/* Botón de Reparación */}
        {hasBreaches && (
          <button
            onClick={onClearBreaches}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-500 font-mono font-bold text-[11px] transition animate-bounce"
            title="Restaurar y reparar componentes comprometidos"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Reparar Servidores</span>
          </button>
        )}
      </div>

      {/* 6. SECCIÓN: CONTADORES GLOBALES */}
      <div className="flex items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-[11px] shrink-0 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800/80">
        <div className="flex items-center gap-1 text-slate-400 whitespace-nowrap" title="Paquetes en tránsito">
          <span className="hidden sm:inline">En Vuelo:</span>
          <span className="sm:hidden">Vuelo</span>
          <span className="font-bold text-cyan-400">{inFlightCount}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 whitespace-nowrap" title="Paquetes bloqueados">
          <span>Drops</span>
          <span className="font-bold text-rose-400">{stats.drops}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 whitespace-nowrap" title="Brechas activas">
          <span className="hidden sm:inline">Brechas:</span>
          <span className="sm:hidden">Br.</span>
          <span className={`font-bold ${stats.breaches > 0 ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`}>
            {stats.breaches}
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 whitespace-nowrap" title="Éxitos">
          <span className="hidden sm:inline">Éxitos:</span>
          <span className="sm:hidden">OK</span>
          <span className="font-bold text-emerald-400">{stats.delivered}</span>
        </div>

        <button
          onClick={onResetStats}
          className="touch-target-sm p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          title="Reiniciar contadores"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      </div>
    </div>
  );
}
