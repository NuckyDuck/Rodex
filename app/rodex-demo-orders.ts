export type DemoReportOrder = {
  id: string
  date: string
  dueDate: string
  status: string
  paymentStatus: 'Pagada' | 'Pendiente' | 'Cancelada'
  customer: string
  customerFirstVisit: string
  motorcycleId: string
  motorcycle: string
  brand: string
  plate: string
  engine: string
  mileage: number
  technician: string
  services: string[]
  products: string[]
  serviceCategory: string
  productCategory: string
  productUnits: number
  serviceRevenue: number
  productRevenue: number
  discount: number
  otherIncome: number
  productCost: number
  laborCost: number
  otherCost: number
  resolutionHours: number
}

const motorcycles = {
  'RX-004821': { motorcycle: 'Hero Hunk 160 2V', brand: 'Hero', plate: 'ABC123', engine: '160 cc', mileage: 24850 },
  'RX-004822': { motorcycle: 'AKT NKD 125', brand: 'AKT', plate: 'KLM768', engine: '125 cc', mileage: 18320 },
  'RX-004823': { motorcycle: 'Bajaj Pulsar NS 200', brand: 'Bajaj', plate: 'JFT492', engine: '200 cc', mileage: 31105 },
  'RX-004824': { motorcycle: 'Suzuki Gixxer 150', brand: 'Suzuki', plate: 'MNP207', engine: '150 cc', mileage: 12480 },
} as const

const customerFirstVisits: Record<string, string> = {
  'Laura Mendoza': '2025-03-10',
  'Daniel Rojas': '2025-06-15',
  'Santiago Pérez': '2026-03-01',
  'Valentina Gil': '2026-09-28',
}

type OrderInput = Omit<DemoReportOrder, 'customerFirstVisit' | 'motorcycle' | 'brand' | 'plate' | 'engine' | 'mileage' | 'paymentStatus' | 'otherIncome'> & {
  otherIncome?: number
}

function demoOrder(input: OrderInput): DemoReportOrder {
  const motorcycle = motorcycles[input.motorcycleId as keyof typeof motorcycles]

  return {
    ...input,
    ...motorcycle,
    customerFirstVisit: customerFirstVisits[input.customer],
    paymentStatus: input.status === 'Entregada' ? 'Pagada' : 'Pendiente',
    otherIncome: input.otherIncome ?? 0,
  }
}

