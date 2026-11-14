import React, { useState } from 'react';
import { Terminal, CheckCircle2, XCircle, AlertTriangle, Trash2, Eye, Pause, Play, ChevronUp, ChevronDown } from 'lucide-react';

export default function PacketTracerEventList({ 
  events, 
  onClearEvents, 
  onSelectEvent,
  selectedEvent,
  isPaused,
  onTogglePause,
  isExpanded = true,
  onToggleExpanded
}) {
  const [filter, setFilter] = useState('all');

  const filteredEvents = events.filter(ev => {
    if (filter === 'drops') return ev.action === 'DROP';
    if (filter === 'forwards') return ev.action === 'FORWARD';
    if (filter === 'attacks') return ev.category === 'attack';
    return true;
  });

  return (
    <div className={`shrink-0 bg-slate-950 border-t border-slate-800 flex flex-col shadow-2xl font-mono select-none transition-all duration-200 pb-[env(safe-area-inset-bottom)] ${
      isExpanded
        ? 'h-32 max-[430px]:landscape:h-28 2xs:h-36 xs:h-40 sm:h-48 md:h-52 tablet:h-56 xl:h-64 max-h-[40dvh]'
        : 'h-auto'
    }`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleExpanded}
            className="touch-target-sm flex items-center gap-1.5 text-cyan-400 font-bold tracking-wider uppercase text-[10px] sm:text-[11px] min-w-0"
            title={isExpanded ? 'Ocultar registro PDU' : 'Mostrar registro PDU'}
          >
            <Terminal className="w-4 h-4 shrink-0" />
            <span className="truncate">
              <span className="hidden lg:inline">Registro de Telemetría y Paquetes PDU (Eventos L2/L4/L7)</span>
              <span className="lg:hidden">Registro PDU</span>
            </span>
            {isExpanded ? <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" /> : <ChevronUp className="w-4 h-4 shrink-0 text-slate-400" />}
          </button>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold border border-slate-700 whitespace-nowrap shrink-0">
            {filteredEvents.length}
          </span>
        </div>

        {isExpanded && (
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={onTogglePause}
              className={`touch-target-sm flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold transition border ${
                isPaused 
                  ? 'bg-amber-950 text-amber-300 border-amber-700' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={isPaused ? 'Reanudar captura en vivo' : 'Pausar captura'}
            >
              {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
              <span className="hidden sm:inline">{isPaused ? 'Reanudar' : 'Pausar'}</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px] overflow-x-auto scrollbar-thin-x max-w-full">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'drops', label: 'Drops' },
                { id: 'attacks', label: 'Amenazas' },
                { id: 'forwards', label: 'Fwd' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-2 py-1 rounded transition whitespace-nowrap touch-target-sm ${
                    filter === f.id ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={onClearEvents}
              className="touch-target-sm p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition border border-slate-700"
              title="Limpiar buffer de eventos"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full min-w-[640px] text-left border-collapse text-[11px]">
            <thead className="bg-slate-900/90 sticky top-0 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider z-10">
              <tr>
                <th className="py-1.5 px-2 sm:px-3 w-16 sm:w-20">Paquete</th>
                <th className="py-1.5 px-2 sm:px-3 w-24 sm:w-28">Hora</th>
                <th className="py-1.5 px-2 sm:px-3 w-32 sm:w-40">Dispositivo</th>
                <th className="py-1.5 px-2 sm:px-3 w-28 sm:w-44 hidden md:table-cell">Protocolo</th>
                <th className="py-1.5 px-2 sm:px-3 min-w-[140px]">Ruta</th>
                <th className="py-1.5 px-2 sm:px-3 w-28 sm:w-36 text-center">Acción</th>
                <th className="py-1.5 px-2 sm:px-3 w-12 text-center">PDU</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 sm:py-8 text-center text-slate-600 text-xs px-4">
                    Esperando tráfico… Inicia tráfico continuo o inyecta un ataque.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => {
                  const isSelected = selectedEvent?.id === ev.id;
                  const isDrop = ev.action === 'DROP';
                  const isBreach = ev.action === 'BREACH';
                  const isForward = ev.action === 'FORWARD';

                  return (
                    <tr 
                      key={ev.eventId || `${ev.packetId}-${ev.timestamp}`}
                      onClick={() => onSelectEvent(ev)}
                      className={`cursor-pointer transition hover:bg-slate-900/70 ${
                        isSelected ? 'bg-cyan-950/40 border-l-2 border-l-cyan-400' : ''
                      } ${isDrop ? 'bg-rose-950/10' : isBreach ? 'bg-purple-950/15' : ''}`}
                    >
                      <td className="py-1.5 px-2 sm:px-3 font-bold text-slate-300 text-[10px] sm:text-[11px]">
                        {ev.packetId}
                      </td>
                      <td className="py-1.5 px-2 sm:px-3 text-slate-400 text-[9px] sm:text-[10px] whitespace-nowrap">
                        {ev.timestamp}
                      </td>
                      <td className="py-1.5 px-2 sm:px-3 text-cyan-300 font-semibold truncate max-w-[120px] sm:max-w-[160px]">
                        {ev.deviceLabel}
                      </td>
                      <td className="py-1.5 px-2 sm:px-3 text-slate-300 hidden md:table-cell">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ev.category === 'attack' 
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50' 
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                        }`}>
                          {ev.protocol}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 sm:px-3 text-slate-300 truncate max-w-[180px] sm:max-w-[280px]" title={ev.payload}>
                        <span className="font-bold text-slate-200 mr-1">{ev.method}</span>
                        <span className="text-slate-400">{ev.path}</span>
                      </td>
                      <td className="py-1.5 px-2 sm:px-3 text-center">
                        {isDrop && (
                          <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 inline-flex items-center justify-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-400 hidden sm:inline" />
                            <span>DROP</span>
                          </span>
                        )}
                        {isBreach && (
                          <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 inline-flex items-center justify-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-purple-400 hidden sm:inline" />
                            <span>BREACH</span>
                          </span>
                        )}
                        {isForward && (
                          <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 inline-flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 hidden sm:inline" />
                            <span>FWD</span>
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-2 sm:px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(ev);
                          }}
                          className="touch-target-sm p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition"
                          title="Inspeccionar PDU"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}