import React from 'react';
import { 
  AlertOctagon, 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  Flame, 
  Lock, 
  Bug, 
  ServerCrash, 
  Activity, 
  FileWarning,
  Wrench,
  ArrowRight
} from 'lucide-react';

export default function SocIncidentModal({ 
  incident, 
  onClose, 
  onApplyMitigation 
}) {
  if (!incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none font-mono animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-950 border-2 border-rose-600 rounded-xl shadow-2xl shadow-rose-950/80 overflow-hidden flex flex-col text-xs node-danger-ring">
        
        {/* Urgent Incident Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-rose-950 via-rose-900 to-slate-950 border-b border-rose-700/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-rose-600 text-white animate-pulse">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-rose-300 text-xs tracking-wider uppercase">
                  CENTRO DE OPERACIONES SOC — INCIDENTE P1 CRÍTICO
                </span>
                <span className="px-1.5 py-0.2 rounded bg-black/60 text-[10px] text-rose-400 font-bold border border-rose-500">
                  SEV-1
                </span>
              </div>
              <p className="text-[10px] text-rose-200/80 font-bold">
                Ticket: INC-2026-AWS-091 · Detección en Amazon CloudWatch / Security Hub (ACT-008)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-black/40 hover:bg-black/70 text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Incident Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200">
          
          {/* Main Alert Message */}
          <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-700/60 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
              <ServerCrash className="w-4 h-4" />
              <span>{incident.title || 'SERVIDOR TRANSACCIONAL COLAPSADO / TOMADO'}</span>
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              {incident.description}
            </p>
          </div>

          {/* Technical Diagnostics Grid */}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                Componente Afectado
              </span>
              <p className="font-bold text-cyan-300">
                {incident.nodeLabel} ({incident.assetId || 'ACT-012'})
              </p>
              <p className="text-[10px] text-slate-400">
                Límite de Confianza: {incident.boundaryId || 'TB-03 VPC Privada'}
              </p>
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                Amenaza & DREAD Inicial
              </span>
              <p className="font-bold text-rose-400">
                {incident.threatId || 'AMZ-021 / AMZ-019'}
              </p>
              <p className="text-[10px] text-slate-400">
                Severidad: <strong>8.4 a 8.6 (Crítica)</strong>
              </p>
            </div>
          </div>

          {/* Business & Banking Impact */}
          <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-amber-400 font-bold uppercase block flex items-center gap-1.5">
              <FileWarning className="w-3.5 h-3.5" />
              <span>Impacto en la Operación Financiera (Entrega Grupo 2)</span>
            </span>
            <ul className="text-[10px] text-slate-300 list-disc list-inside space-y-0.5">
              <li>Pérdida de disponibilidad en la app de banca móvil (HTTP 503).</li>
              <li>Riesgo regulatorio frente a la Superintendencia de Bancos (SIB).</li>
              <li>Compromiso de integridad de saldos en cuentas transaccionales en Quetzales.</li>
            </ul>
          </div>

          {/* Incident Playbook Recommendation */}
          <div className="p-3 rounded bg-emerald-950/30 border border-emerald-700/50 text-[10px] text-emerald-200 space-y-1">
            <span className="font-bold uppercase text-emerald-400 block flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Playbook de Mitigación Propuesto en el Informe</span>
            </span>
            <p>
              Activar la <strong>Propuesta AWS</strong>: Aislamiento mediante Security Groups y WAF perimetral, rotación de llaves maestras KMS (ACT-006) y validación transaccional reforzada (AC-01) en clúster EKS.
            </p>
          </div>

        </div>

        {/* Incident Footer with Playbook Action */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Cerrar Alerta
          </button>

          <button
            onClick={() => {
              onApplyMitigation();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950"
          >
            <span>Aplicar Mitigación Defensiva AWS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
