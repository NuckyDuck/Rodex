export const LOYALTY_DATA_KEY = 'rodex:demo:loyalty'
export const SETTINGS_DATA_KEY = 'rodex:demo:settings'
export const USERS_DATA_KEY = 'rodex:demo:users'
export const AUDIT_DATA_KEY = 'rodex:demo:audit'

export type LoyaltyTier = {
  id: string
  name: string
  description: string
  minimumPoints: number
  benefits: string
  active: boolean
}

export type LoyaltyReward = {
  id: string
  name: string
  description: string
  points: number
  available: number
  conditions: string
  active: boolean
}

export type LoyaltySettings = {
  pointsPerThousand: number
  oilChangePoints: number
  servicePoints: number
  referralPoints: number
  oilReferralThreshold: number
  chainKitReferralThreshold: number
  tiers: LoyaltyTier[]
  rewards: LoyaltyReward[]
}

export type RodexRole = {
  id: string
  name: string
  permissions: string[]
  system: boolean
}

export type RodexSettings = {
  general: {
    businessName: string
    logoUrl: string
    taxId: string
    phone: string
    email: string
    address: string
    city: string
    country: string
    currency: string
    timezone: string
  }
  business: {
    openingHours: string
    serviceMinutes: number
    warrantyDays: number
    policies: string
    terms: string
  }
  workOrders: {
    prefix: string
    nextNumber: number
    statuses: string
    priorities: string
    serviceTypes: string
    requiredFields: string
    closeRule: string
    estimatedMinutes: number
  }
  rodexId: {
    prefix: string
    format: string
    length: number
    publicFields: string[]
    privateFields: string[]
    qrContent: string
    stickerDesign: string
  }
  inventory: {
    categories: string
    units: string
    minimumStock: number
    maximumStock: number
    lowStockAlerts: boolean
    reserveForWorkOrder: boolean
    consumeOnClose: boolean
  }
  loyalty: LoyaltySettings
  notifications: {
    internal: boolean
    email: boolean
    whatsapp: boolean
    events: Record<string, boolean>
  }
  payments: {
    methods: string[]
  }
  documents: {
    workOrderFormat: string
    receiptFormat: string
    contractFormat: string
    header: string
    footer: string
    terms: string
  }
  security: {
    sessionHours: number
    maxLoginAttempts: number
    autoLockMinutes: number
    auditEnabled: boolean
    roles: RodexRole[]
  }
  system: {
    mode: 'Demo' | 'Producción'
    apiUrl: string
    connection: string
    synchronization: string
    version: string
  }
}

export type LoyaltyMember = {
  customer: string
  points: number
  earnedPoints: number
  redeemedPoints: number
  visitCount: number
  lastVisit: string
  motorcycleIds: string[]
  active: boolean
}

export type PointMovement = {
  id: string
  date: string
  customer: string
  concept: string
  orderId: string
  amount: number
  type: 'Ganado' | 'Redimido' | 'Ajuste' | 'Cancelado'
}

export type Referral = {
  id: string
  referrer: string
  referred: string
  date: string
  orderId?: string
  canceled?: boolean
}

export type RewardClaim = {
  id: string
  customer: string
  rewardId: string
  date: string
  orderId: string
  status: 'Recompensa disponible' | 'Recompensa utilizada'
}

export type LoyaltyDemoState = {
  members: LoyaltyMember[]
  ledger: PointMovement[]
  referrals: Referral[]
  claims: RewardClaim[]
}

export type RodexUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatarUrl: string
  roleId: string
  status: 'Activo' | 'Inactivo'
  lastAccess: string
  createdAt: string
  assignedOrderIds: string[]
  servicesCompleted: number
}

export type AuditEvent = {
  id: string
  actorId: string
  actor: string
  targetUserId?: string
  date: string
  module: string
  entity: string
  action: string
  previousValue?: string
  newValue?: string
}

