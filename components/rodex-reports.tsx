'use client'

import { useMemo, useState } from 'react'
import { Activity, ArrowDownRight, ArrowUpRight, Bike, Boxes, CalendarDays, CheckCircle2, ClipboardList, Clock3, Download, FileSpreadsheet, FileText, Filter, Gauge, Package, Search, Settings2, Sparkles, TrendingDown, TrendingUp, UsersRound, Wrench } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { formatCop, formatNumber, getDemoOrderProfit, reportDateOptions, reportInventoryExamples, totalOrderCost, totalOrderRevenue, useRodexDemo, DEMO_TODAY, type DemoReportOrder, type ReportDateOption } from '@/components/rodex-demo-state'
import { DemoNotice, MetricCard, ModulePanel, PanelEmpty, RODEX_CARD, StatusPill } from '@/components/rodex-shared'

const reportTabs = [
  { id: 'general', label: 'Resumen' },
  { id: 'finanzas', label: 'Finanzas' },
  { id: 'ordenes', label: 'Órdenes' },
  { id: 'tecnicos', label: 'Técnicos' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'motos', label: 'Motocicletas' },
  { id: 'inventario', label: 'Inventario' },
  { id: 'fidelizacion', label: 'Fidelización' },
] as const

const chartConfig = {
  ingresos: { label: 'Ingresos', color: 'var(--chart-1)' },
  costos: { label: 'Costos', color: 'var(--chart-2)' },
} satisfies ChartConfig

const filterSelectClass = 'h-9 w-full min-w-0 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 text-[11px] text-zinc-300 focus:border-[#ed1c24]'

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function getPeriodStart(period: ReportDateOption) {
  if (period === 'Hoy') return DEMO_TODAY
  if (period === 'Esta semana') return '2026-10-05'
  if (period === 'Este mes') return '2026-10-01'
  if (period === 'Este trimestre') return '2026-10-01'
  if (period === 'Este año') return '2026-01-01'
  return '2026-10-01'
}

function isClosedAndPaid(order: DemoReportOrder) {
  return order.status === 'Entregada' && order.paymentStatus === 'Pagada'
}

function formatMonth(date: string) {
  return new Intl.DateTimeFormat('es-CO', { month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)).replace('.', '')
}

function aggregateBy<T>(items: T[], keyFor: (item: T) => string, valueFor: (item: T) => number) {
  const output = new Map<string, { label: string; value: number; orders: number }>()
  items.forEach((item) => {
    const label = keyFor(item)
    const existing = output.get(label) ?? { label, value: 0, orders: 0 }
    output.set(label, { label, value: existing.value + valueFor(item), orders: existing.orders + 1 })
  })
  return [...output.values()].sort((a, b) => b.value - a.value)
}

