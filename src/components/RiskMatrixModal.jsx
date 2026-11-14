import React from 'react';
import { X, BarChart3, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { RISK_ANALYSIS_DATA } from '../data/scenariosData';

export default function RiskMatrixModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-800/60 text-purple-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Matriz de Riesgo y Priorización DREAD
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Fundamento documental del Informe Grupo 2 (2026) · Tablas 70 y 71
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Important Academic Note Banner */}
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Aviso de rigor metodológico:</strong> «Proyección del informe; no corresponde a resultados operativos medidos». El riesgo residual representa una modelación de diseño tras implementar los controles propuestos en AWS.
            </p>
          </div>

          {/* Table 1: Critical Threats Prioritization */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Amenazas Críticas Identificadas (Priorización DREAD)</span>
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="p-2.5">Amenaza</th>
                    <th className="p-2.5">Descripción del Informe</th>
                    <th className="p-2.5 text-center">DREAD</th>
                    <th className="p-2.5 text-center">Nivel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  {RISK_ANALYSIS_DATA.dreadInitial.map((row) => (
                    <tr key={row.threat} className="hover:bg-slate-900/50">
                      <td className="p-2.5 font-bold text-rose-400">{row.threat}</td>
                      <td className="p-2.5 text-slate-300 font-sans">{row.desc}</td>
                      <td className="p-2.5 text-center font-bold text-cyan-400">{row.dread.toFixed(1)}</td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.level === 'Crítica' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {row.level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Comparative Risk Matrix (Initial vs Projected Residual) */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Comparativa de Riesgo: Inicial vs Residual Proyectado (30 Amenazas)</span>
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="p-2.5">Nivel Probabilidad × Impacto</th>
                    <th className="p-2.5 text-center">Escenario Inicial</th>
                    <th className="p-2.5 text-center">Escenario Residual Proyectado</th>
                    <th className="p-2.5 text-center">Variación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-rose-400">Crítico</td>
                    <td className="p-2.5 text-center font-bold text-rose-400">{RISK_ANALYSIS_DATA.riskMatrix.critical.initial}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-400">{RISK_ANALYSIS_DATA.riskMatrix.critical.residualProjected}</td>
                    <td className="p-2.5 text-center text-emerald-400 font-bold">-6</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-amber-400">Alto</td>
                    <td className="p-2.5 text-center font-bold text-amber-400">{RISK_ANALYSIS_DATA.riskMatrix.high.initial}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-400">{RISK_ANALYSIS_DATA.riskMatrix.high.residualProjected}</td>
                    <td className="p-2.5 text-center text-emerald-400 font-bold">-12</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-cyan-400">Moderado</td>
                    <td className="p-2.5 text-center font-bold text-cyan-400">{RISK_ANALYSIS_DATA.riskMatrix.moderate.initial}</td>
                    <td className="p-2.5 text-center font-bold text-cyan-400">{RISK_ANALYSIS_DATA.riskMatrix.moderate.residualProjected}</td>
                    <td className="p-2.5 text-center text-cyan-400 font-bold">+7</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-emerald-400">Bajo</td>
                    <td className="p-2.5 text-center font-bold text-emerald-400">{RISK_ANALYSIS_DATA.riskMatrix.low.initial}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-400">{RISK_ANALYSIS_DATA.riskMatrix.low.residualProjected}</td>
                    <td className="p-2.5 text-center text-emerald-400 font-bold">+11</td>
                  </tr>
                  <tr className="bg-slate-900/80 font-bold">
                    <td className="p-2.5 text-slate-200">Total de Amenazas</td>
                    <td className="p-2.5 text-center text-slate-200">{RISK_ANALYSIS_DATA.riskMatrix.total}</td>
                    <td className="p-2.5 text-center text-slate-200">{RISK_ANALYSIS_DATA.riskMatrix.total}</td>
                    <td className="p-2.5 text-center text-slate-400">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Cerrar Matriz
          </button>
        </div>

      </div>
    </div>
  );
}