export const permissionGroups = [
  {
    name: 'Clientes',
    permissions: [
      { id: 'customers.view', label: 'Ver clientes' },
      { id: 'customers.create', label: 'Crear clientes' },
      { id: 'customers.edit', label: 'Editar clientes' },
    ],
  },
  {
    name: 'Motocicletas y RODEX ID',
    permissions: [
      { id: 'motorcycles.view', label: 'Ver motocicletas' },
      { id: 'motorcycles.edit', label: 'Editar motocicletas' },
      { id: 'rodex_id.manage', label: 'Gestionar RODEX ID' },
    ],
  },
  {
    name: 'Órdenes y taller',
    permissions: [
      { id: 'work_orders.view', label: 'Ver órdenes' },
      { id: 'work_orders.create', label: 'Crear órdenes' },
      { id: 'work_orders.edit', label: 'Editar órdenes' },
      { id: 'work_orders.close', label: 'Cerrar órdenes' },
      { id: 'work_orders.diagnose', label: 'Registrar diagnóstico' },
      { id: 'work_orders.evidence', label: 'Agregar evidencias' },
      { id: 'work_orders.maintenance', label: 'Registrar mantenimiento' },
      { id: 'work_orders.products', label: 'Registrar productos utilizados' },
      { id: 'agenda.view', label: 'Ver agenda' },
    ],
  },
  {
    name: 'Inventario y compras',
    permissions: [
      { id: 'inventory.view', label: 'Ver inventario' },
      { id: 'inventory.edit', label: 'Editar inventario' },
      { id: 'products.edit', label: 'Gestionar productos' },
      { id: 'purchases.view', label: 'Ver compras' },
      { id: 'suppliers.view', label: 'Ver proveedores' },
      { id: 'inventory.movements', label: 'Ver movimientos' },
    ],
  },
  {
    name: 'Gestión y administración',
    permissions: [
      { id: 'reports.view', label: 'Ver reportes' },
      { id: 'finance.view', label: 'Ver finanzas' },
      { id: 'users.manage', label: 'Gestionar usuarios' },
      { id: 'settings.manage', label: 'Gestionar configuración' },
      { id: 'loyalty.manage', label: 'Gestionar fidelización' },
    ],
  },
] as const

export const allPermissionIds = permissionGroups.flatMap((group) => group.permissions.map((permission) => permission.id))

const permissionSet = (...permissions: string[]) => permissions

export const initialRoles: RodexRole[] = [
  { id: 'ADMIN', name: 'ADMIN', permissions: [...allPermissionIds], system: true },
  { id: 'GERENCIA', name: 'GERENCIA', permissions: permissionSet('reports.view', 'finance.view', 'customers.view', 'customers.edit', 'work_orders.view', 'work_orders.edit', 'work_orders.close', 'inventory.view', 'inventory.edit', 'users.manage', 'loyalty.manage'), system: true },
  { id: 'RECEPCION', name: 'RECEPCIÓN', permissions: permissionSet('customers.view', 'customers.create', 'customers.edit', 'motorcycles.view', 'motorcycles.edit', 'rodex_id.manage', 'work_orders.view', 'work_orders.create', 'work_orders.edit', 'agenda.view', 'finance.view'), system: true },
  { id: 'TECNICO', name: 'TÉCNICO', permissions: permissionSet('motorcycles.view', 'work_orders.view', 'work_orders.diagnose', 'work_orders.evidence', 'work_orders.maintenance', 'work_orders.products'), system: true },
  { id: 'INVENTARIO', name: 'INVENTARIO', permissions: permissionSet('inventory.view', 'inventory.edit', 'products.edit', 'purchases.view', 'suppliers.view', 'inventory.movements'), system: true },
]

