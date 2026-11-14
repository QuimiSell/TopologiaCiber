// Definición de topología de nodos y límites de confianza según informe de Grupo 2 (2026)
export const TRUST_BOUNDARIES = [
  {
    id: 'TB-01',
    name: 'TB-01: Zona Externa (Internet & Dispositivos Móviles)',
    description: 'Clientes legítimos y adversarios no autenticados en redes públicas.',
    x: 20,
    y: 40,
    width: 250,
    height: 540,
    color: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    badge: 'Zona No Confiable'
  },
  {
    id: 'TB-02',
    name: 'TB-02: Perímetro de Red AWS (Edge & Ingress)',
    description: 'Filtrado WAF perimetral, balanceo e inspección de peticiones HTTP.',
    x: 300,
    y: 40,
    width: 260,
    height: 540,
    color: 'rgba(14, 165, 233, 0.08)',
    borderColor: 'rgba(14, 165, 233, 0.4)',
    badge: 'Perímetro AWS'
  },
  {
    id: 'TB-03',
    name: 'TB-03: VPC Privada - Cómputo e Identidad',
    description: 'Microservicios financieros aislados en subredes privadas y proveedor de identidad.',
    x: 590,
    y: 40,
    width: 270,
    height: 540,
    color: 'rgba(249, 115, 22, 0.08)',
    borderColor: 'rgba(249, 115, 22, 0.4)',
    badge: 'Subred Privada VPC'
  },
  {
    id: 'TB-04',
    name: 'TB-04: Subred Aislada de Datos & Criptografía',
    description: 'Persistencia transaccional sin acceso a internet directo y llaves maestras KMS.',
    x: 890,
    y: 40,
    width: 270,
    height: 540,
    color: 'rgba(168, 85, 247, 0.08)',
    borderColor: 'rgba(168, 85, 247, 0.4)',
    badge: 'Capa Transaccional'
  },
  {
    id: 'TB-05',
    name: 'TB-05: Gobierno, Almacenamiento & SIEM',
    description: 'Centralización de auditoría, detección de anomalías y respaldos inmutables.',
    x: 1190,
    y: 40,
    width: 280,
    height: 540,
    color: 'rgba(34, 197, 94, 0.08)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
    badge: 'Monitoreo & SOC'
  }
];

