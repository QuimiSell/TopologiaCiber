import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Binary, 
  FileCode, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Terminal,
  Lock,
  Copy
} from 'lucide-react';

// Generador de Hex Dump estilo Wireshark
function generateHexDump(text) {
  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    bytes.push(text.charCodeAt(i));
  }

  const lines = [];
  const chunkSize = 16;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    const offset = i.toString(16).padStart(4, '0');
    
    // Hex representation
    const hexPart = chunk.map(b => b.toString(16).padStart(2, '0')).join(' ');
    const paddedHex = hexPart.padEnd(chunkSize * 3 - 1, ' ');

    // ASCII representation (printables only)
    const asciiPart = chunk.map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.').join('');

    lines.push({ offset, hex: paddedHex, ascii: asciiPart });
  }

  return lines;
}

export default function PduInspectionModal({ event, onClose }) {
  const [activeTab, setActiveTab] = useState('wireshark'); // 'wireshark' | 'hexdump' | 'security'
  const [openSections, setOpenSections] = useState({
    frame: true,
    ip: true,
    tcp: true,
    tls: true,
    http: true,
    security: true
  });

  if (!event) return null;

  const toggleSection = (sec) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const isDrop = event.action === 'DROP';
  const isBreach = event.action === 'BREACH';
  const isForward = event.action === 'FORWARD';

  // Construct raw HTTP payload for Hex Dump
  const rawStream = `${event.method || 'GET'} ${event.path || '/'} HTTP/1.1\r\n` +
    `Host: api.bancoguatemalteco.com.gt\r\n` +
    `User-Agent: BancoGuatemalteco-App/2.4 (Android; SecurityEvaluator)\r\n` +
    `X-Forwarded-For: ${event.sourceIp || '181.174.102.45'}\r\n` +
    `Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    (event.payload || '');

  const hexLines = generateHexDump(rawStream);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none font-mono text-xs animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Wireshark Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
            <h3 className="font-bold text-slate-100 text-xs tracking-wider uppercase flex items-center gap-2">
              <span>Disector de Paquetes (Estilo Wireshark)</span>
              <span className="text-cyan-400">[{event.packetId}]</span>
            </h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              event.category === 'attack' 
                ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {event.protocol}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 px-4 py-1.5 bg-slate-950 border-b border-slate-800 text-[11px]">
          <button
            onClick={() => setActiveTab('wireshark')}
            className={`px-3 py-1 rounded font-bold transition flex items-center gap-1.5 ${
              activeTab === 'wireshark' 
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Árbol de Protocolos OSI</span>
          </button>

          <button
            onClick={() => setActiveTab('hexdump')}
            className={`px-3 py-1 rounded font-bold transition flex items-center gap-1.5 ${
              activeTab === 'hexdump' 
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Volcado Hexadecimal (Hex Dump)</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1 rounded font-bold transition flex items-center gap-1.5 ${
              activeTab === 'security' 
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Regla de Seguridad & DREAD</span>
          </button>
        </div>

        {/* Status Callout */}
        <div className={`px-4 py-2 border-b flex items-center justify-between text-[11px] ${
          isDrop 
            ? 'bg-rose-950/40 border-rose-800/60 text-rose-200' 
            : isBreach 
              ? 'bg-purple-950/40 border-purple-800/60 text-purple-200' 
              : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            {isDrop ? <XCircle className="w-4 h-4 text-rose-400" /> : isBreach ? <AlertTriangle className="w-4 h-4 text-purple-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>Decisión en nodo: {event.deviceLabel} ➔ {event.action} ({event.httpCode || 200})</span>
          </div>
          <span className="text-[10px] text-slate-400">
            Timestamp: {event.timestamp} · Longitud: {rawStream.length} bytes
          </span>
        </div>

        {/* Main Dissector Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-[11px]">
          
          {/* TAB 1: WIRESHARK PROTOCOL TREE */}
          {activeTab === 'wireshark' && (
            <div className="space-y-1.5 font-mono">
              
              {/* Layer 1: Frame */}
              <div className="border border-slate-800 rounded bg-slate-950/70 overflow-hidden">
                <button
                  onClick={() => toggleSection('frame')}
                  className="w-full px-3 py-1.5 text-left bg-slate-900/80 hover:bg-slate-800/80 flex items-center gap-2 font-bold text-slate-300"
                >
                  {openSections.frame ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Frame 1: {rawStream.length} bytes on wire ({rawStream.length * 8} bits), captured on interface {event.deviceLabel}</span>
                </button>
                {openSections.frame && (
                  <div className="p-2.5 pl-7 text-[10px] text-slate-400 space-y-0.5 border-t border-slate-800/50">
                    <p>Encapsulation type: Ethernet (1)</p>
                    <p>Arrival Time: {event.timestamp} Guatemala Standard Time</p>
                    <p>Frame Number: 1 · Frame Length: {rawStream.length} bytes</p>
                    <p>Protocols in frame: eth:ethertype:ip:tcp:tls:http</p>
                  </div>
                )}
              </div>

              {/* Layer 2: IP */}
              <div className="border border-slate-800 rounded bg-slate-950/70 overflow-hidden">
                <button
                  onClick={() => toggleSection('ip')}
                  className="w-full px-3 py-1.5 text-left bg-slate-900/80 hover:bg-slate-800/80 flex items-center gap-2 font-bold text-slate-300"
                >
                  {openSections.ip ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Internet Protocol Version 4, Src: {event.sourceIp || '181.174.102.45'}, Dst: 10.0.1.45 (AWS VPC Ingress)</span>
                </button>
                {openSections.ip && (
                  <div className="p-2.5 pl-7 text-[10px] text-slate-400 space-y-0.5 border-t border-slate-800/50">
                    <p>0100 .... = Version: 4</p>
                    <p>.... 0101 = Header Length: 20 bytes (5)</p>
                    <p>Differentiated Services Field: 0x00 (DSCP: CS0, ECN: Not-ECT)</p>
                    <p>Time to Live (TTL): 64 · Protocol: TCP (6)</p>
                    <p>Header Checksum: 0x4a2e [validation disabled]</p>
                    <p className="text-cyan-300 font-bold">Source Address: {event.sourceIp || '181.174.102.45'}</p>
                    <p className="text-cyan-300 font-bold">Destination Address: 10.0.1.45 (api.bancoguatemalteco.com.gt)</p>
                  </div>
                )}
              </div>

              {/* Layer 3: TCP */}
              <div className="border border-slate-800 rounded bg-slate-950/70 overflow-hidden">
                <button
                  onClick={() => toggleSection('tcp')}
                  className="w-full px-3 py-1.5 text-left bg-slate-900/80 hover:bg-slate-800/80 flex items-center gap-2 font-bold text-slate-300"
                >
                  {openSections.tcp ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Transmission Control Protocol, Src Port: 54122, Dst Port: 443 (HTTPS), Seq: 1, Ack: 1</span>
                </button>
                {openSections.tcp && (
                  <div className="p-2.5 pl-7 text-[10px] text-slate-400 space-y-0.5 border-t border-slate-800/50">
                    <p>Source Port: 54122</p>
                    <p>Destination Port: 443 (https)</p>
                    <p>Flags: 0x018 (PSH, ACK)</p>
                    <p>Window: 65535 · Checksum: 0x8b32</p>
                  </div>
                )}
              </div>

              {/* Layer 4: TLS 1.3 */}
              <div className="border border-slate-800 rounded bg-slate-950/70 overflow-hidden">
                <button
                  onClick={() => toggleSection('tls')}
                  className="w-full px-3 py-1.5 text-left bg-slate-900/80 hover:bg-slate-800/80 flex items-center gap-2 font-bold text-slate-300"
                >
                  {openSections.tls ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Transport Layer Security (TLS 1.3), Cipher: TLS_AES_256_GCM_SHA384</span>
                </button>
                {openSections.tls && (
                  <div className="p-2.5 pl-7 text-[10px] text-slate-400 space-y-0.5 border-t border-slate-800/50">
                    <p>TLS Record Layer: Application Data Protocol: http</p>
                    <p>Content Type: Application Data (23) · Version: TLS 1.2 (0x0303)</p>
                    <p>Length: {rawStream.length} bytes</p>
                    <p className="text-emerald-400 font-bold">Encrypted with Key Management: AWS KMS CMK (ACT-006)</p>
                  </div>
                )}
              </div>

              {/* Layer 7: HTTP Application Layer */}
              <div className="border border-slate-800 rounded bg-slate-950/70 overflow-hidden">
                <button
                  onClick={() => toggleSection('http')}
                  className="w-full px-3 py-1.5 text-left bg-slate-900/80 hover:bg-slate-800/80 flex items-center gap-2 font-bold text-slate-300"
                >
                  {openSections.http ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Hypertext Transfer Protocol, {event.method} {event.path}</span>
                </button>
                {openSections.http && (
                  <div className="p-2.5 pl-7 text-[10px] text-slate-300 space-y-1 border-t border-slate-800/50">
                    <p className="text-cyan-300 font-bold">Request Method: {event.method}</p>
                    <p className="text-cyan-300 font-bold">Request URI: {event.path}</p>
                    <p className="text-slate-400">Request Version: HTTP/1.1</p>
                    <p className="text-slate-400">Host: api.bancoguatemalteco.com.gt</p>
                    <p className="text-slate-400">Authorization: Bearer [JWT OAuth2 Token Validated]</p>
                    <div className="pt-1.5 mt-1 border-t border-slate-800">
                      <span className="text-slate-500 uppercase text-[9px] block">Carga Útil JSON / Body:</span>
                      <pre className="p-2 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
                        {event.payload || 'No body in request'}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: HEX DUMP (Raw Wireshark Bytes Pane) */}
          {activeTab === 'hexdump' && (
            <div className="border border-slate-800 rounded bg-slate-950 p-3 font-mono text-[11px] overflow-x-auto">
              <div className="text-slate-500 text-[10px] mb-2 pb-1 border-b border-slate-800 flex justify-between">
                <span>OFFSET | 00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F | ASCII REPRESENTATION</span>
                <span>{rawStream.length} BYTES CAPTURADOS</span>
              </div>
              <div className="space-y-0.5 text-slate-300">
                {hexLines.map((line, idx) => (
                  <div key={idx} className="flex gap-4 hover:bg-slate-900/60 px-1 rounded transition">
                    <span className="text-cyan-400 font-bold select-none">{line.offset}</span>
                    <span className="text-slate-300 tracking-wider">{line.hex}</span>
                    <span className="text-emerald-400 select-none pl-2 border-l border-slate-800 font-bold">{line.ascii}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY EVALUATION & ACADEMIC TRACEABILITY */}
          {activeTab === 'security' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">
                  Regla de Seguridad & Mitigación AWS
                </span>
                <p className="text-slate-200 text-[11px] leading-relaxed">
                  {event.dropReason || 'Flujo verificado sin firmas sospechosas. El paquete cumple con las cuotas de consumo y autorización requeridas.'}
                </p>
              </div>

              {event.threatId && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/60">
                    <span className="text-[10px] text-slate-400 block mb-1">Amenaza del Informe:</span>
                    <span className="text-rose-400 font-bold text-sm">{event.threatId}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">Severidad DREAD Inicial:</span>
                    <span className="text-cyan-300 font-bold text-sm">{event.dread || 8.0} / 10.0 (Crítica)</span>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-400 space-y-1">
                <p><strong>Límite de Confianza Implicado:</strong> TB-01 (Internet) ➔ TB-02 (Perímetro WAF) ➔ TB-03 (EKS VPC)</p>
                <p><strong>Criterio de Aceptación:</strong> Caso reproducido visualmente en línea con las Tablas 28-31 del documento de entrega final.</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            Packet Tracer & Wireshark Native Dissection · Modo 100% Local
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Cerrar Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