export const initialRodexSettings: RodexSettings = {
  general: {
    businessName: 'RODEX Motorcycles',
    logoUrl: '',
    taxId: '901.438.210-7',
    phone: '+57 300 123 4567',
    email: 'hola@rodex.co',
    address: 'Av. 6 Norte #24N-18',
    city: 'Cali',
    country: 'Colombia',
    currency: 'COP',
    timezone: 'America/Bogota',
  },
  business: {
    openingHours: 'Lun–Vie 8:00–18:00 · Sáb 9:00–14:00',
    serviceMinutes: 90,
    warrantyDays: 30,
    policies: 'Todo servicio se confirma con aprobación del cliente antes de realizar trabajos adicionales.',
    terms: 'Los repuestos instalados y servicios realizados quedan registrados en el historial RODEX ID.',
  },
  workOrders: {
    prefix: 'OT-',
    nextNumber: 246,
    statuses: 'Borrador, En taller, En diagnóstico, Esperando aprobación, Esperando repuesto, En proceso, En revisión, Lista para entrega, Entregada, Cancelada',
    priorities: 'Normal, Alta, Urgente',
    serviceTypes: 'Mantenimiento preventivo, Diagnóstico, Motor, Frenos, Transmisión, Eléctrico',
    requiredFields: 'Cliente, motocicleta, RODEX ID, motivo de ingreso, kilometraje',
    closeRule: 'Aprobación del cliente, diagnóstico, evidencias y productos utilizados registrados.',
    estimatedMinutes: 90,
  },
  rodexId: {
    prefix: 'RX-',
    format: 'RX-{000000}',
    length: 6,
    publicFields: ['Marca y modelo', 'Año', 'Placa', 'Kilometraje', 'Historial de servicios'],
    privateFields: ['Teléfono', 'Correo', 'VIN', 'Número de motor', 'Notas internas'],
    qrContent: 'https://rodex.co/r/{RODEX_ID}',
    stickerDesign: 'RODEX negro y rojo · QR de alto contraste',
  },
  inventory: {
    categories: 'Aceites, Filtros, Frenos, Transmisión, Eléctrico',
    units: 'Unidad, Litro, Kit, Par',
    minimumStock: 5,
    maximumStock: 50,
    lowStockAlerts: true,
    reserveForWorkOrder: true,
    consumeOnClose: true,
  },
  loyalty: {
    pointsPerThousand: 1,
    oilChangePoints: 40,
    servicePoints: 70,
    referralPoints: 100,
    oilReferralThreshold: 5,
    chainKitReferralThreshold: 15,
    tiers: [
      { id: 'bronce', name: 'Bronce', description: 'Tu primera ruta con RODEX.', minimumPoints: 0, benefits: 'Acumula puntos y recibe una inspección visual de cortesía.', active: true },
      { id: 'silver', name: 'Silver', description: 'Beneficios para quienes mantienen su moto al día.', minimumPoints: 600, benefits: '5% en mano de obra y prioridad en agenda.', active: true },
      { id: 'gold', name: 'Gold', description: 'Para clientes frecuentes del taller.', minimumPoints: 1200, benefits: '10% en mano de obra y revisión pre-viaje.', active: true },
      { id: 'rodex-black', name: 'RODEX Black', description: 'La experiencia más completa de RODEX.', minimumPoints: 3000, benefits: 'Prioridad de atención y asistencia de mantenimiento.', active: true },
    ],
    rewards: [
      { id: 'oil-change', name: 'Cambio de aceite gratis', description: 'Servicio de cambio de aceite para una motocicleta registrada.', points: 1200, available: 12, conditions: 'No incluye el valor del lubricante premium.', active: true },
      { id: 'chain-lube', name: 'Lubricación de cadena', description: 'Limpieza, tensión y lubricación de cadena.', points: 400, available: 20, conditions: 'Válido para una motocicleta con RODEX ID.', active: true },
      { id: 'inspection', name: 'Inspección general', description: 'Revisión visual de seguridad y puntos de mantenimiento.', points: 650, available: 8, conditions: 'Requiere agendar con el taller.', active: true },
      { id: 'chain-kit', name: 'Kit de mantenimiento de cadena', description: 'Kit básico para cuidado de transmisión.', points: 2200, available: 4, conditions: 'Sujeto a existencias de inventario.', active: true },
      { id: 'discount', name: 'Descuento de servicio', description: 'Descuento sobre mano de obra en una orden.', points: 1000, available: 10, conditions: 'No acumulable con otras promociones.', active: true },
      { id: 'special-service', name: 'Servicio especial RODEX', description: 'Beneficio de servicio seleccionado por el taller.', points: 1500, available: 3, conditions: 'Consulta disponibilidad antes de redimir.', active: true },
    ],
  },
  notifications: {
    internal: true,
    email: true,
    whatsapp: false,
    events: {
      'OT esperando aprobación': true,
      'OT terminada': true,
      'Moto lista para entrega': true,
      'Bajo inventario': true,
      'Mantenimiento próximo': true,
      'Recompensa disponible': true,
      'Puntos obtenidos': true,
      'Referido validado': true,
    },
  },
  payments: { methods: ['Efectivo', 'Transferencia', 'Nequi', 'Daviplata', 'Tarjeta'] },
  documents: {
    workOrderFormat: 'OT-{000000}',
    receiptFormat: 'REC-{000000}',
    contractFormat: 'CTR-{000000}',
    header: 'RODEX Motorcycles · Cali, Colombia',
    footer: 'Gracias por confiar el cuidado de tu motocicleta a RODEX.',
    terms: 'Los servicios y productos de esta orden se reflejan en el historial técnico del RODEX ID asociado.',
  },
  security: {
    sessionHours: 8,
    maxLoginAttempts: 5,
    autoLockMinutes: 30,
    auditEnabled: true,
    roles: initialRoles,
  },
  system: {
    mode: 'Demo',
    apiUrl: 'No configurada',
    connection: 'Modo demo local',
    synchronization: 'Sin sincronización externa',
    version: 'RODEX Demo · 1.0',
  },
}