export const reportOrders: DemoReportOrder[] = [
  demoOrder({ id: 'OT-000245', date: '2026-10-06', dueDate: '2026-10-06', status: 'En revisión', customer: 'Laura Mendoza', motorcycleId: 'RX-004821', technician: 'Carlos Ramírez', services: ['Cambio de aceite', 'Inspección general'], products: ['Castrol Power1 20W-50 1L'], serviceCategory: 'Mantenimiento', productCategory: 'Aceites', productUnits: 1, serviceRevenue: 185000, productRevenue: 42000, discount: 0, productCost: 28500, laborCost: 70000, otherCost: 0, resolutionHours: 1.5 }),
  demoOrder({ id: 'OT-000244', date: '2026-10-05', dueDate: '2026-10-07', status: 'Esperando aprobación', customer: 'Santiago Pérez', motorcycleId: 'RX-004823', technician: 'Andrés López', services: ['Diagnóstico de transmisión'], products: ['Kit de arrastre'], serviceCategory: 'Transmisión', productCategory: 'Transmisión', productUnits: 1, serviceRevenue: 120000, productRevenue: 240000, discount: 0, productCost: 165000, laborCost: 55000, otherCost: 0, resolutionHours: 2.5 }),
  demoOrder({ id: 'OT-000243', date: '2026-10-02', dueDate: '2026-10-08', status: 'En taller', customer: 'Daniel Rojas', motorcycleId: 'RX-004822', technician: 'Sin asignar', services: ['Inspección inicial'], products: [], serviceCategory: 'Diagnóstico', productCategory: 'Sin producto', productUnits: 0, serviceRevenue: 90000, productRevenue: 0, discount: 0, productCost: 0, laborCost: 0, otherCost: 0, resolutionHours: 0 }),
  demoOrder({ id: 'OT-000242', date: '2026-10-04', dueDate: '2026-10-05', status: 'Entregada', customer: 'Laura Mendoza', motorcycleId: 'RX-004821', technician: 'Carlos Ramírez', services: ['Cambio de aceite', 'Revisión general'], products: ['Castrol Power1 20W-50 1L'], serviceCategory: 'Mantenimiento', productCategory: 'Aceites', productUnits: 1, serviceRevenue: 210000, productRevenue: 42000, discount: 10000, productCost: 28500, laborCost: 75000, otherCost: 4000, resolutionHours: 1.4 }),
  demoOrder({ id: 'OT-000241', date: '2026-10-02', dueDate: '2026-10-03', status: 'Entregada', customer: 'Santiago Pérez', motorcycleId: 'RX-004823', technician: 'Andrés López', services: ['Mantenimiento de transmisión', 'Ajuste de cadena'], products: ['Lubricante de cadena'], serviceCategory: 'Transmisión', productCategory: 'Lubricantes', productUnits: 1, serviceRevenue: 320000, productRevenue: 25000, discount: 15000, productCost: 15000, laborCost: 110000, otherCost: 8000, resolutionHours: 2.1 }),
  demoOrder({ id: 'OT-000240', date: '2026-10-01', dueDate: '2026-10-02', status: 'Entregada', customer: 'Daniel Rojas', motorcycleId: 'RX-004822', technician: 'Carlos Ramírez', services: ['Mantenimiento preventivo', 'Revisión de niveles'], products: ['Filtro Hunk 160'], serviceCategory: 'Mantenimiento', productCategory: 'Filtros', productUnits: 1, serviceRevenue: 190000, productRevenue: 20000, discount: 0, productCost: 12000, laborCost: 68000, otherCost: 3000, resolutionHours: 1.6 }),
  demoOrder({ id: 'OT-000239', date: '2026-09-28', dueDate: '2026-09-29', status: 'Entregada', customer: 'Valentina Gil', motorcycleId: 'RX-004824', technician: 'Andrés López', services: ['Servicio de frenos', 'Inspección de seguridad'], products: ['Pastillas de freno delanteras'], serviceCategory: 'Frenos', productCategory: 'Frenos', productUnits: 1, serviceRevenue: 145000, productRevenue: 95000, discount: 0, productCost: 65000, laborCost: 55000, otherCost: 3000, resolutionHours: 2.3 }),
  demoOrder({ id: 'OT-000198', date: '2026-09-20', dueDate: '2026-09-21', status: 'Entregada', customer: 'Laura Mendoza', motorcycleId: 'RX-004821', technician: 'Carlos Ramírez', services: ['Cambio de aceite'], products: ['Castrol Power1 20W-50 1L'], serviceCategory: 'Mantenimiento', productCategory: 'Aceites', productUnits: 1, serviceRevenue: 160000, productRevenue: 42000, discount: 0, productCost: 28500, laborCost: 58000, otherCost: 2500, resolutionHours: 1.2 }),
  demoOrder({ id: 'OT-000190', date: '2026-09-14', dueDate: '2026-09-15', status: 'Entregada', customer: 'Daniel Rojas', motorcycleId: 'RX-004822', technician: 'Carlos Ramírez', services: ['Diagnóstico y cambio de filtro'], products: ['Filtro Hunk 160'], serviceCategory: 'Mantenimiento', productCategory: 'Filtros', productUnits: 1, serviceRevenue: 125000, productRevenue: 20000, discount: 0, productCost: 12000, laborCost: 45000, otherCost: 2000, resolutionHours: 1.1 }),
  demoOrder({ id: 'OT-000184', date: '2026-09-10', dueDate: '2026-09-11', status: 'Entregada', customer: 'Santiago Pérez', motorcycleId: 'RX-004823', technician: 'Andrés López', services: ['Limpieza y lubricación de cadena'], products: ['Lubricante de cadena'], serviceCategory: 'Transmisión', productCategory: 'Lubricantes', productUnits: 1, serviceRevenue: 120000, productRevenue: 25000, discount: 0, productCost: 15000, laborCost: 43000, otherCost: 2000, resolutionHours: 0.9 }),
  demoOrder({ id: 'OT-000175', date: '2026-09-01', dueDate: '2026-09-02', status: 'Entregada', customer: 'Valentina Gil', motorcycleId: 'RX-004824', technician: 'Andrés López', services: ['Servicio de frenos'], products: ['Pastillas de freno delanteras'], serviceCategory: 'Frenos', productCategory: 'Frenos', productUnits: 1, serviceRevenue: 150000, productRevenue: 95000, discount: 10000, productCost: 65000, laborCost: 55000, otherCost: 3000, resolutionHours: 2 }),
  demoOrder({ id: 'OT-000167', date: '2026-08-21', dueDate: '2026-08-22', status: 'Entregada', customer: 'Laura Mendoza', motorcycleId: 'RX-004821', technician: 'Carlos Ramírez', services: ['Mantenimiento preventivo'], products: ['Castrol Power1 20W-50 1L', 'Filtro Hunk 160'], serviceCategory: 'Mantenimiento', productCategory: 'Aceites y filtros', productUnits: 2, serviceRevenue: 185000, productRevenue: 62000, discount: 0, productCost: 40500, laborCost: 67000, otherCost: 3000, resolutionHours: 1.7 }),
  demoOrder({ id: 'OT-000155', date: '2026-07-20', dueDate: '2026-07-21', status: 'Entregada', customer: 'Daniel Rojas', motorcycleId: 'RX-004822', technician: 'Carlos Ramírez', services: ['Mantenimiento general'], products: ['Castrol Power1 20W-50 1L'], serviceCategory: 'Mantenimiento', productCategory: 'Aceites', productUnits: 1, serviceRevenue: 240000, productRevenue: 42000, discount: 0, productCost: 28500, laborCost: 88000, otherCost: 4000, resolutionHours: 2 }),
  demoOrder({ id: 'OT-000142', date: '2026-04-02', dueDate: '2026-04-03', status: 'Entregada', customer: 'Santiago Pérez', motorcycleId: 'RX-004823', technician: 'Andrés López', services: ['Mantenimiento de transmisión'], products: ['Lubricante de cadena'], serviceCategory: 'Transmisión', productCategory: 'Lubricantes', productUnits: 1, serviceRevenue: 330000, productRevenue: 25000, discount: 0, productCost: 15000, laborCost: 118000, otherCost: 7000, resolutionHours: 2.7 }),
]

