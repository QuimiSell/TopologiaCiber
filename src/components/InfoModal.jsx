import React from 'react';
import { X, Shield, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export default function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Contexto y Objetivos del Simulador
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Banco Guatemalteco · Metodología de Simulación Estilo Packet Tracer
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
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-cyan-400 font-mono">
              ¿Por qué un simulador de arquitectura en lugar de una app física?
            </h4>
            <p>
              Desplegar una infraestructura bancaria real en AWS (EKS, RDS multi-AZ, WAF, CloudWatch) y compilar una APK de Android toma semanas y genera costos cloud continuos sin agregar valor explicativo.
            </p>
            <p>
              Inspirado en <strong>Cisco Packet Tracer y GNS3</strong>, este simulador modela la topología exacta de la arquitectura objetivo y reproduce los paquetes HTTP viajando salto a salto entre nodos, permitiendo al evaluador observar cómo reacciona cada capa de seguridad (WAF, API Gateway, Cognito, EKS, RDS, KMS) ante operaciones válidas y ataques dirigidos.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
              Límites de Confianza Representados (STRIDE / DREAD)
            </h4>
            <ul className="space-y-1.5 font-mono text-[11px]">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold shrink-0">TB-01:</span>
                <span><strong>Zona Externa</strong> — Dispositivos clientes Android/iOS y adversarios no autenticados en Internet.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">TB-02:</span>
                <span><strong>Perímetro AWS</strong> — Filtrado perimetral en AWS WAF e ingreso controlado en Amazon API Gateway.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">TB-03:</span>
                <span><strong>VPC Privada</strong> — Proveedor de Identidad (Cognito) y Lógica de Negocio en clúster EKS.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold shrink-0">TB-04:</span>
                <span><strong>Capa de Datos</strong> — Base de datos relacional RDS PostgreSQL y llaves maestras KMS.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">TB-05:</span>
                <span><strong>Gobierno & SOC</strong> — Respaldos inmutables en S3 y correlación de eventos en CloudWatch SIEM.</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
            <strong>Declaración académica:</strong> Banco Guatemalteco es una entidad 100% ficticia. Las respuestas HTTP y eventos de la bitácora son simulaciones didácticas diseñadas para ilustrar los controles propuestos en el informe de 2026.
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
