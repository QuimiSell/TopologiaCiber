// Catálogo de Escenarios de Simulación basados en la Especificación y Fase 4 del informe
export const SCENARIOS = [
  {
    id: 'M05',
    code: 'GW-02',
    name: 'M05: Consulta Legítima de Cuenta Propia (cta-101)',
    category: 'legitimate',
    actor: 'client_app',
    threatId: 'Operación Legítima',
    dreadRating: 'N/A',
    description: 'El Cliente A consulta el saldo y movimientos de su propia cuenta legítima cta-101.',
    request: {
      method: 'GET',
      path: '/api/accounts/cta-101',
      headers: { 'Authorization': 'Bearer jwt-cliente-a-valid', 'X-Forwarded-For': '181.174.102.45' },
      body: null
    },
    // En modo vulnerable: funciona (200 OK)
    vulnerableFlow: [
      { node: 'client_app', action: 'Envía solicitud GET /api/accounts/cta-101', status: 'sent' },
      { node: 'apigw', action: 'Recibe petición sin WAF y enruta al microservicio', status: 'passed' },
      { node: 'eks_microservices', action: 'Consulta datos a base de datos', status: 'passed' },
      { node: 'rds_db', action: 'Retorna registro de cta-101 (Saldo Q 12,500.00)', status: 'success' },
      { node: 'client_app', action: 'Recibe 200 OK con saldo correcto', status: 'delivered' }
    ],
    // En modo protegido: pasa por todas las capas de defensa en profundidad
    protectedFlow: [
      { node: 'client_app', action: 'Envía GET /api/accounts/cta-101 con TLS 1.3 y Token OAuth2 PKCE', status: 'sent' },
      { node: 'waf', action: 'AWS WAF: Inspecciona parámetros. Sin firmas maliciosas. Permitido.', status: 'inspected_ok' },
      { node: 'apigw', action: 'API Gateway: Cuota de consumo válida. Enruta a EKS.', status: 'passed' },
      { node: 'cognito', action: 'Amazon Cognito: Valida firma de token JWT y vigencia de sesión.', status: 'verified' },
      { node: 'eks_microservices', action: 'EKS: Valida Autorización BOLA. El solicitante (Cliente A) es dueño de cta-101.', status: 'authorized' },
      { node: 'rds_db', action: 'RDS: Consulta mediante prepared statement parametrizada.', status: 'success' },
      { node: 'kms', action: 'AWS KMS: Desencripta volumen transaccional con llave CMK autorizada.', status: 'crypto_ok' },
      { node: 'cloudwatch_siem', action: 'CloudWatch: Registra acceso exitoso de auditoría (Status 200 OK).', status: 'logged' },
      { node: 'client_app', action: 'Cliente A recibe saldo verificado: Q 12,500.00 (200 OK)', status: 'delivered' }
    ],
    summaryVulnerable: 'Funciona pero no deja telemetría centralizada ni verificación estricta.',
    summaryProtected: 'Acceso concedido con auditoría completa en CloudWatch y validación BOLA positiva.',
    httpStatusExpected: 200
  },

  {
    id: 'M04',
    code: 'GW-01',
    name: 'M04: Intento BOLA / Acceso a Cuenta Ajena (cta-202)',
    category: 'attack',
    actor: 'attacker',
    threatId: 'AMZ-016 (BOLA / BOPLA)',
    dreadRating: '8.4 (Crítica)',
    owasp: 'API1:2023 - Broken Object Level Authorization',
    description: 'Un usuario autenticado (Cliente A o Atacante) manipula el ID de cuenta para consultar cta-202 (perteneciente a Cliente B).',
    request: {
      method: 'GET',
      path: '/api/accounts/cta-202',
      headers: { 'Authorization': 'Bearer jwt-cliente-a-valid', 'X-Forwarded-For': '198.51.100.77' },
      body: null
    },
    // Modo vulnerable: BOLA exitoso! El sistema no valida la propiedad del objeto
    vulnerableFlow: [
      { node: 'attacker', action: 'Atacante manipula URL a /api/accounts/cta-202 con su propio token válido', status: 'sent' },
      { node: 'apigw', action: 'API Gateway: El token es sintácticamente válido -> Reenvía a EKS', status: 'passed' },
      { node: 'eks_microservices', action: 'FALLA BOLA: EKS solo revisa que haya token, no valida si es el dueño de cta-202', status: 'vulnerability_triggered' },
      { node: 'rds_db', action: 'RDS: Retorna datos sensibles y saldo de Cliente B (Q 8,100.00)', status: 'data_leaked' },
      { node: 'attacker', action: 'BRECHA DE DATOS: Atacante visualiza cuenta ajena con 200 OK!', status: 'breach' }
    ],
    // Modo protegido: EKS detiene la BOLA y emite alerta crítica al SIEM
    protectedFlow: [
      { node: 'attacker', action: 'Atacante envía GET /api/accounts/cta-202 intentando leer cuenta ajena', status: 'sent' },
      { node: 'waf', action: 'AWS WAF: Tráfico HTTP válido sintácticamente. Pasa a Gateway.', status: 'passed' },
      { node: 'apigw', action: 'API Gateway: Token Cognito recibido. Enruta a Microservicio de Cuentas.', status: 'passed' },
      { node: 'cognito', action: 'Cognito: Confirma que la identidad es "cliente.a".', status: 'verified' },
      { node: 'eks_microservices', action: 'DEFENSA BOLA: EKS compara "sub: cliente.a" con titular de "cta-202" (cliente.b). DISCREPANCIA DETECTADA -> BLOQUEADO 403 Forbidden!', status: 'blocked' },
      { node: 'cloudwatch_siem', action: 'SIEM ALERTA: Evento crítico AMZ-016 registrado. Intento de acceso no autorizado desde IP sospechosa.', status: 'alert_critical' },
      { node: 'attacker', action: 'Respuesta simulada: 403 Forbidden ("El objeto no pertenece al cliente")', status: 'rejected' }
    ],
    summaryVulnerable: '¡CRÍTICO! BOLA permite a cualquier cliente autenticado robar saldos de otros usuarios.',
    summaryProtected: 'El control en EKS valida la relación Sujeto-Recurso y deniega con 403 Forbidden.',
    httpStatusExpected: 403
  },

  {
    id: 'M11',
    code: 'GW-SQLi',
    name: 'M11: Intento de Inyección SQL en Cuenta (\' OR \'1\'=\'1)',
    category: 'attack',
    actor: 'attacker',
    threatId: 'AMZ-007 (Inyección SQL / NoSQL)',
    dreadRating: '8.2 (Crítica)',
    owasp: 'API8:2023 / OWASP Top 10 - Injection',
    description: 'Inyección de sintaxis SQL maliciosa en el parámetro de consulta para saltarse la autenticación o volcar la tabla.',
    request: {
      method: 'GET',
      path: "/api/accounts/cta-101' OR '1'='1' --",
      headers: { 'User-Agent': 'sqlmap/1.6.4#stable' },
      body: null
    },
    // Modo vulnerable: SQL Injection llega a PostgreSQL y vuelca datos
    vulnerableFlow: [
      { node: 'attacker', action: 'Envía payload SQL: /api/accounts/cta-101\' OR \'1\'=\'1\' --', status: 'sent' },
      { node: 'apigw', action: 'Sin WAF perimetral: Petición pasa directamente a la aplicación', status: 'passed' },
      { node: 'eks_microservices', action: 'Consulta construida por concatenación de strings: "SELECT * FROM accounts WHERE id = " + id', status: 'vulnerability_triggered' },
      { node: 'rds_db', action: 'RDS ejecuta consulta inyectada y retorna TODA la tabla de clientes bancarios!', status: 'data_leaked' },
      { node: 'attacker', action: 'COMPROMISO TOTAL: Base de datos transaccional expuesta!', status: 'breach' }
    ],
    // Modo protegido: AWS WAF detecta la firma SQLi en TB-02 y corta el paquete inmediatamente
    protectedFlow: [
      { node: 'attacker', action: 'Envía payload SQL: /api/accounts/cta-101\' OR \'1\'=\'1\' --', status: 'sent' },
      { node: 'waf', action: 'AWS WAF REGLA AWSManagedRulesSQLiRuleSet: Coincidencia de firma SQL detectada en URI. BLOQUEO INMEDIATO (403 Forbidden)! Paquete descartado.', status: 'blocked' },
      { node: 'cloudwatch_siem', action: 'WAF emite alerta a CloudWatch Logs: Intento de SQLi bloqueado (AMZ-007) desde 198.51.100.77. IP añadida a lista de bloqueo temporal.', status: 'alert_critical' },
      { node: 'attacker', action: 'El paquete nunca llegó a la VPC ni a la base de datos. Recibe 403 Forbidden.', status: 'rejected' }
    ],
    summaryVulnerable: 'La consulta SQL inyectada ejecuta en PostgreSQL y expone datos de todos los cuentahabientes.',
    summaryProtected: 'AWS WAF filtra la petición en el perímetro TB-02 antes de que ingrese a la red privada.',
    httpStatusExpected: 403
  },

  {
    id: 'M08',
    code: 'AC-01',
    name: 'M08: Transferencia sin Confirmación Reforzada',
    category: 'attack',
    actor: 'client_app',
    threatId: 'AMZ-006 / AMZ-029 (Alteración de Transferencias)',
    dreadRating: '8.0 (Crítica)',
    owasp: 'API6:2023 - Server-Side Request Forgery / Flujos no verificados',
    description: 'Se intenta ejecutar un débito bancario enviando solo credenciales básicas sin el token o paso de confirmación de operación.',
    request: {
      method: 'POST',
      path: '/api/transfers/execute',
      headers: { 'Authorization': 'Bearer jwt-cliente-a-valid' },
      body: { from_account: 'cta-101', to_account: 'cta-999', amount_gtq: 5000.00, confirmation_hash: null }
    },
    vulnerableFlow: [
      { node: 'client_app', action: 'Envía orden de transferencia directa sin segundo factor de confirmación', status: 'sent' },
      { node: 'eks_microservices', action: 'Ejecuta el débito inmediatamente sin validar consentimiento reforzado', status: 'vulnerability_triggered' },
      { node: 'rds_db', action: 'Descuenta Q 5,000.00 del saldo sin trazabilidad de autorización reforzada', status: 'success' }
    ],
    protectedFlow: [
      { node: 'client_app', action: 'Envía POST /api/transfers/execute sin hash de confirmación en dos pasos', status: 'sent' },
      { node: 'waf', action: 'AWS WAF: Pasa inspección perimetral.', status: 'passed' },
      { node: 'apigw', action: 'API Gateway: Enruta hacia el microservicio transaccional.', status: 'passed' },
      { node: 'eks_microservices', action: 'EKS CONTROL AC-01: Operación sensible requiere token de confirmación vinculado al monto y cuenta destino. RECHAZO: 403 Forbidden.', status: 'blocked' },
      { node: 'cloudwatch_siem', action: 'CloudWatch: Registra intento de transferencia no validada (AMZ-006).', status: 'logged' },
      { node: 'client_app', action: 'Recibe 403 Forbidden: "Es necesaria una confirmación vinculada a la operación".', status: 'rejected' }
    ],
    summaryVulnerable: 'Transferencias ejecutadas sin confirmación de intención facilitan malware y ataques CSRF.',
    summaryProtected: 'El control transaccional exige confirmación vinculada criptográficamente a la operación.',
    httpStatusExpected: 403
  },

  {
    id: 'M09',
    code: 'AC-02',
    name: 'M09: Paginación Excesiva / Agotamiento (limit=1000000)',
    category: 'attack',
    actor: 'attacker',
    threatId: 'AMZ-021 (Saturación y Abuso de Recursos API)',
    dreadRating: '8.0 (Crítica)',
    owasp: 'API4:2023 - Unrestricted Resource Consumption',
    description: 'Solicitud con parámetro de paginación gigante para provocar desbordamiento de memoria (OOM) o DoS en el backend.',
    request: {
      method: 'GET',
      path: '/api/transactions/history?limit=1000000',
      headers: { 'Authorization': 'Bearer jwt-cliente-a-valid' },
      body: null
    },
    vulnerableFlow: [
      { node: 'attacker', action: 'Envía GET /api/transactions/history?limit=1000000', status: 'sent' },
      { node: 'apigw', action: 'API Gateway sin validación de esquemas: Pasa al microservicio', status: 'passed' },
      { node: 'eks_microservices', action: 'Intenta serializar 1,000,000 de registros en memoria: Heap OOM Crash!', status: 'vulnerability_triggered' },
      { node: 'attacker', action: 'Microservicio colapsa, denegación de servicio para todos los usuarios', status: 'breach' }
    ],
    protectedFlow: [
      { node: 'attacker', action: 'Envía GET /api/transactions/history?limit=1000000', status: 'sent' },
      { node: 'waf', action: 'AWS WAF: Verifica tamaño y cabeceras.', status: 'passed' },
      { node: 'apigw', action: 'API GATEWAY REQUEST VALIDATOR: El parámetro limit=1000000 excede el esquema permitido (máx 20). RECHAZO INMEDIATO: 400 Bad Request.', status: 'blocked' },
      { node: 'cloudwatch_siem', action: 'CloudWatch Metrics: Incrementa contador 4xx y alerta por consumo anómalo (AMZ-021).', status: 'logged' },
      { node: 'attacker', action: 'Recibe 400 Bad Request: "Paginación acotada a 1-20 elementos". El backend no sufrió carga.', status: 'rejected' }
    ],
    summaryVulnerable: 'El backend intenta cargar millones de filas en memoria, provocando caída del pod.',
    summaryProtected: 'API Gateway rechaza en el borde (400 Bad Request) protegiendo el clúster EKS.',
    httpStatusExpected: 400
  },

  {
    id: 'M10',
    code: 'AC-03',
    name: 'M10: Abuso de Login / Fuerza Bruta (4to intento)',
    category: 'attack',
    actor: 'attacker',
    threatId: 'AMZ-001 / AMZ-022 (Fuerza Bruta de Credenciales)',
    dreadRating: '7.8 (Alta)',
    owasp: 'API2:2023 - Broken Authentication',
    description: 'Envío reiterado de contraseñas erróneas. Al cuarto intento se dispara el bloqueo temporal y rate-limiting.',
    request: {
      method: 'POST',
      path: '/api/auth/login',
      headers: { 'Content-Type': 'application/json' },
      body: { username: 'cliente.a', password: 'BadPassword123!' }
    },
    vulnerableFlow: [
      { node: 'attacker', action: 'Envía 100 intentos por segundo de contraseñas contra el endpoint', status: 'sent' },
      { node: 'eks_microservices', action: 'Valida sin bloqueo temporal; permite seguir probando indefinidamente', status: 'vulnerability_triggered' },
      { node: 'attacker', action: 'Atacante adivina la contraseña por diccionario.', status: 'breach' }
    ],
    protectedFlow: [
      { node: 'attacker', action: 'Envía 4to intento con credenciales incorrectas', status: 'sent' },
      { node: 'waf', action: 'AWS WAF: Detecta ráfaga de POST /api/auth/login. Aplica regla de rate-based.', status: 'rate_limited' },
      { node: 'cognito', action: 'Amazon Cognito: Superado umbral de fallos (3). Bloquea la cuenta temporalmente y responde 429 Too Many Requests.', status: 'blocked' },
      { node: 'cloudwatch_siem', action: 'CloudWatch: Alerta de seguridad emitida por ataque de fuerza bruta detectado.', status: 'alert_critical' },
      { node: 'attacker', action: 'Recibe 429 Too Many Requests / Cuenta bloqueada 15 minutos.', status: 'rejected' }
    ],
    summaryVulnerable: 'Ataque de diccionario sin restricciones que compromete cuentas de clientes.',
    summaryProtected: 'Cognito y WAF limitan intentos y bloquean al 4to fallo con código HTTP 429.',
    httpStatusExpected: 429
  },

  {
    id: 'M12',
    code: 'AMZ-019',
    name: 'M12: Intento de Acceso No Autorizado a Respaldos Cloud',
    category: 'attack',
    actor: 'attacker',
    threatId: 'AMZ-019 (Exposición de Respaldos / S3)',
    dreadRating: '8.4 (Crítica)',
    owasp: 'API8:2023 - Security Misconfiguration',
    description: 'Un atacante intenta descargar snapshots o volúmenes de respaldo directamente desde el bucket de S3 sin autorización.',
    request: {
      method: 'GET',
      path: 's3://bancoguatemalteco-secure-backups/snapshots/db-latest.dump',
      headers: { 'Host': 's3.amazonaws.com' },
      body: null
    },
    vulnerableFlow: [
      { node: 'attacker', action: 'Atacante consulta URL pública del bucket S3 de respaldos', status: 'sent' },
      { node: 's3_backups', action: 'FALLA DE CONFIGURACIÓN: El bucket tiene "AllUsers: READ" habilitado', status: 'vulnerability_triggered' },
      { node: 'attacker', action: 'Descarga respaldo completo de base de datos sin cifrar. FUGA MASIVA!', status: 'breach' }
    ],
    protectedFlow: [
      { node: 'attacker', action: 'Atacante intenta consultar objeto en S3 de respaldos', status: 'sent' },
      { node: 's3_backups', action: 'S3 BLOCK PUBLIC ACCESS: Denegación automática a nivel de cuenta. Bucket Policy restringe solo a rol IAM de RDS.', status: 'blocked' },
      { node: 'kms', action: 'AWS KMS: El objeto además está cifrado con llave CMK gestionada; sin permiso KMS no puede descifrarse.', status: 'crypto_ok' },
      { node: 'cloudwatch_siem', action: 'CloudTrail & GuardDuty: Alerta inmediata "UnauthorizedAccess:S3/PublicAttempt".', status: 'alert_critical' },
      { node: 'attacker', action: 'Recibe 403 Access Denied. Respaldos 100% seguros.', status: 'rejected' }
    ],
    summaryVulnerable: 'Bucket mal configurado provoca filtración completa de saldos y registros bancarios.',
    summaryProtected: 'S3 Block Public Access + Bucket Policy privado + Cifrado KMS impiden cualquier fuga.',
    httpStatusExpected: 403
  },

  {
    id: 'M14',
    code: 'FLOW-OK',
    name: 'M14: Transferencia Completa Autorizada (Q 1,500.00)',
    category: 'legitimate',
    actor: 'client_app',
    threatId: 'Transacción Bancaria Segura',
    dreadRating: 'N/A',
    description: 'El Cliente A transfiere Q 1,500.00 desde cta-101 a cta-202 cumpliendo con la revisión y confirmación en 2 pasos.',
    request: {
      method: 'POST',
      path: '/api/transfers/execute',
      headers: { 'Authorization': 'Bearer jwt-cliente-a-valid' },
      body: { from_account: 'cta-101', to_account: 'cta-202', amount_gtq: 1500.00, confirmation_hash: 'hash-otp-valid-2026' }
    },
    vulnerableFlow: [
      { node: 'client_app', action: 'Envía solicitud de transferencia', status: 'sent' },
      { node: 'eks_microservices', action: 'Aplica débito sin registro criptográfico', status: 'passed' },
      { node: 'rds_db', action: 'Modifica saldos', status: 'success' },
      { node: 'client_app', action: 'Operación terminada sin comprobante firmado', status: 'delivered' }
    ],
    protectedFlow: [
      { node: 'client_app', action: 'Cliente A completa flujo de 2 pasos: Revisa datos y confirma con token firmado', status: 'sent' },
      { node: 'waf', action: 'AWS WAF: Tráfico legítimo verificado.', status: 'passed' },
      { node: 'apigw', action: 'API Gateway: Enruta hacia microservicio transaccional.', status: 'passed' },
      { node: 'cognito', action: 'Cognito: Valida identidad y sesión activa del cliente.', status: 'verified' },
      { node: 'eks_microservices', action: 'EKS: Valida que Cliente A sea dueño de cta-101, saldo suficiente (Q 12,500 >= Q 1,500) y confirmación válida.', status: 'authorized' },
      { node: 'rds_db', action: 'RDS: Aplica transacción ACID (BEGIN -> UPDATE cta-101 (-1500) -> UPDATE cta-202 (+1500) -> COMMIT).', status: 'success' },
      { node: 'kms', action: 'KMS: Firma digitalmente el comprobante de transferencia bancaria.', status: 'crypto_ok' },
      { node: 'cloudwatch_siem', action: 'CloudWatch: Bitácora auditada registrada con request_id único.', status: 'logged' },
      { node: 'client_app', action: 'Cliente A recibe comprobante: Transferencia Exitosa por Q 1,500.00 (200 OK). Nuevo saldo: Q 11,000.00', status: 'delivered' }
    ],
    summaryVulnerable: 'Transferencia sin comprobante firmado ni validaciones transaccionales robustas.',
    summaryProtected: 'Ciclo transaccional completo: WAF -> Cognito -> EKS -> RDS ACID -> KMS -> SIEM.',
    httpStatusExpected: 200
  }
];

