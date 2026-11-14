import React from 'react';
import { 
  Server, 
  Smartphone, 
  Skull, 
  ShieldCheck, 
  Router, 
  KeyRound, 
  Cpu, 
  Database, 
  Lock, 
  HardDrive, 
  Activity, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

const ICON_MAP = {
  Smartphone,
  Skull,
  ShieldCheck,
  Router,
  KeyRound,
  Cpu,
  Database,
  Lock,
  HardDrive,
  Activity
};

export default function DeviceToolbox({ 
  nodes, 
  nodeMetrics = {}, 
  onSelectNode,
  isOpen,
  onToggle
}) {
  if (!isOpen) {
    return (
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-cyan-500 text-slate-300 text-xs font-mono shadow-xl transition"
          title="Abrir Rack de Componentes Cloud"
        >
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span>Rack de Componentes</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-slate-950/95 border-r border-slate-800 flex flex-col z-20 select-none font-mono text-xs shadow-2xl backdrop-blur-md">
      {/* Toolbox Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">
            Rack de Componentes Cloud
          </span>
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          title="Minimizar panel"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Device List by Categories */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 text-[10px]">
        {nodes.map((node) => {
          const Icon = ICON_MAP[node.icon] || Server;
          const metric = nodeMetrics[node.id] || { processed: 0, drops: 0, load: 5 };
          const isFiltering = metric.drops > 0;

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(node)}
              className="p-2 rounded-lg bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-400 group-hover:text-cyan-300 transition truncate max-w-[130px]">
                  {node.name}
                </span>
                <span className="text-[9px] text-slate-500 font-bold">
                  {node.assetId}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <div className="p-1 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] text-slate-400 block truncate">{node.role}</span>
                  <div className="flex items-center justify-between text-[8px] text-slate-500 mt-0.5">
                    <span>Carga: <strong className="text-emerald-400">{metric.load}%</strong></span>
                    <span>Drops: <strong className={isFiltering ? 'text-rose-400' : 'text-slate-500'}>{metric.drops}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbox Footer */}
      <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>9 Nodos Activos</span>
        </span>
        <span className="text-slate-400 font-bold">TB-01 a TB-05</span>
      </div>
    </aside>
  );
}
