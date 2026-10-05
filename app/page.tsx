'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  Bike,
  Bell,
  Boxes,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileText,
  Gauge,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plus,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const motorcycles = [
  { id: 'RX-004821', bike: 'Hunk 160 2V', plate: 'ABC123', owner: 'Laura Mendoza', km: '24.850', status: 'En taller', color: 'red' },
  { id: 'RX-004822', bike: 'NKD 125', plate: 'KLM768', owner: 'Daniel Rojas', km: '18.320', status: 'Terminada', color: 'green' },
  { id: 'RX-004823', bike: 'Pulsar NS 200', plate: 'JFT492', owner: 'Santiago Pérez', km: '31.105', status: 'Esperando repuesto', color: 'amber' },
  { id: 'RX-004824', bike: 'Gixxer 150', plate: 'MNP207', owner: 'Valentina Gil', km: '12.480', status: 'Activa', color: 'slate' },
]

const navItems = [
  { label: 'Resumen', icon: LayoutDashboard, active: true },
  { label: 'RODEX IDs', icon: QrCode, count: '128' },
  { label: 'Órdenes de trabajo', icon: ClipboardCheck, count: '12' },
  { label: 'Clientes', icon: Users },
  { label: 'Inventario', icon: Boxes, count: '3' },
]

const history = [
  { date: '04 OCT 2026', km: '24.850 KM', title: 'Cambio de aceite + revisión general', meta: 'Carlos Ramírez · OT-000245', type: 'Mantenimiento' },
  { date: '18 JUL 2026', km: '22.100 KM', title: 'Cambio de aceite y filtro', meta: 'Andrés López · OT-000198', type: 'Mantenimiento' },
  { date: '02 ABR 2026', km: '19.600 KM', title: 'Kit de arrastre', meta: 'Carlos Ramírez · OT-000142', type: 'Reparación' },
]

