import React from 'react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  Key, 
  Database, 
  Network, 
  HardDrive, 
  Activity, 
  Lock,
  Layers,
  FileCode2
} from 'lucide-react';

export default function NodeDetailsModal({ node, onClose }) {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{node.name}</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {node.assetId}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Límite de Confianza: {node.boundaryId} · Host: {node.ip}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* General Description */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
              Función en la Arquitectura Bancaria
            </h4>
            <p className="text-slate-200 leading-relaxed text-xs">
              {node.description}
            </p>
          </div>

          {/* Threats & DREAD */}
          {node.threatsInvolved && node.threatsInvolved.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block mb-1">
                  Amenazas Vinculadas (Informe 2026):
                </span>
                <div className="flex flex-wrap gap-1">
                  {node.threatsInvolved.map((th) => (
                    <span key={th} className="px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800/50 text-rose-300 font-mono font-bold text-[11px]">
                      {th}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block mb-1">
                  Calificación DREAD Inicial:
                </span>
                <span className="text-cyan-300 font-mono font-bold text-sm">
                  {node.dreadRating || 'Transversal / Mitigación en Profundidad'}
                </span>
              </div>
            </div>
          )}

          {/* Behavior Comparison */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Comparativa de Diseño: Sin Control vs Con Control AWS
            </h4>

            {/* Vulnerable Behavior */}
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Escenario Base (Vulnerable / Sin Mitigaciones)</span>
              </div>
              <p className="text-rose-200/90 leading-relaxed text-[11px]">
                {node.vulnerableBehavior}
              </p>
            </div>

            {/* Protected Behavior */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Propuesta AWS (Mitigación Defensiva Implementada)</span>
              </div>
              <p className="text-emerald-200/90 leading-relaxed text-[11px]">
                {node.protectedBehavior}
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Cerrar Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
