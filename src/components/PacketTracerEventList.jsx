import React, { useState } from 'react';
import { Terminal, Shield, CheckCircle2, XCircle, AlertTriangle, Trash2, ArrowRight, Eye, Pause, Play } from 'lucide-react';

export default function PacketTracerEventList({ 
  events, 
  onClearEvents, 
  onSelectEvent,
  selectedEvent,
  isPaused,
  onTogglePause
}) {
  const [filter, setFilter] = useState('all');

  const filteredEvents = events.filter(ev => {
    if (filter === 'drops') return ev.action === 'DROP';
    if (filter === 'forwards') return ev.action === 'FORWARD';
    if (filter === 'attacks') return ev.category === 'attack';
    return true;
  });

  return (
    <div className="bg-slate-950 border-t border-slate-800 flex flex-col h-64 shadow-2xl font-mono select-none">
      {/* Event List Ribbon Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold tracking-wider uppercase text-[11px]">
            <Terminal className="w-4 h-4" />
            <span>Registro de Telemetría y Paquetes PDU (Eventos L2/L4/L7)</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold border border-slate-700">
            {filteredEvents.length} eventos capturados
          </span>
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume Capture */}
          <button
            onClick={onTogglePause}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition border ${
              isPaused 
                ? 'bg-amber-950 text-amber-300 border-amber-700' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={isPaused ? "Reanudar captura en vivo" : "Pausar captura"}
          >
            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
            <span>{isPaused ? 'Reanudar Captura' : 'Pausar Captura'}</span>
          </button>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'drops', label: 'Drops (Bloqueos)' },
              { id: 'attacks', label: 'Amenazas' },
              { id: 'forwards', label: 'Forwards' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-2 py-0.5 rounded transition ${
                  filter === f.id ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Clear */}
          <button
            onClick={onClearEvents}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition border border-slate-700"
            title="Limpiar buffer de eventos"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="bg-slate-900/90 sticky top-0 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-1.5 px-3 w-20">Paquete</th>
              <th className="py-1.5 px-3 w-28">Hora</th>
              <th className="py-1.5 px-3 w-40">En Dispositivo</th>
              <th className="py-1.5 px-3 w-44">Protocolo / Tipo</th>
              <th className="py-1.5 px-3">Ruta / Carga Útil</th>
              <th className="py-1.5 px-3 w-36 text-center">Acción de Capa</th>
              <th className="py-1.5 px-3 w-16 text-center">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-600 text-xs">
                  Esperando tráfico de red... Inicia tráfico continuo o inyecta un ataque.
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
                    <td className="py-1.5 px-3 font-bold text-slate-300">
                      {ev.packetId}
                    </td>
                    <td className="py-1.5 px-3 text-slate-400 text-[10px]">
                      {ev.timestamp}
                    </td>
                    <td className="py-1.5 px-3 text-cyan-300 font-semibold truncate max-w-[160px]">
                      {ev.deviceLabel}
                    </td>
                    <td className="py-1.5 px-3 text-slate-300">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        ev.category === 'attack' 
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50' 
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                      }`}>
                        {ev.protocol}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-slate-300 truncate max-w-[340px]" title={ev.payload}>
                      <span className="font-bold text-slate-200 mr-1.5">{ev.method}</span>
                      <span className="text-slate-400">{ev.path}</span>
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      {isDrop && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 flex items-center justify-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-400" />
                          <span>DROP ({ev.httpCode || 403})</span>
                        </span>
                      )}
                      {isBreach && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 flex items-center justify-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-purple-400" />
                          <span>BREACH (200 OK)</span>
                        </span>
                      )}
                      {isForward && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>FORWARD</span>
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(ev);
                        }}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition"
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
    </div>
  );
}