function Logo() {
  return <div className="flex items-center gap-2.5"><div className="flex size-9 items-center justify-center rounded-xl bg-[#ed1c24] text-lg font-black italic text-white shadow-[0_0_22px_rgba(237,28,36,0.35)]">R</div><div><div className="text-lg font-black tracking-[0.18em] text-white">RODE<span className="text-[#ed1c24]">X</span></div><div className="text-[8px] font-semibold tracking-[0.18em] text-zinc-500">TODO PARA SEGUIR RODANDO</div></div></div>
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = { 'En taller': 'border-red-500/25 bg-red-500/10 text-red-400', Terminada: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400', 'Esperando repuesto': 'border-amber-500/25 bg-amber-500/10 text-amber-400', Activa: 'border-zinc-700 bg-zinc-800 text-zinc-300' }
  return <Badge variant="outline" className={styles[status] ?? ''}>{status}</Badge>
}

function QrPreview() {
  return <div className="relative mx-auto flex aspect-square w-full max-w-[144px] items-center justify-center overflow-hidden rounded-xl border-4 border-[#ed1c24] bg-white p-2"><div className="grid size-full grid-cols-9 grid-rows-9 gap-0.5 bg-white p-1">{Array.from({ length: 81 }).map((_, i) => <span key={i} className={(i * 17 + i * i) % 7 < 3 || [0,1,2,9,11,18,19,20,60,61,62,69,71,78,79,80].includes(i) ? 'bg-black' : 'bg-white'} />)}</div><div className="absolute rounded-md bg-[#ed1c24] px-1.5 py-0.5 text-[8px] font-black text-white">RODEX</div></div>
}

export default function Page() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(motorcycles[0])
  const [showNew, setShowNew] = useState(false)
  const filtered = useMemo(() => motorcycles.filter((m) => `${m.id} ${m.plate} ${m.bike} ${m.owner}`.toLowerCase().includes(query.toLowerCase())), [query])

  return <div className="min-h-screen bg-[#090a0b] text-zinc-100">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[252px] flex-col border-r border-zinc-800/80 bg-[#0d0f10] lg:flex">
      <div className="flex h-[82px] items-center border-b border-zinc-800/80 px-6"><Logo /></div>
      <div className="flex flex-1 flex-col gap-7 px-3 py-6">
        <div><div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Espacio de trabajo</div><div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"><div className="flex size-8 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold">RM</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">RODEX Motorcycles</div><div className="text-[11px] text-zinc-500">Administrador</div></div><ChevronRight className="size-4 text-zinc-600" /></div></div>
        <nav className="flex flex-col gap-1">{navItems.map((item) => <button key={item.label} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${item.active ? 'bg-[#ed1c24]/10 font-semibold text-white' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'}`}><item.icon className={`size-[17px] ${item.active ? 'text-[#ed1c24]' : ''}`} />{item.label}{item.count && <span className="ml-auto rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">{item.count}</span>}</button>)}</nav>
        <div><div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Relación y control</div>{[{ label: 'Fidelización', icon: Sparkles }, { label: 'Reportes', icon: FileText }, { label: 'Configuración', icon: Settings }].map((item) => <button key={item.label} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"><item.icon className="size-[17px]" />{item.label}</button>)}</div>
      </div>
      <div className="border-t border-zinc-800/80 p-4"><div className="flex items-center gap-3"><Avatar className="size-8"><AvatarFallback className="bg-red-500/15 text-xs text-red-400">MR</AvatarFallback></Avatar><div className="flex-1"><div className="text-xs font-semibold">Mariana Ríos</div><div className="text-[10px] text-zinc-600">Administrador</div></div><MoreHorizontal className="size-4 text-zinc-600" /></div></div>
    </aside>

    <main className="lg:pl-[252px]"><header className="sticky top-0 z-10 flex h-[82px] items-center justify-between border-b border-zinc-800/80 bg-[#090a0b]/90 px-5 backdrop-blur-xl sm:px-8"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden"><Menu /></Button><div className="relative hidden w-[340px] sm:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar RODEX ID, placa, cliente..." className="h-10 border-zinc-800 bg-zinc-900/70 pl-10 text-sm placeholder:text-zinc-600" /></div></div><div className="flex items-center gap-3"><button className="relative flex size-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white"><Bell className="size-4" /><span className="absolute right-2 top-1.5 size-1.5 rounded-full bg-[#ed1c24]" /></button><Separator orientation="vertical" className="h-7 bg-zinc-800" /><div className="hidden text-right sm:block"><div className="text-xs font-semibold">Sábado, 04 Oct 2026</div><div className="text-[10px] text-zinc-600">Bogotá, Colombia</div></div><Avatar className="size-9"><AvatarFallback className="bg-zinc-800 text-xs">MR</AvatarFallback></Avatar></div></header>
      <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-500"><span>RODEX /</span><span className="text-zinc-700">Resumen general</span></div><h1 className="text-3xl font-bold tracking-tight">Buenos días, Mariana <span className="text-[#ed1c24]">.</span></h1><p className="mt-1 text-sm text-zinc-500">Aquí tienes el pulso de tu operación hoy.</p></div><Button onClick={() => setShowNew(true)} className="h-10 gap-2 bg-[#ed1c24] font-semibold text-white hover:bg-[#c9151c]"><Plus data-icon="inline-start" /> Registrar motocicleta</Button></div>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: 'Motos atendidas hoy', value: '24', trend: '+12.5%', icon: Bike }, { label: 'En taller ahora', value: '08', trend: '3 esperando', icon: Wrench }, { label: 'Ventas del día', value: '$2.840.000', trend: '+8.2%', icon: ArrowUpRight }, { label: 'Próximos mantenimientos', value: '16', trend: 'esta semana', icon: CalendarDays }].map((item, i) => <Card key={item.label} className="border-zinc-800/80 bg-[#101213]"><CardContent className="flex items-start justify-between p-5"><div><p className="text-xs text-zinc-500">{item.label}</p><p className="mt-2 text-2xl font-bold tracking-tight">{item.value}</p><p className={`mt-2 text-[11px] ${i === 1 || i === 3 ? 'text-zinc-500' : 'text-emerald-400'}`}>{i === 0 || i === 2 ? '↑ ' : ''}{item.trend}</p></div><div className="flex size-9 items-center justify-center rounded-lg bg-zinc-900 text-[#ed1c24]"><item.icon className="size-4" /></div></CardContent></Card>)}</section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.85fr]"><Card className="border-zinc-800/80 bg-[#101213]"><CardHeader className="flex flex-row items-center justify-between pb-3"><div><CardTitle className="text-base">Actividad RODEX ID</CardTitle><p className="mt-1 text-xs text-zinc-500">Seguimiento en tiempo real de tu operación</p></div><Button variant="ghost" size="sm" className="text-xs text-zinc-400">Ver todos <ArrowUpRight data-icon="inline-end" /></Button></CardHeader><CardContent className="p-0"><div className="divide-y divide-zinc-800/70">{filtered.slice(0, 4).map((m) => <button onClick={() => setSelected(m)} key={m.id} className={`flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-zinc-900/70 ${selected.id === m.id ? 'bg-zinc-900/40' : ''}`}><div className="flex size-10 items-center justify-center rounded-xl bg-zinc-900 text-[#ed1c24]"><QrCode className="size-5" /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="font-mono text-xs font-bold text-[#ed1c24]">{m.id}</span><span className="text-xs text-zinc-300">— {m.bike}</span></div><p className="mt-1 text-xs text-zinc-500">{m.owner} · {m.plate} · {m.km} km</p></div><StatusBadge status={m.status} /><ChevronRight className="hidden size-4 text-zinc-700 sm:block" /></button>)}</div></CardContent></Card>
          <Card className="border-zinc-800/80 bg-[#101213]"><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="text-base">Salud del inventario</CardTitle><p className="mt-1 text-xs text-zinc-500">Resumen de existencias</p></div><Boxes className="size-4 text-zinc-600" /></div></CardHeader><CardContent className="flex flex-col gap-5 pt-1"><div><div className="mb-2 flex justify-between text-xs"><span className="text-zinc-400">Stock general</span><span className="font-semibold">82%</span></div><Progress value={82} className="h-1.5 bg-zinc-800 [&>div]:bg-[#ed1c24]" /></div><div className="grid grid-cols-3 gap-2">{[['248','Productos'],['03','Stock bajo'],['12','Por llegar']].map(([value, label]) => <div key={label} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"><div className="text-lg font-bold">{value}</div><div className="mt-1 text-[10px] text-zinc-600">{label}</div></div>)}</div><Button variant="outline" className="w-full border-zinc-700 bg-transparent text-xs text-zinc-300 hover:bg-zinc-800">Gestionar inventario <ArrowUpRight data-icon="inline-end" /></Button></CardContent></Card></div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"><Card className="border-zinc-800/80 bg-[#101213]"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle className="text-base">RODEX ID seleccionado</CardTitle><p className="mt-1 text-xs text-zinc-500">La identidad digital de esta motocicleta</p></div><Badge className="border-red-500/25 bg-red-500/10 font-mono text-[10px] text-red-400">{selected.id}</Badge></CardHeader><CardContent><div className="flex flex-col gap-5 sm:flex-row"><div className="flex flex-1 items-center gap-4"><div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950"><Bike className="size-8 text-zinc-300" /></div><div><h3 className="text-xl font-bold">{selected.bike}</h3><div className="mt-1 flex items-center gap-2 text-xs text-zinc-500"><span>{selected.plate}</span><span className="text-zinc-700">·</span><span>{selected.owner}</span></div><div className="mt-3 flex items-center gap-2"><Badge variant="outline" className="border-zinc-700 text-[10px] text-zinc-400">{selected.km} KM</Badge><StatusBadge status={selected.status} /></div></div></div><div className="hidden w-28 sm:block"><QrPreview /></div></div><Separator className="my-5 bg-zinc-800" /><Tabs defaultValue="historial"><TabsList className="h-9 w-full justify-start gap-1 overflow-x-auto bg-zinc-900/60"><TabsTrigger value="historial" className="text-xs">Historial</TabsTrigger><TabsTrigger value="mantenimientos" className="text-xs">Mantenimientos</TabsTrigger><TabsTrigger value="fotos" className="text-xs">Fotos</TabsTrigger><TabsTrigger value="documentos" className="text-xs">Documentos</TabsTrigger></TabsList><TabsContent value="historial" className="mt-5"><div className="flex flex-col gap-0">{history.map((event, i) => <div key={event.date} className="relative flex gap-4 pb-5"><div className="flex flex-col items-center"><div className={`z-[1] mt-1 size-2.5 rounded-full ${i === 0 ? 'bg-[#ed1c24] shadow-[0_0_0_4px_rgba(237,28,36,0.12)]' : 'bg-zinc-700'}`} />{i < history.length - 1 && <div className="w-px flex-1 bg-zinc-800" />}</div><div className="-mt-1 flex-1"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className="text-[10px] font-bold tracking-widest text-zinc-500">{event.date}</span><span className="font-mono text-[10px] text-[#ed1c24]">{event.km}</span><Badge variant="outline" className="border-zinc-800 text-[9px] text-zinc-500">{event.type}</Badge></div><p className="mt-2 text-sm font-semibold">{event.title}</p><p className="mt-1 text-xs text-zinc-600">{event.meta}</p></div></div>)}</div></TabsContent><TabsContent value="mantenimientos" className="mt-5"><div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">Próximo servicio recomendado a los <span className="font-semibold text-white">27.000 KM</span>.</div></TabsContent><TabsContent value="fotos" className="mt-5"><div className="grid grid-cols-3 gap-2"><div className="aspect-video rounded-lg bg-zinc-800" /><div className="aspect-video rounded-lg bg-zinc-800" /><div className="aspect-video rounded-lg bg-zinc-800" /></div></TabsContent><TabsContent value="documentos" className="mt-5"><div className="text-sm text-zinc-500">3 documentos asociados a este RODEX ID.</div></TabsContent></Tabs></CardContent></Card>
          <div className="flex flex-col gap-6"><Card className="overflow-hidden border-0 bg-[#ed1c24] text-white"><CardContent className="relative p-6"><div className="absolute -right-8 -top-10 size-36 rounded-full border-[20px] border-white/10" /><div className="relative"><div className="mb-5 flex items-center justify-between"><div className="flex size-9 items-center justify-center rounded-lg bg-black/15"><ShieldCheck className="size-5" /></div><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Mantenimiento preventivo</span></div><div className="text-3xl font-black">1.200 <span className="text-lg">km</span></div><p className="mt-1 text-sm text-white/75">para el próximo cambio de aceite</p><div className="mt-5 h-1.5 rounded-full bg-black/15"><div className="h-full w-[68%] rounded-full bg-white" /></div><div className="mt-2 flex justify-between text-[10px] text-white/70"><span>24.850 km actual</span><span>27.000 km recomendado</span></div></div></CardContent></Card><Card className="border-zinc-800/80 bg-[#101213]"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-base">Órdenes recientes</CardTitle><Clock3 className="size-4 text-zinc-600" /></CardHeader><CardContent className="flex flex-col gap-3">{[['OT-000245','Cambio de aceite','En diagnóstico'],['OT-000244','Kit de arrastre','Terminado'],['OT-000243','Revisión general','Esperando aprobación']].map(([id, title, status]) => <div key={id} className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-500"><ClipboardCheck className="size-4" /></div><div className="min-w-0 flex-1"><div className="font-mono text-[10px] text-[#ed1c24]">{id}</div><div className="truncate text-xs font-medium">{title}</div></div><span className="text-[10px] text-zinc-600">{status}</span></div>)}</CardContent></Card></div></div>
      </div></main>

    {showNew && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#111314] shadow-2xl"><div className="flex items-center justify-between border-b border-zinc-800 p-6"><div><h2 className="text-lg font-bold">Registrar motocicleta</h2><p className="mt-1 text-xs text-zinc-500">Crea un expediente y genera su RODEX ID único.</p></div><Button variant="ghost" size="icon" onClick={() => setShowNew(false)}><X /></Button></div><div className="grid gap-4 p-6 sm:grid-cols-2"><label className="text-xs text-zinc-400">Placa<Input className="mt-2 border-zinc-800 bg-zinc-900" placeholder="ABC123" /></label><label className="text-xs text-zinc-400">Marca y modelo<Input className="mt-2 border-zinc-800 bg-zinc-900" placeholder="Hunk 160 2V" /></label><label className="text-xs text-zinc-400">Kilometraje<Input className="mt-2 border-zinc-800 bg-zinc-900" placeholder="0 km" /></label><label className="text-xs text-zinc-400">Propietario<Input className="mt-2 border-zinc-800 bg-zinc-900" placeholder="Nombre completo" /></label></div><div className="flex items-center justify-between border-t border-zinc-800 p-6"><div className="flex items-center gap-2 text-xs text-zinc-500"><QrCode className="size-4 text-[#ed1c24]" /> Se generará el QR automáticamente</div><Button onClick={() => setShowNew(false)} className="bg-[#ed1c24] text-white hover:bg-[#c9151c]">Crear RODEX ID <ArrowUpRight data-icon="inline-end" /></Button></div></div></div>}
  </div>
}