export const initialLoyaltyState: LoyaltyDemoState = {
  members: [
    { customer: 'Laura Mendoza', points: 1240, earnedPoints: 3580, redeemedPoints: 2340, visitCount: 8, lastVisit: '2026-10-04', motorcycleIds: ['RX-004821'], active: true },
    { customer: 'Daniel Rojas', points: 860, earnedPoints: 2460, redeemedPoints: 1600, visitCount: 5, lastVisit: '2026-09-30', motorcycleIds: ['RX-004822'], active: true },
    { customer: 'Santiago Pérez', points: 420, earnedPoints: 950, redeemedPoints: 530, visitCount: 3, lastVisit: '2026-08-02', motorcycleIds: ['RX-004823'], active: true },
    { customer: 'Valentina Gil', points: 2480, earnedPoints: 5200, redeemedPoints: 2720, visitCount: 7, lastVisit: '2026-09-28', motorcycleIds: ['RX-004824'], active: true },
  ],
  ledger: [
    { id: 'pts-001', date: '2026-10-04', customer: 'Laura Mendoza', concept: 'Mantenimiento preventivo pagado', orderId: 'OT-000242', amount: 145, type: 'Ganado' },
    { id: 'pts-002', date: '2026-10-02', customer: 'Santiago Pérez', concept: 'Servicio de transmisión pagado', orderId: 'OT-000241', amount: 185, type: 'Ganado' },
    { id: 'pts-003', date: '2026-10-01', customer: 'Daniel Rojas', concept: 'Servicio preventivo pagado', orderId: 'OT-000240', amount: 113, type: 'Ganado' },
    { id: 'pts-004', date: '2026-09-28', customer: 'Valentina Gil', concept: 'Inspección y frenos pagados', orderId: 'OT-000239', amount: 200, type: 'Ganado' },
    { id: 'pts-005', date: '2026-09-20', customer: 'Laura Mendoza', concept: 'Cambio de aceite redimido', orderId: 'OT-000198', amount: -800, type: 'Redimido' },
    { id: 'pts-006', date: '2026-09-18', customer: 'Daniel Rojas', concept: 'Ajuste de saldo por campaña', orderId: '—', amount: 50, type: 'Ajuste' },
  ],
  referrals: [
    { id: 'ref-001', referrer: 'Laura Mendoza', referred: 'Daniel Rojas', date: '2026-08-14', orderId: 'OT-000240' },
    { id: 'ref-002', referrer: 'Laura Mendoza', referred: 'Santiago Pérez', date: '2026-08-20', orderId: 'OT-000241' },
    { id: 'ref-003', referrer: 'Laura Mendoza', referred: 'Valentina Gil', date: '2026-09-02', orderId: 'OT-000239' },
    { id: 'ref-004', referrer: 'Laura Mendoza', referred: 'Camilo Ortiz', date: '2026-10-03' },
    { id: 'ref-005', referrer: 'Laura Mendoza', referred: 'Mateo Vargas', date: '2026-09-11', canceled: true },
    { id: 'ref-006', referrer: 'Daniel Rojas', referred: 'Paula Cárdenas', date: '2026-10-04' },
  ],
  claims: [
    { id: 'claim-001', customer: 'Laura Mendoza', rewardId: 'oil-change', date: '2026-09-20', orderId: 'OT-000198', status: 'Recompensa utilizada' },
    { id: 'claim-002', customer: 'Daniel Rojas', rewardId: 'inspection', date: '2026-09-14', orderId: 'OT-000190', status: 'Recompensa utilizada' },
    { id: 'claim-003', customer: 'Santiago Pérez', rewardId: 'chain-lube', date: '2026-09-10', orderId: 'OT-000184', status: 'Recompensa utilizada' },
    { id: 'claim-004', customer: 'Valentina Gil', rewardId: 'discount', date: '2026-09-01', orderId: 'OT-000175', status: 'Recompensa utilizada' },
  ],
}