export function RodexReportsModule() {
  const { demo } = useRodexDemo()
  const [period, setPeriod] = useState<ReportDateOption>('Este año')
  const [customFrom, setCustomFrom] = useState('2026-10-01')
  const [customTo, setCustomTo] = useState(DEMO_TODAY)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [technicianFilter, setTechnicianFilter] = useState('Todos')
  const [clientFilter, setClientFilter] = useState('Todos')
  const [motorcycleFilter, setMotorcycleFilter] = useState('Todas')
  const [rodexFilter, setRodexFilter] = useState('Todos')
  const [serviceFilter, setServiceFilter] = useState('Todos')
  const [productFilter, setProductFilter] = useState('Todos')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [exportMessage, setExportMessage] = useState('')
  const [exporting, setExporting] = useState(false)

  const orders = demo.reportOrders
  const dateStart = period === 'Personalizado' ? customFrom : getPeriodStart(period)
  const dateEnd = period === 'Personalizado' ? customTo : DEMO_TODAY
  const allValues = {
    technicians: [...new Set(orders.map((order) => order.technician))],
    clients: [...new Set(orders.map((order) => order.customer))],
    motorcycles: [...new Set(orders.map((order) => order.motorcycle))],
    rodexIds: [...new Set(orders.map((order) => order.motorcycleId))],
    services: [...new Set(orders.flatMap((order) => order.services))],
    products: [...new Set(orders.flatMap((order) => order.products))],
    categories: [...new Set(orders.flatMap((order) => [order.serviceCategory, order.productCategory]).filter((category) => category !== 'Sin producto'))],
    statuses: [...new Set(orders.map((order) => order.status))],
  }
  const filteredOrders = useMemo(() => orders.filter((order) => {
    const searchText = `${order.id} ${order.motorcycleId} ${order.motorcycle} ${order.plate} ${order.customer} ${order.technician} ${order.services.join(' ')} ${order.products.join(' ')}`.toLowerCase()
    return order.date >= dateStart && order.date <= dateEnd
      && (technicianFilter === 'Todos' || order.technician === technicianFilter)
      && (clientFilter === 'Todos' || order.customer === clientFilter)
      && (motorcycleFilter === 'Todas' || order.motorcycle === motorcycleFilter)
      && (rodexFilter === 'Todos' || order.motorcycleId === rodexFilter)
      && (serviceFilter === 'Todos' || order.services.includes(serviceFilter))
      && (productFilter === 'Todos' || order.products.includes(productFilter))
      && (categoryFilter === 'Todas' || order.serviceCategory === categoryFilter || order.productCategory === categoryFilter)
      && (statusFilter === 'Todos' || order.status === statusFilter)
      && searchText.includes(search.toLowerCase())
  }), [orders, dateStart, dateEnd, technicianFilter, clientFilter, motorcycleFilter, rodexFilter, serviceFilter, productFilter, categoryFilter, statusFilter, search])

  const closedOrders = filteredOrders.filter(isClosedAndPaid)
  const revenue = sum(closedOrders.map(totalOrderRevenue))
  const costs = sum(closedOrders.map(totalOrderCost))
  const profit = revenue - costs
  const margin = revenue > 0 ? profit / revenue * 100 : 0
  const averageTicket = closedOrders.length > 0 ? revenue / closedOrders.length : 0
  const servicesDone = sum(closedOrders.map((order) => order.services.length))
  const productUnits = sum(closedOrders.map((order) => order.productUnits))
  const uniqueMotorcycles = new Set(closedOrders.map((order) => order.motorcycleId)).size
  const uniqueCustomers = new Set(closedOrders.map((order) => order.customer)).size
  const recurringCustomers = aggregateBy(closedOrders, (order) => order.customer, () => 1).filter((customer) => customer.orders > 1).length
  const newCustomers = [...new Map(filteredOrders.filter((order) => order.customerFirstVisit >= dateStart && order.customerFirstVisit <= dateEnd).map((order) => [order.customer, order.customerFirstVisit])).keys()].length
  const trend = useMemo(() => {
    const grouped = new Map<string, { mes: string; ingresos: number; costos: number }>()
    closedOrders.forEach((order) => {
      const month = order.date.slice(0, 7)
      const current = grouped.get(month) ?? { mes: formatMonth(order.date), ingresos: 0, costos: 0 }
      current.ingresos += totalOrderRevenue(order)
      current.costos += totalOrderCost(order)
      grouped.set(month, current)
    })
    return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, value]) => value)
  }, [closedOrders])
  const serviceMargins = aggregateBy(closedOrders, (order) => order.serviceCategory, (order) => order.serviceRevenue - order.laborCost)
  const productMargins = aggregateBy(closedOrders, (order) => order.productCategory, (order) => order.productRevenue - order.productCost)
  const lowStockItems = reportInventoryExamples.filter((item) => item.stock <= item.min)
  const statusCount = (status: string) => filteredOrders.filter((order) => order.status === status).length
  const technicians = useMemo(() => aggregateBy(closedOrders, (order) => order.technician, () => 1).map((technician) => {
    const entries = closedOrders.filter((order) => order.technician === technician.label)
    const assigned = filteredOrders.filter((order) => order.technician === technician.label).length
    const generated = sum(entries.map(totalOrderRevenue))
    return { ...technician, assigned, generated, hours: sum(entries.map((order) => order.resolutionHours)), completionRate: assigned ? Math.round(entries.length / assigned * 100) : 0, services: sum(entries.map((order) => order.services.length)) }
  }), [closedOrders, filteredOrders])
  const customers = useMemo(() => aggregateBy(closedOrders, (order) => order.customer, (order) => totalOrderRevenue(order)).map((customer) => {
    const entries = closedOrders.filter((order) => order.customer === customer.label)
    return { ...customer, average: customer.value / customer.orders, lifetimeValue: sum(orders.filter((order) => order.customer === customer.label && isClosedAndPaid(order)).map(totalOrderRevenue)), motorcycleCount: new Set(entries.map((order) => order.motorcycleId)).size, firstVisit: entries.map((order) => order.customerFirstVisit).sort()[0], lastVisit: entries.map((order) => order.date).sort().at(-1) ?? '—' }
  }), [closedOrders, orders])
  const motorcycles = useMemo(() => aggregateBy(closedOrders, (order) => order.motorcycleId, (order) => order.serviceRevenue).map((moto) => {
    const entries = closedOrders.filter((order) => order.motorcycleId === moto.label)
    const lastEntry = [...entries].sort((a, b) => b.date.localeCompare(a.date))[0]
    return { ...moto, bike: lastEntry.motorcycle, plate: lastEntry.plate, brand: lastEntry.brand, engine: lastEntry.engine, mileage: lastEntry.mileage, services: sum(entries.map((order) => order.services.length)), lastVisit: lastEntry.date }
  }), [closedOrders])
  const totalInventoryValue = sum(reportInventoryExamples.map((item) => item.stock * item.cost))
  const totalInventoryUnits = sum(reportInventoryExamples.map((item) => item.stock))
  const totalRedeemed = demo.loyalty.members.reduce((total, member) => total + member.redeemedPoints, 0)
  const totalIssued = demo.loyalty.members.reduce((total, member) => total + member.earnedPoints, 0)
  const currentRange = period === 'Personalizado' ? `${customFrom} — ${customTo}` : `${period} · 2026`

  function resetFilters() {
    setTechnicianFilter('Todos')
    setClientFilter('Todos')
    setMotorcycleFilter('Todas')
    setRodexFilter('Todos')
    setServiceFilter('Todos')
    setProductFilter('Todos')
    setCategoryFilter('Todas')
    setStatusFilter('Todos')
    setSearch('')
  }

  function downloadFile(contents: BlobPart, type: string, filename: string) {
    const url = URL.createObjectURL(new Blob([contents], { type }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function reportRows() {
    return closedOrders.map((order) => ({
      'Fecha': order.date,
      'OT': order.id,
      'Cliente': order.customer,
      'Motocicleta': order.motorcycle,
      'Placa': order.plate,
      'RODEX ID': order.motorcycleId,
      'Técnico': order.technician,
      'Servicios': order.services.join(', '),
      'Productos': order.products.join(', '),
      'Ingresos': totalOrderRevenue(order),
      'Costos': totalOrderCost(order),
      'Ganancia': getDemoOrderProfit(order),
      'Estado': order.status,
    }))
  }

  function exportCsv() {
    const rows = reportRows()
    if (!rows.length) {
      setExportMessage('No hay órdenes pagadas para exportar con este corte.')
      return
    }
    const columns = Object.keys(rows[0]) as (keyof (typeof rows)[number])[]
    const escapeCell = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const csv = [columns.map(escapeCell).join(','), ...rows.map((row) => columns.map((column) => escapeCell(row[column])).join(','))].join('\r\n')
    downloadFile(`\uFEFF${csv}`, 'text/csv;charset=utf-8', 'rodex-reporte-demo.csv')
    setExportMessage('CSV descargado con las órdenes pagadas del filtro actual.')
  }

  async function exportExcel() {
    const rows = reportRows()
    if (!rows.length) {
      setExportMessage('No hay órdenes pagadas para exportar con este corte.')
      return
    }
    setExporting(true)
    try {
      const XLSX = await import('xlsx')
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(rows)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Órdenes RODEX')
      XLSX.writeFile(workbook, 'rodex-reporte-demo.xlsx')
      setExportMessage('Excel descargado con las órdenes pagadas del filtro actual.')
    } catch {
      setExportMessage('No se pudo preparar el Excel en esta sesión.')
    } finally {
      setExporting(false)
    }
  }

  async function exportPdf() {
    const rows = reportRows()
    if (!rows.length) {
      setExportMessage('No hay órdenes pagadas para exportar con este corte.')
      return
    }
    setExporting(true)
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
      const document = new jsPDF({ orientation: 'landscape' })
      document.setFontSize(16)
      document.text('RODEX · Reporte operativo', 14, 16)
      document.setFontSize(9)
      document.text(`Corte: ${currentRange} · Modo demo · COP`, 14, 22)
      autoTable(document, {
        head: [['Fecha', 'OT', 'Cliente', 'Motocicleta', 'RODEX ID', 'Técnico', 'Ingresos', 'Costos', 'Ganancia']],
        body: closedOrders.map((order) => [order.date, order.id, order.customer, order.motorcycle, order.motorcycleId, order.technician, formatCop(totalOrderRevenue(order)), formatCop(totalOrderCost(order)), formatCop(getDemoOrderProfit(order))]),
        startY: 28,
        styles: { fontSize: 7 },
        headStyles: { fillColor: [237, 28, 36] },
      })
      document.save('rodex-reporte-demo.pdf')
      setExportMessage('PDF descargado con el resumen de órdenes del filtro actual.')
    } catch {
      setExportMessage('No se pudo preparar el PDF en esta sesión.')
    } finally {
      setExporting(false)
    }
  }

  const revenueBreakdown = [
    { label: 'Servicios', value: sum(closedOrders.map((order) => order.serviceRevenue)), icon: Wrench },
    { label: 'Productos', value: sum(closedOrders.map((order) => order.productRevenue)), icon: Package },
    { label: 'Otros ingresos', value: sum(closedOrders.map((order) => order.otherIncome)), icon: ArrowUpRight },
    { label: 'Descuentos', value: -sum(closedOrders.map((order) => order.discount)), icon: ArrowDownRight },
  ]
  const costBreakdown = [
    { label: 'Costo de productos', value: sum(closedOrders.map((order) => order.productCost)) },
    { label: 'Mano de obra estimada', value: sum(closedOrders.map((order) => order.laborCost)) },
    { label: 'Otros costos', value: sum(closedOrders.map((order) => order.otherCost)) },
  ]
  const filterCount = [technicianFilter !== 'Todos', clientFilter !== 'Todos', motorcycleFilter !== 'Todas', rodexFilter !== 'Todos', serviceFilter !== 'Todos', productFilter !== 'Todos', categoryFilter !== 'Todas', statusFilter !== 'Todos'].filter(Boolean).length
  const rangeOrders = filteredOrders.length

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <DemoNotice>Indicadores calculados con órdenes y productos de ejemplo vinculados a cliente, moto, RODEX ID y técnico. Las cifras son demostrativas y no representan ventas reales.</DemoNotice>
      <Card className={RODEX_CARD}>
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div className="flex min-w-0 flex-wrap items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-[#ed1c24]/10 text-[#ed1c24]"><Activity className="size-4" /></span><div><p className="text-sm font-semibold">Inteligencia del taller</p><p className="mt-1 text-[10px] text-zinc-500">{currentRange} · {rangeOrders} órdenes relacionadas</p></div><Badge variant="outline" className="border-amber-500/25 text-[9px] text-amber-300">COP · DEMO</Badge></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={exporting} onClick={exportCsv} className="h-8 border-zinc-700 px-2 text-[10px]"><Download data-icon="inline-start" />CSV</Button><Button type="button" variant="outline" disabled={exporting} onClick={exportExcel} className="h-8 border-zinc-700 px-2 text-[10px]"><FileSpreadsheet data-icon="inline-start" />Excel</Button><Button type="button" variant="outline" disabled={exporting} onClick={exportPdf} className="h-8 border-zinc-700 px-2 text-[10px]"><FileText data-icon="inline-start" />PDF</Button></div></div>
          <div className="grid gap-2 sm:grid-cols-[180px_1fr_auto]"><label className="text-[10px] text-zinc-500">Periodo<select aria-label="Periodo del reporte" value={period} onChange={(event) => setPeriod(event.target.value as ReportDateOption)} className="mt-1 h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-200">{reportDateOptions.map((option) => <option key={option}>{option}</option>)}</select></label>{period === 'Personalizado' ? <div className="grid grid-cols-2 gap-2"><label className="text-[10px] text-zinc-500">Desde<Input type="date" value={customFrom} max={customTo} onChange={(event) => setCustomFrom(event.target.value)} className="mt-1 h-9 border-zinc-800 bg-zinc-950 text-xs" /></label><label className="text-[10px] text-zinc-500">Hasta<Input type="date" value={customTo} min={customFrom} max={DEMO_TODAY} onChange={(event) => setCustomTo(event.target.value)} className="mt-1 h-9 border-zinc-800 bg-zinc-950 text-xs" /></label></div> : <div className="relative self-end"><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-600" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="OT, placa, RODEX ID, cliente, servicio..." className="h-9 border-zinc-800 bg-zinc-950 pl-9 text-xs" /></div>}<Button type="button" variant="outline" onClick={() => setShowFilters((value) => !value)} className="h-9 self-end border-zinc-700 text-[10px]"><Filter data-icon="inline-start" />Filtros{filterCount > 0 && <Badge className="ml-1 h-4 min-w-4 justify-center bg-[#ed1c24] px-1 text-[9px] text-white">{filterCount}</Badge>}</Button></div>
          {showFilters && <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 pt-3 sm:grid-cols-3 xl:grid-cols-4">{[
            { label: 'Técnico', value: technicianFilter, set: setTechnicianFilter, options: ['Todos', ...allValues.technicians] },
            { label: 'Cliente', value: clientFilter, set: setClientFilter, options: ['Todos', ...allValues.clients] },
            { label: 'Motocicleta', value: motorcycleFilter, set: setMotorcycleFilter, options: ['Todas', ...allValues.motorcycles] },
            { label: 'RODEX ID', value: rodexFilter, set: setRodexFilter, options: ['Todos', ...allValues.rodexIds] },
            { label: 'Servicio', value: serviceFilter, set: setServiceFilter, options: ['Todos', ...allValues.services] },
            { label: 'Producto', value: productFilter, set: setProductFilter, options: ['Todos', ...allValues.products] },
            { label: 'Categoría', value: categoryFilter, set: setCategoryFilter, options: ['Todas', ...allValues.categories] },
            { label: 'Estado de OT', value: statusFilter, set: setStatusFilter, options: ['Todos', ...allValues.statuses] },
          ].map((filter) => <label key={filter.label} className="min-w-0 text-[10px] text-zinc-500">{filter.label}<select value={filter.value} onChange={(event) => filter.set(event.target.value)} className={`${filterSelectClass} mt-1`}>{filter.options.map((option) => <option key={option}>{option}</option>)}</select></label>)}</div>}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-3"><p className="text-[10px] text-zinc-600">Relación de negocio: OT → motocicleta → RODEX ID → cliente → técnico → productos y pagos.</p><Button type="button" variant="ghost" onClick={resetFilters} className="h-7 px-2 text-[10px] text-zinc-500 hover:text-zinc-200"><Settings2 data-icon="inline-start" />Limpiar filtros</Button></div>
        </CardContent>
      </Card>
      {exportMessage && <p role="status" className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-[11px] text-zinc-400">{exportMessage}</p>}

      <Tabs defaultValue="general" className="gap-5">
        <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-zinc-800 bg-[#101213] p-1">
          {reportTabs.map((tab) => <TabsTrigger key={tab.id} value={tab.id} className="min-h-9 shrink-0 px-3 text-[11px]">{tab.label}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="general" className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><MetricCard label="Ingresos cobrados" value={formatCop(revenue)} detail={`${closedOrders.length} órdenes pagadas`} icon={ArrowUpRight} accent /><MetricCard label="Ganancia estimada" value={formatCop(profit)} detail="Después de producto, mano de obra y otros costos" icon={TrendingUp} /><MetricCard label="Margen promedio" value={`${margin.toFixed(1)}%`} detail={`${formatCop(costs)} costos estimados`} icon={Gauge} /><MetricCard label="Ticket promedio" value={formatCop(averageTicket)} detail={`${uniqueCustomers} clientes · ${uniqueMotorcycles} motocicletas atendidas`} icon={UsersRound} /></div>
          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
            <ModulePanel title="Ingresos y costos por mes" description="Solo incluye órdenes entregadas y pagadas dentro del corte seleccionado."><ChartContainer config={chartConfig} className="h-[220px] w-full"><BarChart accessibilityLayer data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" /><XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} /><YAxis tickLine={false} axisLine={false} tickMargin={6} width={44} tickFormatter={(value) => `${Math.round(Number(value) / 1000000)}M`} fontSize={10} /><ChartTooltip cursor={false} content={<ChartTooltipContent />} /><Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 10, color: '#a1a1aa' }} /><Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={[4, 4, 0, 0]} maxBarSize={28} /><Bar dataKey="costos" fill="var(--color-costos)" radius={[4, 4, 0, 0]} maxBarSize={28} /></BarChart></ChartContainer><p className="mt-2 text-[10px] text-zinc-600">Los meses sin órdenes cerradas no aparecen. Ajusta el periodo para cambiar el análisis.</p></ModulePanel>
            <ModulePanel title="Señales para el taller" description="Prioridades derivadas de las órdenes, no de métricas decorativas."><div className="flex flex-col gap-2"><div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3"><div className="flex items-center gap-2 text-xs font-semibold text-amber-100"><Clock3 className="size-3.5" />En espera</div><p className="mt-1 text-[11px] leading-5 text-zinc-400">{filteredOrders.filter((order) => ['Esperando aprobación', 'Esperando repuesto', 'En taller'].includes(order.status)).length} OTs requieren seguimiento antes de cerrar el ciclo.</p></div><div className="rounded-lg border border-red-500/20 bg-red-500/[0.04] p-3"><div className="flex items-center gap-2 text-xs font-semibold text-red-200"><Boxes className="size-3.5" />Inventario en alerta</div><p className="mt-1 text-[11px] leading-5 text-zinc-400">{lowStockItems.length} productos en o bajo el mínimo; valor total en inventario {formatCop(totalInventoryValue)}.</p></div><div className="rounded-lg border border-zinc-800 bg-zinc-900/35 p-3"><div className="flex items-center gap-2 text-xs font-semibold text-zinc-200"><Wrench className="size-3.5 text-[#ed1c24]" />Servicio con mayor contribución</div><p className="mt-1 text-[11px] leading-5 text-zinc-400">{serviceMargins[0]?.label ?? 'Sin datos'} · {formatCop(serviceMargins[0]?.value ?? 0)} antes de costos generales.</p></div><div className="flex items-center justify-between gap-3 border-t border-zinc-800 pt-3 text-[10px] text-zinc-500"><span>{newCustomers} clientes nuevos en el corte</span><span>{recurringCustomers} recurrentes</span></div></div></ModulePanel>
          </div>
          <ModulePanel title="Actividad reciente de órdenes" description="El contexto une cada OT con la moto, el RODEX ID, su propietario y el técnico asignado."><OrderList orders={filteredOrders.slice(0, 5)} /></ModulePanel>
        </TabsContent>

        <TabsContent value="finanzas" className="flex flex-col gap-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><MetricCard label="Ingresos netos" value={formatCop(revenue)} detail="Servicios + productos + otros − descuentos" icon={ArrowUpRight} accent /><MetricCard label="Costos estimados" value={formatCop(costs)} detail="Productos + mano de obra + otros" icon={ArrowDownRight} /><MetricCard label="Ganancia" value={formatCop(profit)} detail="Ingresos netos menos costos" icon={TrendingUp} /><MetricCard label="Margen" value={`${margin.toFixed(1)}%`} detail="Ganancia / ingresos netos" icon={Gauge} /></div><div className="grid gap-4 xl:grid-cols-2"><ModulePanel title="Composición de ingresos" description="Desglose desde servicios y productos de OTs pagadas."><div className="flex flex-col gap-2">{revenueBreakdown.map((item) => <div key={item.label} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3"><item.icon className="size-4 text-[#ed1c24]" /><span className="flex-1 text-xs text-zinc-400">{item.label}</span><span className={`font-mono text-xs ${item.value < 0 ? 'text-amber-300' : 'text-zinc-100'}`}>{formatCop(item.value)}</span></div>)}</div></ModulePanel><ModulePanel title="Estructura de costos" description="Costos del periodo usados para calcular ganancia estimada."><div className="flex flex-col gap-2">{costBreakdown.map((item) => <div key={item.label} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3"><span className="flex-1 text-xs text-zinc-400">{item.label}</span><span className="font-mono text-xs text-zinc-100">{formatCop(item.value)}</span></div>)}</div><div className="mt-3 rounded-lg border border-zinc-800 p-3"><div className="flex justify-between text-xs"><span className="text-zinc-400">Margen del corte</span><span className="font-semibold text-emerald-300">{margin.toFixed(1)}%</span></div></div></ModulePanel></div><div className="grid gap-4 md:grid-cols-2"><RankedPanel title="Servicio con mayor contribución" description="Ingreso de servicio menos mano de obra estimada." rows={serviceMargins} /><RankedPanel title="Producto con mayor contribución" description="Venta de producto menos costo unitario." rows={productMargins} /></div><p className="text-[10px] leading-5 text-zinc-600">La ganancia y la mano de obra son estimaciones del dataset de demo. Para reportes contables se requiere conectar costos y pagos conciliados.</p></TabsContent>

        <TabsContent value="ordenes" className="flex flex-col gap-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><MetricCard label="Órdenes creadas" value={formatNumber(filteredOrders.length)} detail="Dentro del rango y filtros" icon={ClipboardList} /><MetricCard label="Entregadas y pagadas" value={formatNumber(closedOrders.length)} detail="Ciclo completado" icon={CheckCircle2} accent /><MetricCard label="Pendientes de acción" value={formatNumber(filteredOrders.filter((order) => !isClosedAndPaid(order) && order.status !== 'Cancelada').length)} detail={`${statusCount('Esperando aprobación')} esperan aprobación`} icon={Clock3} /><MetricCard label="Atrasadas" value={formatNumber(filteredOrders.filter((order) => !isClosedAndPaid(order) && order.status !== 'Cancelada' && order.dueDate < DEMO_TODAY).length)} detail={`${statusCount('Esperando repuesto')} esperan producto`} icon={CalendarDays} /></div><ModulePanel title="Ciclo de órdenes" description="OT → motocicleta → RODEX ID → cliente → técnico → servicio y producto."><OrderList orders={filteredOrders} /></ModulePanel><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{['En taller', 'Esperando aprobación', 'Esperando repuesto', 'Cancelada'].map((status) => <div key={status} className="rounded-xl border border-zinc-800 bg-[#101213] p-3"><p className="text-[10px] text-zinc-500">{status}</p><p className="mt-1 text-xl font-bold">{statusCount(status)}</p></div>)}</div></TabsContent>

        <TabsContent value="tecnicos" className="flex flex-col gap-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><MetricCard label="Técnicos con OT" value={formatNumber(technicians.length)} detail="En el corte seleccionado" icon={UsersRound} /><MetricCard label="Servicios realizados" value={formatNumber(servicesDone)} detail="En órdenes entregadas y pagadas" icon={Wrench} /><MetricCard label="Tiempo promedio" value={`${closedOrders.length ? (sum(closedOrders.map((order) => order.resolutionHours)) / closedOrders.length).toFixed(1) : '0.0'} h`} detail="Horas registradas por OT" icon={Clock3} /></div><ModulePanel title="Carga y resolución del taller" description="Indicadores operativos por técnico. No son una competencia de productividad."><div className="flex flex-col gap-2">{technicians.map((technician) => <div key={technician.label} className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 sm:grid-cols-[1.25fr_repeat(5,1fr)] sm:items-center"><div className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-1"><span className="flex size-8 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-zinc-300">{technician.label.split(' ').map((name) => name[0]).join('')}</span><div><p className="text-xs font-semibold">{technician.label}</p><p className="mt-1 text-[10px] text-zinc-500">Seguimiento de asignaciones</p></div></div><MiniValue label="OT asignadas" value={String(technician.assigned)} /><MiniValue label="OT cerradas" value={String(technician.orders)} /><MiniValue label="Finalización" value={`${technician.completionRate}%`} /><MiniValue label="Servicios" value={String(technician.services)} /><MiniValue label="Valor generado" value={formatCop(technician.generated)} /></div>)}{technicians.length === 0 && <PanelEmpty>Sin órdenes pagadas para este técnico y periodo.</PanelEmpty>}</div></ModulePanel><ModulePanel title="OT pendientes por asignar" description="Las órdenes sin técnico no se incluyen en la tasa de finalización."><OrderList orders={filteredOrders.filter((order) => order.technician === 'Sin asignar')} /></ModulePanel></TabsContent>

        <TabsContent value="clientes" className="flex flex-col gap-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><MetricCard label="Clientes activos" value={formatNumber(uniqueCustomers)} detail="Con una OT pagada en el corte" icon={UsersRound} /><MetricCard label="Clientes nuevos" value={formatNumber(newCustomers)} detail="Primera visita registrada en el periodo" icon={ArrowUpRight} accent /><MetricCard label="Recurrentes" value={formatNumber(recurringCustomers)} detail="Más de una OT pagada en el corte" icon={Activity} /><MetricCard label="Ticket promedio" value={formatCop(averageTicket)} detail="Por orden pagada" icon={Gauge} /></div><ModulePanel title="Relación de clientes" description="Frecuencia de visita, valor histórico del corte y motocicletas registradas."><div className="flex flex-col gap-2">{customers.map((customer) => <div key={customer.label} className="grid grid-cols-2 gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 sm:grid-cols-[1.25fr_repeat(4,1fr)]"><div className="col-span-2 sm:col-span-1"><p className="text-xs font-semibold">{customer.label}</p><p className="mt-1 text-[10px] text-zinc-500">Primera visita {customer.firstVisit}</p></div><MiniValue label="Órdenes" value={String(customer.orders)} /><MiniValue label="Ticket promedio" value={formatCop(customer.average)} /><MiniValue label="Valor histórico" value={formatCop(customer.lifetimeValue)} /><MiniValue label="Motos" value={String(customer.motorcycleCount)} /></div>)}{customers.length === 0 && <PanelEmpty>Sin clientes en este corte.</PanelEmpty>}</div></ModulePanel></TabsContent>

        <TabsContent value="motos" className="flex flex-col gap-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><MetricCard label="Motos registradas" value={formatNumber(new Set(orders.map((order) => order.motorcycleId)).size)} detail="Con RODEX ID activo en el demo" icon={Bike} /><MetricCard label="Atendidas en el corte" value={formatNumber(uniqueMotorcycles)} detail="Al menos una OT pagada" icon={Wrench} accent /><MetricCard label="Marcas atendidas" value={formatNumber(new Set(closedOrders.map((order) => order.brand)).size)} detail="Hero, AKT, Bajaj y Suzuki" icon={Gauge} /><MetricCard label="Servicios realizados" value={formatNumber(servicesDone)} detail={`${formatNumber(productUnits)} productos utilizados`} icon={ClipboardList} /></div><ModulePanel title="Actividad técnica por RODEX ID" description="Kilometraje, servicios realizados y última visita desde la ficha digital."><div className="flex flex-col gap-2">{motorcycles.map((moto) => <div key={moto.label} className="grid grid-cols-2 gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 sm:grid-cols-[1.3fr_repeat(4,1fr)]"><div className="col-span-2 sm:col-span-1"><p className="font-mono text-xs font-semibold text-[#ed1c24]">{moto.label}</p><p className="mt-1 text-[10px] text-zinc-400">{moto.bike} · {moto.plate}</p><p className="mt-1 text-[10px] text-zinc-600">{moto.brand} · {moto.engine}</p></div><MiniValue label="Servicios" value={String(moto.services)} /><MiniValue label="Kilometraje" value={`${formatNumber(moto.mileage)} km`} /><MiniValue label="Última visita" value={moto.lastVisit} /><MiniValue label="Ingreso servicio" value={formatCop(moto.value)} /></div>)}{motorcycles.length === 0 && <PanelEmpty>No hay motocicletas atendidas en este corte.</PanelEmpty>}</div></ModulePanel></TabsContent>

        <TabsContent value="inventario" className="flex flex-col gap-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><MetricCard label="Valor en inventario" value={formatCop(totalInventoryValue)} detail={`${formatNumber(totalInventoryUnits)} unidades disponibles`} icon={Boxes} accent /><MetricCard label="Productos consumidos" value={formatNumber(productUnits)} detail="En órdenes pagadas del periodo" icon={Package} /><MetricCard label="Bajo stock" value={formatNumber(lowStockItems.length)} detail="Productos en o bajo mínimo" icon={TrendingDown} /><MetricCard label="Compras del periodo" value="—" detail="Conecta compras para calcularlo" icon={FileText} /></div><ModulePanel title="Stock relacionado con servicios" description="Costo, precio, consumo y rotación de productos existentes en reportInventoryExamples."><div className="flex flex-col gap-2">{reportInventoryExamples.map((item) => <div key={item.sku} className="grid grid-cols-2 gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 sm:grid-cols-[1.4fr_repeat(5,1fr)]"><div className="col-span-2 sm:col-span-1"><p className="text-xs font-semibold">{item.name}</p><p className="mt-1 font-mono text-[10px] text-zinc-500">{item.sku} · {item.category}</p></div><MiniValue label="Stock" value={`${item.stock} / mín. ${item.min}`} /><MiniValue label="Valor en stock" value={formatCop(item.stock * item.cost)} /><MiniValue label="Costo promedio" value={formatCop(item.cost)} /><MiniValue label="Precio demo" value={formatCop(item.sale)} /><MiniValue label="Consumo" value={`${item.consumed} u.`} /></div>)}</div></ModulePanel><p className="text-[10px] leading-5 text-zinc-600">Rotación, compras y productos sin movimiento se completarán con movimientos de almacén persistidos. No se estima información ausente.</p></TabsContent>

        <TabsContent value="fidelizacion" className="flex flex-col gap-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><MetricCard label="Clientes por nivel" value={formatNumber(demo.loyalty.members.length)} detail="Bronce, Silver, Gold y RODEX Black" icon={Sparkles} /><MetricCard label="Puntos entregados" value={formatNumber(totalIssued)} detail="En los perfiles del demo" icon={TrendingUp} /><MetricCard label="Puntos redimidos" value={formatNumber(totalRedeemed)} detail={`${totalIssued ? Math.round(totalRedeemed / totalIssued * 100) : 0}% tasa de redención`} icon={ArrowDownRight} accent /><MetricCard label="Referidos validados" value={formatNumber(demo.loyalty.referrals.filter((item) => item.orderId && !item.canceled).length)} detail={`${demo.loyalty.claims.length} recompensas registradas`} icon={UsersRound} /></div><ModulePanel title="Resultado del programa RODEX" description="Puntos y recompensas del mismo estado demo que usa el módulo Fidelización."><div className="flex flex-col gap-2">{demo.settings.loyalty.tiers.map((tier) => { const count = demo.loyalty.members.filter((member) => [...demo.settings.loyalty.tiers].filter((level) => level.active && level.minimumPoints <= member.points).sort((a, b) => b.minimumPoints - a.minimumPoints)[0]?.id === tier.id).length; return <div key={tier.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3"><span className="size-2 rounded-full bg-[#ed1c24]" /><span className="flex-1 text-xs">{tier.name}</span><span className="text-[10px] text-zinc-500">{count} clientes · {formatNumber(tier.minimumPoints)}+ pts</span></div>})}</div></ModulePanel></TabsContent>
      </Tabs>
    </div>
  )
}

function OrderList({ orders }: { orders: DemoReportOrder[] }) {
  return <div className="flex flex-col gap-2">{orders.map((order) => <div key={order.id} className="grid min-w-0 grid-cols-1 gap-2 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 sm:grid-cols-[105px_1.2fr_1fr_0.8fr_auto]"><div><p className="font-mono text-xs font-semibold text-[#ed1c24]">{order.id}</p><p className="mt-1 text-[10px] text-zinc-600">{order.date}</p></div><div className="min-w-0"><p className="truncate text-xs font-semibold">{order.motorcycle}</p><p className="mt-1 truncate font-mono text-[10px] text-zinc-500">{order.motorcycleId} · {order.plate}</p></div><div className="min-w-0"><p className="truncate text-xs text-zinc-300">{order.customer}</p><p className="mt-1 truncate text-[10px] text-zinc-500">{order.technician}</p></div><div className="text-[10px] text-zinc-500"><p className="truncate">{order.services.join(' · ')}</p><p className="mt-1 truncate">{order.products.join(' · ') || 'Sin productos'}</p></div><div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end"><StatusPill status={order.status} /><span className="font-mono text-[10px] text-zinc-400">{order.paymentStatus === 'Pagada' ? formatCop(totalOrderRevenue(order)) : 'Pendiente de pago'}</span></div></div>)}{orders.length === 0 && <PanelEmpty>No hay órdenes para este filtro.</PanelEmpty>}</div>
}

function RankedPanel({ title, description, rows }: { title: string; description: string; rows: { label: string; value: number; orders: number }[] }) {
  return <ModulePanel title={title} description={description}><div className="flex flex-col gap-2">{rows.map((row, index) => <div key={row.label} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-[10px] font-bold text-zinc-400">{index + 1}</span><span className="min-w-0 flex-1 truncate text-xs text-zinc-300">{row.label}</span><span className="text-right"><span className={`block font-mono text-xs ${row.value < 0 ? 'text-red-300' : 'text-emerald-300'}`}>{formatCop(row.value)}</span><span className="text-[9px] text-zinc-600">{row.orders} registros</span></span></div>)}{rows.length === 0 && <PanelEmpty>Sin datos de rentabilidad para el corte actual.</PanelEmpty>}</div></ModulePanel>
}

function MiniValue({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 self-center"><p className="text-[9px] text-zinc-600">{label}</p><p className="mt-1 truncate text-[11px] font-medium text-zinc-300">{value}</p></div>
}