export const TOPOLOGY_NODES = [
  // --- ZONA EXTERNA (TB-01) ---
  {
    id: 'client_app',
    name: 'Banca Móvil (Android/iOS)',
    role: 'Cliente Legítimo',
    assetId: 'ACT-010 / ACT-019',
    boundaryId: 'TB-01',
    category: 'client',
    x: 140,
    y: 160,
    icon: 'Smartphone',
    status: 'idle',
    description: 'App bancaria en teléfono del cliente. Canal de presentación de transacciones y autenticación local.',
    ip: '181.174.102.45 (IP Guatemala)',
    threatsInvolved: ['AMZ-006', 'AMZ-010'],
    vulnerableBehavior: 'Permite modificar identificadores de cuenta y carece de vinculación segura con la operación.',
    protectedBehavior: 'Autenticación mTLS/OAuth2 PKCE, firma de transacciones y confirmación en 2 pasos reforzada.'
  },
  {
    id: 'attacker',
    name: 'Atacante / Adversario',
    role: 'Actor Malicioso',
    assetId: 'AMZ Actor',
    boundaryId: 'TB-01',
    category: 'attacker',
    x: 140,
    y: 420,
    icon: 'Skull',
    status: 'idle',
    description: 'Actor con herramientas automatizadas (Postman, SQLmap, scripts BOLA) intentando explotar vulnerabilidades.',
    ip: '198.51.100.77 (IP Sospechosa)',
    threatsInvolved: ['AMZ-007', 'AMZ-016', 'AMZ-021', 'AMZ-026'],
    vulnerableBehavior: 'Envía peticiones directas manipulando IDs (BOLA), payloads SQL y ráfagas masivas sin restricción.',
    protectedBehavior: 'Detectado y bloqueado en perímetros WAF/Cognito antes de tocar la capa de datos.'
  },

  // --- PERÍMETRO AWS (TB-02) ---
  {
    id: 'waf',
    name: 'AWS WAF',
    role: 'Firewall Web Perimetral',
    assetId: 'ACT-017',
    boundaryId: 'TB-02',
    category: 'security',
    x: 430,
    y: 190,
    icon: 'ShieldCheck',
    status: 'idle',
    description: 'Inspecciona tráfico HTTP/S entrante. Reglas gestionadas contra SQLi, XSS, listas de reputación y rate-limiting.',
    ip: 'aws.waf.ingress.local',
    threatsInvolved: ['AMZ-007', 'AMZ-021'],
    dreadRating: '8.2 (AMZ-007) / 8.0 (AMZ-021)',
    vulnerableBehavior: 'INEXISTENTE: Todo el tráfico malicioso pasa directamente al backend sin inspección de firmas.',
    protectedBehavior: 'Filtra patrones SQLi/XSS, restringe abuso de solicitudes (Rate Limit 429) y alerta a CloudWatch.'
  },
  {
    id: 'apigw',
    name: 'Amazon API Gateway',
    role: 'API Gateway & Reverse Proxy',
    assetId: 'ACT-011',
    boundaryId: 'TB-02',
    category: 'network',
    x: 430,
    y: 390,
    icon: 'Router',
    status: 'idle',
    description: 'Punto de entrada gestionado para microservicios. Valida esquemas JSON, límites de paginación y cuotas de consumo.',
    ip: 'api.bancoguatemalteco.com.gt',
    threatsInvolved: ['AMZ-016', 'AMZ-021'],
    dreadRating: '8.4 (AMZ-016)',
    vulnerableBehavior: 'Permite límites exorbitantes (ej. limit=1000000) provocando agotamiento de memoria y denegación de servicio.',
    protectedBehavior: 'Aplica validación estricta de esquemas, cuotas de throttling y paginación acotada (1-20 registros, error 400).'
  },

  // --- VPC PRIVADA (TB-03) ---
  {
    id: 'cognito',
    name: 'Amazon Cognito',
    role: 'Proveedor de Identidad (IdP)',
    assetId: 'ACT-015',
    boundaryId: 'TB-03',
    category: 'security',
    x: 725,
    y: 170,
    icon: 'KeyRound',
    status: 'idle',
    description: 'Gestor centralizado de identidades, emisión de tokens JWT, autenticación multifactor y bloqueo por intentos fallidos.',
    ip: 'cognito-idp.us-east-1.amazonaws.com',
    threatsInvolved: ['AMZ-001', 'AMZ-022'],
    dreadRating: '7.8 (AMZ-001)',
    vulnerableBehavior: 'Permite ataques de fuerza bruta ilimitados y contraseñas débiles sin bloqueo temporal.',
    protectedBehavior: 'Aplica bloqueo de cuenta al 4to intento fallido (429 Too Many Requests) y verificación estricta de tokens.'
  },
  {
    id: 'eks_microservices',
    name: 'EKS Microservicios Financieros',
    role: 'Lógica Transaccional',
    assetId: 'ACT-012',
    boundaryId: 'TB-03',
    category: 'compute',
    x: 725,
    y: 390,
    icon: 'Cpu',
    status: 'idle',
    description: 'Contenedores en clúster Kubernetes privado. Ejecuta validaciones de autorización a nivel de objeto (BOLA/BFLA).',
    ip: 'core-banking.internal.vpc',
    threatsInvolved: ['AMZ-006', 'AMZ-016', 'AMZ-026', 'AMZ-029'],
    dreadRating: '8.4 (AMZ-016) / 8.0 (AMZ-006)',
    vulnerableBehavior: 'VULNERABLE A BOLA: Si el usuario pide cta-202 de otro cliente, el servicio la entrega porque solo valida que el token sea válido sin verificar titularidad.',
    protectedBehavior: 'AUTORIZACIÓN ESTRICTA: Valida que cuenta.id pertenezca al usuario del token. Si intenta cuenta ajena -> 403 Forbidden.'
  },

  // --- CAPA DE DATOS (TB-04) ---
  {
    id: 'rds_db',
    name: 'Amazon RDS PostgreSQL',
    role: 'Base de Datos Transaccional',
    assetId: 'ACT-013',
    boundaryId: 'TB-04',
    category: 'database',
    x: 1025,
    y: 230,
    icon: 'Database',
    status: 'idle',
    description: 'Instancia relacional en subred aislada sin IP pública. Cuentas, saldos, bitácoras de transferencias en Quetzales (GTQ).',
    ip: 'db-master.internal.vpc:5432',
    threatsInvolved: ['AMZ-007', 'AMZ-013'],
    dreadRating: '8.2 (AMZ-007)',
    vulnerableBehavior: 'Consultas armadas por concatenación vulnerable a SQL Injection (`\' OR 1=1 --`).',
    protectedBehavior: 'Consultas 100% parametrizadas (Prepared Statements), conexión TLS obligatoria y mínimo privilegio de usuario DB.'
  },
  {
    id: 'kms',
    name: 'AWS KMS (Key Management)',
    role: 'Cifrado de Datos en Reposo',
    assetId: 'ACT-006',
    boundaryId: 'TB-04',
    category: 'security',
    x: 1025,
    y: 430,
    icon: 'Lock',
    status: 'idle',
    description: 'Gestor de llaves maestras criptográficas (CMK). Cifra volúmenes EBS de base de datos y respaldos en S3 mediante envelope encryption.',
    ip: 'kms.us-east-1.amazonaws.com',
    threatsInvolved: ['AMZ-006', 'AMZ-019'],
    dreadRating: '8.4 (AMZ-019)',
    vulnerableBehavior: 'Datos planos en disco y respaldos sin cifrar legibles por cualquier usuario con acceso al volumen.',
    protectedBehavior: 'Cifrado AES-256 en reposo con rotación anual automática de llaves y auditoría estricta de descifrado.'
  },

  // --- GOBIERNO & OPERACIONES (TB-05) ---
  {
    id: 's3_backups',
    name: 'Amazon S3 Backups',
    role: 'Almacenamiento de Respaldos',
    assetId: 'ACT-009',
    boundaryId: 'TB-05',
    category: 'storage',
    x: 1330,
    y: 190,
    icon: 'HardDrive',
    status: 'idle',
    description: 'Snapshots automáticos de la base de datos y bitácoras inmutables con retención regulada (SIB).',
    ip: 's3://bancoguatemalteco-secure-backups',
    threatsInvolved: ['AMZ-019'],
    dreadRating: '8.4 (AMZ-019)',
    vulnerableBehavior: 'Bucket con permisos públicos o políticas IAM permisivas; riesgo de fuga masiva de base de datos.',
    protectedBehavior: 'S3 Block Public Access activado, Bucket Policy restrictivo, SSE-KMS y Object Lock inmutable.'
  },
  {
    id: 'cloudwatch_siem',
    name: 'CloudWatch & SIEM SOC',
    role: 'Centro de Monitoreo & Detección',
    assetId: 'ACT-008',
    boundaryId: 'TB-05',
    category: 'monitoring',
    x: 1330,
    y: 390,
    icon: 'Activity',
    status: 'idle',
    description: 'Agregador de logs (CloudWatch Logs, VPC Flow Logs, WAF logs, GuardDuty). Alerta en tiempo real al equipo SOC.',
    ip: 'siem-console.internal.bank',
    threatsInvolved: ['AMZ-008', 'AMZ-021', 'AMZ-022'],
    dreadRating: 'Monitoreo Transversal',
    vulnerableBehavior: 'Bitácoras dispersas o inexistentes. Los ataques ocurren sin que nadie se entere.',
    protectedBehavior: 'Correlación continua de eventos, disparo automático de alarmas ante errores 403/429 repetidos.'
  }
];