export const initialUsers: RodexUser[] = [
  { id: 'usr-001', firstName: 'Mariana', lastName: 'Ríos', email: 'mariana@rodex.co', phone: '+57 300 123 4567', avatarUrl: '', roleId: 'ADMIN', status: 'Activo', lastAccess: 'Hoy, 8:42', createdAt: '18 MAR 2025', assignedOrderIds: [], servicesCompleted: 0 },
  { id: 'usr-002', firstName: 'Carlos', lastName: 'Ramírez', email: 'carlos@rodex.co', phone: '+57 301 445 1830', avatarUrl: '', roleId: 'TECNICO', status: 'Activo', lastAccess: 'Hoy, 8:36', createdAt: '02 ABR 2025', assignedOrderIds: ['OT-000245', 'OT-000241', 'OT-000239'], servicesCompleted: 46 },
  { id: 'usr-003', firstName: 'Andrés', lastName: 'López', email: 'andres@rodex.co', phone: '+57 315 220 1144', avatarUrl: '', roleId: 'TECNICO', status: 'Activo', lastAccess: 'Hoy, 8:19', createdAt: '12 JUN 2025', assignedOrderIds: ['OT-000244', 'OT-000240'], servicesCompleted: 31 },
  { id: 'usr-004', firstName: 'Luisa', lastName: 'Torres', email: 'luisa@rodex.co', phone: '+57 320 555 0122', avatarUrl: '', roleId: 'RECEPCION', status: 'Activo', lastAccess: 'Ayer, 17:48', createdAt: '08 JUL 2025', assignedOrderIds: ['OT-000243'], servicesCompleted: 0 },
  { id: 'usr-005', firstName: 'Valeria', lastName: 'Rojas', email: 'valeria@rodex.co', phone: '+57 310 444 9811', avatarUrl: '', roleId: 'INVENTARIO', status: 'Activo', lastAccess: 'Ayer, 16:12', createdAt: '19 AGO 2025', assignedOrderIds: [], servicesCompleted: 0 },
  { id: 'usr-006', firstName: 'Julián', lastName: 'Pardo', email: 'julian@rodex.co', phone: '+57 304 110 9012', avatarUrl: '', roleId: 'GERENCIA', status: 'Inactivo', lastAccess: '12 SEP 2026, 17:20', createdAt: '10 ENE 2025', assignedOrderIds: [], servicesCompleted: 0 },
]

export const initialAuditEvents: AuditEvent[] = [
  { id: 'evt-001', actorId: 'usr-002', actor: 'Carlos Ramírez', date: '06 OCT 2026 · 10:42', module: 'Órdenes de trabajo', entity: 'OT-000245', action: 'Actualizó el estado', previousValue: 'En proceso', newValue: 'En revisión' },
  { id: 'evt-002', actorId: 'usr-003', actor: 'Andrés López', date: '06 OCT 2026 · 9:58', module: 'RODEX ID', entity: 'RX-004821', action: 'Agregó evidencia fotográfica' },
  { id: 'evt-003', actorId: 'usr-004', actor: 'Luisa Torres', date: '05 OCT 2026 · 17:16', module: 'Inventario', entity: 'SKU LUB-001', action: 'Registró un movimiento de stock', previousValue: '4 unidades', newValue: '3 unidades' },
  { id: 'evt-004', actorId: 'usr-001', actor: 'Mariana Ríos', targetUserId: 'usr-006', date: '12 SEP 2026 · 17:20', module: 'Usuarios', entity: 'usr-006', action: 'Desactivó el acceso' },
]

export const demoInventory = [
  { name: 'Castrol Power1 20W-50 1L', sku: 'ACE-2050', category: 'Aceites', brand: 'Castrol', stock: 24, min: 10, cost: 28500, sale: 42000, location: 'A-01', movement: 'Hoy, 14:42', consumed: 18 },
  { name: 'Filtro Hunk 160', sku: 'FIL-H160', category: 'Filtros', brand: 'Hero', stock: 7, min: 5, cost: 12000, sale: 20000, location: 'B-03', movement: 'Ayer, 16:20', consumed: 12 },
  { name: 'Lubricante de cadena', sku: 'LUB-001', category: 'Lubricantes', brand: 'Motul', stock: 3, min: 8, cost: 15000, sale: 25000, location: 'A-04', movement: '02 OCT 2026', consumed: 9 },
  { name: 'Pastillas de freno delanteras', sku: 'FRE-220', category: 'Frenos', brand: 'Brembo', stock: 0, min: 4, cost: 65000, sale: 95000, location: 'C-02', movement: '28 SEP 2026', consumed: 6 },
]

export const inventoryProducts = ['Kit de arrastre', 'Aceite 10W40', 'Pastillas de freno', 'Filtros de aceite']

export function makeDemoId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

export function formatDemoDate(date = new Date()) {
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Bogota' }).format(date)
}

export function formatCop(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0)
}

export function initials(firstName: string, lastName = '') {
  return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase()
}

export function dateInputToday() {
  const now = new Date()
  const bogotaOffset = -5 * 60
  const local = new Date(now.getTime() + (bogotaOffset - now.getTimezoneOffset()) * 60_000)
  return local.toISOString().slice(0, 10)
}
