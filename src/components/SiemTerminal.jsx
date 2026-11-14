import React, { useState } from 'react';
import { Terminal, ShieldAlert, CheckCircle, Trash2, ChevronDown, ChevronUp, Copy, Shield } from 'lucide-react';

export default function SiemTerminal({ logs, onClearLogs, isOpen, onToggle }) {
  const [filter, setFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    if (filter === 'critical') return log.level === 'CRITICAL' || log.level === 'ALERT';
    if (filter === 'blocked') return log.status >= 400;
    if (filter === 'success') return log.status === 200;
    return true;
  });

  if (!isOpen) {
    return (
      <div className="fixed bottom-3 right-6 z-30">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-200 text-xs font-mono shadow-2xl transition group"
        >
          <Terminal className="w-4 h-4 text-emerald-400 group-hover:text-cyan-300" />
          <span>SIEM Console</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-cyan-400 font-bold border border-slate-700">
            {logs.length}
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 shadow-2xl backdrop-blur-md transition-all duration-300">
      {/* Console Header Bar */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>AWS CloudWatch Logs & SIEM Security Hub (ACT-008)</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {filteredLogs.length} eventos registrados
          </span>
        </div>

        {/* Filter Tabs & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {['all', 'critical', 'blocked', 'success'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 rounded text-[11px] capitalize transition ${
                  filter === f ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'critical' ? 'Críticos' : f === 'blocked' ? 'Bloqueos' : 'Éxitos'}
              </button>
            ))}
          </div>

          <button
            onClick={onClearLogs}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition"
            title="Limpiar consola"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggle}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Minimizar consola"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Console Log Body */}
      <div className="h-48 overflow-y-auto p-4 font-mono text-xs space-y-1.5 bg-slate-950/90 selection:bg-cyan-900">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-1">
            <Shield className="w-6 h-6 opacity-40" />
            <p className="text-xs">No hay eventos en la bitácora aún. Inicia un escenario de prueba para generar telemetría.</p>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            let levelColor = 'text-cyan-400 bg-cyan-950/60 border-cyan-800/50';
            if (log.level === 'CRITICAL' || log.level === 'ALERT') {
              levelColor = 'text-rose-400 bg-rose-950/60 border-rose-800/50';
            } else if (log.level === 'WARN') {
              levelColor = 'text-amber-400 bg-amber-950/60 border-amber-800/50';
            } else if (log.level === 'SUCCESS') {
              levelColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50';
            }

            return (
              <div 
                key={index} 
                className="flex items-start gap-2.5 p-1 rounded hover:bg-slate-900/60 transition group font-mono text-[11px]"
              >
                <span className="text-slate-500 whitespace-nowrap">
                  [{log.timestamp}]
                </span>
                <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold ${levelColor}`}>
                  {log.level}
                </span>
                <span className="text-slate-400 font-bold">
                  [{log.service}]
                </span>
                {log.threat && (
                  <span className="text-amber-400 font-semibold">
                    {log.threat}
                  </span>
                )}
                {log.status && (
                  <span className={`font-bold ${log.status >= 400 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    HTTP {log.status}
                  </span>
                )}
                <span className="text-slate-300 flex-1">
                  {log.message}
                </span>
                {log.ip && (
                  <span className="text-slate-600 text-[10px] whitespace-nowrap">
                    src: {log.ip}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