// Matriz comparativa DREAD y PxI del informe
export const RISK_ANALYSIS_DATA = {
  dreadInitial: [
    { threat: 'AMZ-019', desc: 'Exposición de datos por instantáneas o respaldos cloud mal configurados', dread: 8.4, level: 'Crítica' },
    { threat: 'AMZ-016', desc: 'API que expone objetos o atributos de otros clientes (BOLA/BOPLA)', dread: 8.4, level: 'Crítica' },
    { threat: 'AMZ-007', desc: 'Inyección SQL/NoSQL en la base transaccional', dread: 8.2, level: 'Crítica' },
    { threat: 'AMZ-006', desc: 'Alteración de monto, cuenta destino o identificadores de transferencia', dread: 8.0, level: 'Crítica' },
    { threat: 'AMZ-021', desc: 'Saturación y denegación de servicio en API Gateway', dread: 8.0, level: 'Crítica' },
    { threat: 'AMZ-001', desc: 'Fuerza bruta y abuso de autenticación de clientes', dread: 7.8, level: 'Alta' },
    { threat: 'AMZ-026', desc: 'Acceso no autorizado a funciones administrativas (BFLA)', dread: 7.6, level: 'Alta' }
  ],
  riskMatrix: {
    critical: { initial: 6, residualProjected: 0 },
    high: { initial: 22, residualProjected: 10 },
    moderate: { initial: 2, residualProjected: 9 },
    low: { initial: 0, residualProjected: 11 },
    total: 30
  }
};
