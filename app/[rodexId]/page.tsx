'use client'

import Link from 'next/link'
import { ArrowLeft, Bike, CalendarDays, ShieldCheck, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function RodexIdPage({ params }: { params: Promise<{ rodexId: string }> }) {
  const { rodexId } = await params
  const plate = (rodexId.split('=')[1] ?? rodexId).toUpperCase()

  return <main className="min-h-screen bg-[#090a0b] px-5 py-8 text-zinc-100 sm:px-8">
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link href="/" className="flex w-fit items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="size-4" /> Volver al panel</Link>
      <Card className="overflow-hidden border-zinc-800 bg-[#101213]">
        <div className="bg-[#ed1c24] px-6 py-8 sm:px-10"><div className="text-xs font-bold tracking-[0.2em] text-white/70">RODEX ID DIGITAL</div><h1 className="mt-3 text-4xl font-black tracking-tight">{plate}</h1><p className="mt-2 text-sm text-white/80">Historial y trazabilidad de tu motocicleta.</p></div>
        <CardContent className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-10"><div><div className="flex items-center gap-4"><div className="flex size-16 items-center justify-center rounded-2xl bg-zinc-900"><Bike className="size-8 text-[#ed1c24]" /></div><div><h2 className="text-2xl font-bold">Hunk 160 2V</h2><p className="mt-1 text-sm text-zinc-500">Propietaria: Laura Mendoza</p></div></div><div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-zinc-800 p-4"><Wrench className="size-4 text-[#ed1c24]" /><p className="mt-3 text-xs text-zinc-500">Estado</p><p className="mt-1 text-sm font-semibold">En taller</p></div><div className="rounded-xl border border-zinc-800 p-4"><CalendarDays className="size-4 text-[#ed1c24]" /><p className="mt-3 text-xs text-zinc-500">Último servicio</p><p className="mt-1 text-sm font-semibold">04 Oct 2026</p></div><div className="rounded-xl border border-zinc-800 p-4"><ShieldCheck className="size-4 text-[#ed1c24]" /><p className="mt-3 text-xs text-zinc-500">Kilometraje</p><p className="mt-1 text-sm font-semibold">24.850 km</p></div></div></div><div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"><div className="grid size-36 grid-cols-9 grid-rows-9 gap-0.5 bg-white p-2">{Array.from({ length: 81 }).map((_, i) => <span key={i} className={(i * 17 + i * i) % 7 < 3 ? 'bg-black' : 'bg-white'} />)}</div><Badge className="mt-3 bg-[#ed1c24] text-white">RODEX ID verificado</Badge></div></CardContent>
      </Card>
    </div>
  </main>
}
