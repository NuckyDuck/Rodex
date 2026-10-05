'use client'

import type { ReactNode } from 'react'
import QRCode from 'qrcode'
import { Bike, CalendarDays, CheckCircle2, Gauge, ShieldCheck, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const history = [
  { date: '04 OCT 2026', km: '24.850 km', title: 'Servicio de mantenimiento', details: ['Cambio de aceite', 'Lubricación de cadena', 'Inspección general'] },
  { date: '18 JUL 2026', km: '22.100 km', title: 'Mantenimiento preventivo', details: ['Cambio de aceite', 'Cambio de filtro'] },
  { date: '02 ABR 2026', km: '19.600 km', title: 'Kit de arrastre', details: ['Cadena', 'Piñón', 'Catalina'] },
]

export default async function RodexIdPage({ params }: { params: Promise<{ rodexId: string }> }) {
  const { rodexId } = await params
  const id = (rodexId.split('=')[1] ?? rodexId).toUpperCase()
  const plate = id === 'RX-004821' ? 'ABC123' : 'ABC123'
  const seed = id.split('').reduce((total, character) => total + character.charCodeAt(0), 0)
  const publicOrigin = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
  const qrDataUrl = await QRCode.toDataURL(`${publicOrigin}/rodexid=${id}`, { margin: 1, width: 260, errorCorrectionLevel: 'H', color: { dark: '#050505', light: '#ffffff' } })

  return <main className="min-h-screen bg-[#080a0b] px-4 py-5 text-zinc-100 sm:px-6 sm:py-8">
    <div className="mx-auto flex max-w-[760px] flex-col gap-4">
      <header className="flex items-center justify-between px-1"><div className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-xl bg-[#ed1c24] text-lg font-black italic">R</div><div className="text-lg font-black tracking-[0.15em]">RODE<span className="text-[#ed1c24]">X</span></div></div><ShieldCheck className="size-5 text-zinc-400" /></header>
      <Card className="overflow-hidden border-zinc-800 bg-[#101314]">
        <div className="border-b border-zinc-800 bg-gradient-to-br from-[#1b2023] via-[#111416] to-[#0b0d0e] p-5 sm:p-7"><div className="text-xs font-semibold tracking-[0.18em] text-zinc-400">RODEX ID</div><div className="mt-1 flex flex-wrap items-center justify-between gap-3"><h1 className="text-4xl font-black tracking-tight sm:text-5xl">{id}</h1><Badge className="gap-1 border-emerald-500/30 bg-emerald-500/15 text-emerald-300"><CheckCircle2 className="size-3" /> Moto verificada</Badge></div></div>
        <CardContent className="flex flex-col gap-6 p-4 sm:p-7">
          <div className="grid gap-4 rounded-2xl border border-zinc-800 bg-[#15191b] p-4 sm:grid-cols-[1fr_190px] sm:items-center"><div className="flex items-center gap-4"><div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-900"><Bike className="size-8 text-zinc-200" /></div><div><h2 className="text-2xl font-bold">Hunk 160 2V</h2><p className="mt-1 text-sm text-zinc-500">Placa: <span className="font-semibold text-zinc-200">{plate}</span></p><p className="mt-1 flex items-center gap-1 text-sm text-zinc-500"><Gauge className="size-4" /> 24.850 km</p></div></div><div className="mx-auto rounded-xl border-4 border-[#ed1c24] bg-white p-2"><img src={qrDataUrl} alt={`Código QR del RODEX ID ${id}`} className="size-36" /></div></div>
          <h2 className="text-2xl font-bold sm:text-3xl">Esta es la historia de tu moto</h2>
          <div className="grid gap-3 sm:grid-cols-3"><InfoCard icon={<Wrench />} label="Último mantenimiento" value="04 OCT 2026" tone="green" /><InfoCard icon={<CalendarDays />} label="Próximo mantenimiento" value="27.000 km" tone="amber" /><InfoCard icon={<ShieldCheck />} label="Servicios registrados" value="18" tone="slate" /></div>
          <section><div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-bold">Historial de mantenimientos</h2><span className="text-xs text-zinc-500">Actualizado hoy</span></div><div className="relative flex flex-col gap-3 pl-4 before:absolute before:bottom-4 before:left-[7px] before:top-4 before:w-px before:bg-zinc-700">{history.map((event, index) => <article key={event.date} className="relative rounded-2xl border border-zinc-800 bg-[#15191b] p-4 pl-6"><span className={`absolute -left-[5px] top-6 size-3 rounded-full border-2 border-[#101314] ${index === 0 ? 'bg-emerald-400' : 'bg-zinc-400'}`} /><div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"><span className="font-semibold text-zinc-200">{event.date}</span><span className="text-zinc-500">{event.km}</span></div><h3 className="mt-2 font-bold">{event.title}</h3><ul className="mt-1 list-disc pl-4 text-sm text-zinc-400">{event.details.map((detail) => <li key={detail}>{detail}</li>)}</ul></article>)}</div></section>
          <section className="rounded-2xl border border-zinc-700 bg-[#15191b] p-4"><h2 className="font-bold">Estado de tu moto</h2><div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-500/70 bg-emerald-500/10 p-3 text-emerald-300"><CheckCircle2 className="size-5" /> <span className="font-semibold">Mantenimiento al día</span></div><div className="mt-2 flex items-center gap-3 rounded-xl border border-amber-500/70 bg-amber-500/10 p-3 text-amber-300"><CalendarDays className="size-5" /> <span className="font-semibold">Próximo mantenimiento en 2.150 km</span></div></section>
        </CardContent>
      </Card>
      <p className="pb-3 text-center text-xs text-zinc-600">Información protegida por RODEX</p>
    </div>
  </main>
}

function InfoCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: 'green' | 'amber' | 'slate' }) {
  const colors = { green: 'text-emerald-300', amber: 'text-amber-300', slate: 'text-zinc-300' }
  return <div className="rounded-2xl border border-zinc-800 bg-[#15191b] p-4"><div className={colors[tone]}>{icon}</div><p className="mt-3 text-xs text-zinc-500">{label}</p><p className="mt-1 font-bold">{value}</p></div>
}