export const TOPOLOGY_LINKS = [
  // Zona Externa -> Perímetro
  { id: 'link-client-waf', source: 'client_app', target: 'waf', label: 'HTTPS / TLS 1.3', category: 'app' },
  { id: 'link-attacker-waf', source: 'attacker', target: 'waf', label: 'HTTP Malicioso (AMZ-007)', category: 'attack' },
  
  // Perímetro -> Capa de Acceso
  { id: 'link-waf-apigw', source: 'waf', target: 'apigw', label: 'Tráfico Inspeccionado TB-02', category: 'app' },
  { id: 'link-apigw-cognito', source: 'apigw', target: 'cognito', label: 'Autenticación OIDC PKCE', category: 'auth' },
  { id: 'link-apigw-eks', source: 'apigw', target: 'eks_microservices', label: 'Proxy Ingress gRPC / HTTP', category: 'app' },
  
  // Cómputo e Identidad
  { id: 'link-cognito-eks', source: 'cognito', target: 'eks_microservices', label: 'Validación JWT & Scopes', category: 'auth' },
  
  // Microservicios -> Persistencia y Criptografía
  { id: 'link-eks-rds', source: 'eks_microservices', target: 'rds_db', label: 'SQL Parametrizado (Prepared)', category: 'data' },
  { id: 'link-eks-kms', source: 'eks_microservices', target: 'kms', label: 'Firma OTP & Hash (mTLS)', category: 'crypto' },
  { id: 'link-rds-kms', source: 'rds_db', target: 'kms', label: 'Envelope Encryption AES-256', category: 'crypto' },
  { id: 'link-rds-s3', source: 'rds_db', target: 's3_backups', label: 'Snapshots Transaccionales', category: 'storage' },
  { id: 'link-kms-s3', source: 'kms', target: 's3_backups', label: 'Cifrado Inmutable SSE-KMS', category: 'crypto' },
  
  // Telemetría Centralizada hacia SIEM & SOC (Monitoreo TB-05)
  { id: 'link-waf-siem', source: 'waf', target: 'cloudwatch_siem', label: 'Telemetría WAF & Bloqueos', category: 'siem' },
  { id: 'link-apigw-siem', source: 'apigw', target: 'cloudwatch_siem', label: 'Métricas Throttling & 429', category: 'siem' },
  { id: 'link-eks-siem', source: 'eks_microservices', target: 'cloudwatch_siem', label: 'Audit Pods & Alertas BOLA', category: 'siem' },
  { id: 'link-rds-siem', source: 'rds_db', target: 'cloudwatch_siem', label: 'Auditoría PostgreSQL & DB Logs', category: 'siem' }
];