export function getClosedDemoOrdersForMotorcycle(motorcycleId: string) {
  return reportOrders
    .filter((order) => order.motorcycleId === motorcycleId && order.status === 'Entregada' && order.paymentStatus === 'Pagada')
    .sort((first, second) => second.date.localeCompare(first.date))
}

export function getPublicProductsFromOrders(orders: DemoReportOrder[]) {
  return orders.flatMap((order) => order.products.filter(Boolean).map((name) => ({ name, date: order.date })))
}

export function getPublicServicesFromOrders(orders: DemoReportOrder[], mileageHistory: { date: string; mileage: number }[]) {
  return orders.map((order) => {
    const services = order.services.filter(Boolean)
    const recordedMileage = mileageHistory.find((reading) => reading.date === order.date)?.mileage ?? null

    return {
      date: order.date,
      title: order.serviceCategory === 'Mantenimiento' ? 'Mantenimiento preventivo' : order.serviceCategory,
      summary: services.slice(0, 2).join(' · ') || order.serviceCategory,
      services,
      mileage: recordedMileage,
    }
  })
}

export function getPublicServiceMetrics(orders: DemoReportOrder[]) {
  return {
    serviceCount: orders.reduce((total, order) => total + order.services.filter(Boolean).length, 0),
    maintenanceCount: orders.filter((order) => order.serviceCategory === 'Mantenimiento').length,
    lastVisit: orders[0]?.date ?? null,
  }
}

export function getMaintenanceStatus(currentMileage: number, nextMaintenanceMileage: number | null) {
  if (nextMaintenanceMileage === null) {
    return { label: 'Sin registro', tone: 'unknown' as const, remainingMileage: null }
  }

  const remainingMileage = nextMaintenanceMileage - currentMileage

  if (remainingMileage <= 0) {
    return { label: 'Atención recomendada', tone: 'attention' as const, remainingMileage }
  }

  if (remainingMileage <= 250) {
    return { label: 'Mantenimiento recomendado', tone: 'recommended' as const, remainingMileage }
  }

  if (remainingMileage <= 1000) {
    return { label: 'Mantenimiento próximo', tone: 'soon' as const, remainingMileage }
  }

  return { label: 'Mantenimiento al día', tone: 'good' as const, remainingMileage }
}

export function getPublicCurrentMileage(motorcycleId: string) {
  return motorcycles[motorcycleId as keyof typeof motorcycles]?.mileage ?? null
}

export function getPublicMotorcycleById(motorcycleId: string) {
  return motorcycles[motorcycleId as keyof typeof motorcycles] ?? null
}

export function getComponentStatuses() {
  return [
    { name: 'Aceite', status: 'Sin registro' },
    { name: 'Frenos', status: 'Sin registro' },
    { name: 'Cadena / kit de arrastre', status: 'Sin registro' },
    { name: 'Llantas', status: 'Sin registro' },
    { name: 'Batería', status: 'Sin registro' },
    { name: 'Motor', status: 'Sin registro' },
    { name: 'Sistema eléctrico', status: 'Sin registro' },
    { name: 'Suspensión', status: 'Sin registro' },
  ]
}
