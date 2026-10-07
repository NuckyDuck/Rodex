'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, BadgeCheck, Bike, Check, Clock3, Coins, Gift, Plus, QrCode, Search, ShieldCheck, Sparkles, Star, TicketCheck, TrendingUp, UsersRound, Wrench, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { makeDemoId, formatNumber, useRodexDemo, DEMO_TODAY } from '@/components/rodex-demo-state'
import { DemoNotice, MetricCard, ModulePanel, PanelEmpty, PrimaryAction, RODEX_CARD, RODEX_FIELD, SectionLabel, StatusPill } from '@/components/rodex-shared'
import type { LoyaltyMember, PointMovement, Referral } from '@/app/rodex-demo-store'

const loyaltyTabs = [
  { id: 'programa', label: 'Programa' },
  { id: 'puntos', label: 'Puntos' },
  { id: 'referidos', label: 'Referidos' },
  { id: 'recompensas', label: 'Recompensas' },
] as const

function getTier(member: LoyaltyMember, tiers: ReturnType<typeof useRodexDemo>['demo']['settings']['loyalty']['tiers']) {
  return [...tiers].filter((tier) => tier.active && tier.minimumPoints <= member.points).sort((a, b) => b.minimumPoints - a.minimumPoints)[0] ?? tiers[0]
}

function countValidReferrals(referrals: Referral[], customer: string) {
  return referrals.filter((referral) => referral.referrer === customer && !referral.canceled && Boolean(referral.orderId)).length
}

function getReferralStatus(referral: Referral) {
  if (referral.canceled) return 'Cancelado'
  if (!referral.orderId) return 'Pendiente'
  return 'Validado'
}

export function RodexLoyaltyModule() {
  const { demo, updateDemo } = useRodexDemo()
  const [query, setQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState('Laura Mendoza')
  const [showReferralForm, setShowReferralForm] = useState(false)
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false)
  const [feedback, setFeedback] = useState('')
  const members = demo.loyalty.members
  const tiers = demo.settings.loyalty.tiers
  const rewards = demo.settings.loyalty.rewards.filter((reward) => reward.active)
  const selectedMember = members.find((member) => member.customer === selectedCustomer) ?? members[0]
  const selectedTier = selectedMember ? getTier(selectedMember, tiers) : tiers[0]
  const nextTier = selectedMember ? [...tiers].filter((tier) => tier.active && tier.minimumPoints > selectedTier.minimumPoints).sort((a, b) => a.minimumPoints - b.minimumPoints)[0] : undefined
  const activeCount = members.filter((member) => member.active).length
  const newMemberCount = members.filter((member) => member.joinedAt?.slice(0, 7) === DEMO_TODAY.slice(0, 7)).length
  const issuedPoints = members.reduce((total, member) => total + member.earnedPoints, 0)
  const redeemedPoints = members.reduce((total, member) => total + member.redeemedPoints, 0)
  const validReferrals = demo.loyalty.referrals.filter((referral) => !referral.canceled && Boolean(referral.orderId)).length
  const filteredMembers = useMemo(() => members.filter((member) => `${member.customer} ${member.motorcycleIds.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [members, query])
  const nextLevelProgress = selectedMember && nextTier
    ? Math.min(100, Math.round(((selectedMember.points - selectedTier.minimumPoints) / Math.max(1, nextTier.minimumPoints - selectedTier.minimumPoints)) * 100))
    : 100
  const referralsForCustomer = demo.loyalty.referrals.filter((referral) => referral.referrer === selectedCustomer && !referral.canceled && Boolean(referral.orderId)).length
  const approachingLevel = members.filter((member) => {
    const currentTier = getTier(member, tiers)
    const next = [...tiers].filter((tier) => tier.active && tier.minimumPoints > currentTier.minimumPoints).sort((a, b) => a.minimumPoints - b.minimumPoints)[0]
    return next ? next.minimumPoints - member.points <= 600 : false
  })
  const inactiveMembers = members.filter((member) => member.lastVisit < '2026-08-15')
  const closerToReward = members.filter((member) => rewards.some((reward) => member.points < reward.points && reward.points - member.points <= 250))

  function addReferral(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const referral: Referral = {
      id: makeDemoId('ref'),
      referrer: String(form.get('referrer')),
      referred: String(form.get('referred')).trim(),
      email: String(form.get('email')).trim(),
      phone: String(form.get('phone')).trim(),
      date: DEMO_TODAY,
    }
    updateDemo((current) => ({ ...current, loyalty: { ...current.loyalty, referrals: [referral, ...current.loyalty.referrals] } }))
    setSelectedCustomer(referral.referrer)
    setShowReferralForm(false)
    setFeedback('Referido registrado. Se validará cuando complete y pague una orden elegible.')
  }

  function addPointAdjustment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const customer = String(form.get('customer'))
    const amount = Number(form.get('amount'))
    const direction = String(form.get('direction'))
    const concept = String(form.get('concept')).trim()
    const member = members.find((item) => item.customer === customer)
    const signedAmount = direction === 'Restar' ? -Math.abs(amount) : Math.abs(amount)
    if (!member || !Number.isInteger(amount) || amount <= 0 || member.points + signedAmount < 0 || !concept) {
      setFeedback('Revisa el cliente, la cantidad y el concepto del ajuste.')
      return
    }
    const movement: PointMovement = { id: makeDemoId('pts'), date: DEMO_TODAY, customer, concept, orderId: '—', amount: signedAmount, type: 'Ajuste' }
    updateDemo((current) => ({
      ...current,
      loyalty: {
        ...current.loyalty,
        members: current.loyalty.members.map((item) => item.customer === customer ? { ...item, points: item.points + signedAmount } : item),
        ledger: [movement, ...current.loyalty.ledger],
      },
    }))
    setShowAdjustmentForm(false)
    setFeedback(`Ajuste de ${formatNumber(signedAmount)} puntos aplicado a ${customer}.`)
  }

  function redeemReward(rewardId: string) {
    const member = members.find((item) => item.customer === selectedCustomer)
    const reward = rewards.find((item) => item.id === rewardId)
    if (!member || !reward) return
    if (member.points < reward.points) {
      setFeedback(`${member.customer} necesita ${formatNumber(reward.points - member.points)} puntos más para esta recompensa.`)
      return
    }
    if (reward.available <= 0) {
      setFeedback('Esta recompensa no tiene disponibilidad en el demo.')
      return
    }
    const claim = { id: makeDemoId('claim'), customer: member.customer, rewardId: reward.id, date: DEMO_TODAY, orderId: 'Por asociar a próxima OT', status: 'Recompensa disponible' as const }
    const movement: PointMovement = { id: makeDemoId('pts'), date: DEMO_TODAY, customer: member.customer, concept: `Redención: ${reward.name}`, orderId: 'Por asociar a próxima OT', amount: -reward.points, type: 'Redimido' }
    updateDemo((current) => ({
      ...current,
      loyalty: {
        ...current.loyalty,
        members: current.loyalty.members.map((item) => item.customer === member.customer ? { ...item, points: item.points - reward.points, redeemedPoints: item.redeemedPoints + reward.points } : item),
        ledger: [movement, ...current.loyalty.ledger],
        claims: [claim, ...current.loyalty.claims],
      },
      settings: {
        ...current.settings,
        loyalty: { ...current.settings.loyalty, rewards: current.settings.loyalty.rewards.map((item) => item.id === reward.id ? { ...item, available: Math.max(0, item.available - 1) } : item) },
      },
    }))
    setFeedback(`${reward.name} quedó disponible para asociar a una orden de trabajo.`)
  }

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <DemoNotice>Los puntos salen de servicios y compras vinculados a una OT pagada. Los cambios del demo se conservan durante esta sesión y no sustituyen la validación real del taller.</DemoNotice>
      <Tabs defaultValue="programa" className="gap-5">
        <TabsList className="rodex-tab-strip flex h-auto w-full flex-nowrap justify-start gap-1 overflow-x-auto overflow-y-hidden rounded-xl border border-zinc-800 bg-[#101213] p-1 sm:w-fit md:flex-wrap md:overflow-x-visible md:overflow-y-visible">
          {loyaltyTabs.map((tab) => <TabsTrigger key={tab.id} value={tab.id} className="min-h-9 flex-none px-3 text-xs">{tab.label}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="programa" className="flex flex-col gap-5">
          <Card className="overflow-hidden border-zinc-800/80 bg-gradient-to-br from-[#17191b] via-[#101213] to-[#241012]">
            <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-[#ed1c24]/15 text-[#ed1c24]"><Sparkles className="size-4" /></span><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ed1c24]">RODEX en ruta</p><Badge variant="outline" className="border-zinc-700 bg-black/20 text-[10px] text-zinc-400">Servicios + RODEX ID</Badge></div>
                <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">Cada visita suma al historial y a sus beneficios.</h2>
                <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-400 sm:text-sm">Acumula puntos al cerrar y pagar una orden. Vincula los beneficios con la motocicleta registrada, el servicio y la siguiente visita al taller.</p>
              </div>
              <div className="w-full shrink-0 rounded-xl border border-zinc-800 bg-black/20 p-4 sm:max-w-[220px]">
                <div className="flex items-center justify-between text-xs"><span className="text-zinc-400">Referidos de Laura</span><span className="font-mono font-bold text-white">{countValidReferrals(demo.loyalty.referrals, 'Laura Mendoza')} / {demo.settings.loyalty.oilReferralThreshold}</span></div>
                <Progress value={Math.min(100, countValidReferrals(demo.loyalty.referrals, 'Laura Mendoza') / demo.settings.loyalty.oilReferralThreshold * 100)} className="mt-3 w-full [&_[data-slot=progress-indicator]]:bg-[#ed1c24]" />
                <p className="mt-2 text-[11px] leading-4 text-zinc-500">{Math.max(0, demo.settings.loyalty.oilReferralThreshold - countValidReferrals(demo.loyalty.referrals, 'Laura Mendoza'))} referidos válidos para un cambio de aceite.</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricCard label="Clientes inscritos" value={formatNumber(members.length)} detail="Con perfil de fidelización RODEX" icon={UsersRound} />
            <MetricCard label="Clientes activos" value={formatNumber(activeCount)} detail={`${newMemberCount} alta${newMemberCount === 1 ? '' : 's'} nueva${newMemberCount === 1 ? '' : 's'} en octubre`} icon={BadgeCheck} />
            <MetricCard label="Puntos emitidos" value={formatNumber(issuedPoints)} detail={`${formatNumber(redeemedPoints)} puntos redimidos en total`} icon={Coins} />
            <MetricCard label="Recompensas entregadas" value={formatNumber(demo.loyalty.claims.filter((claim) => claim.status === 'Recompensa utilizada').length)} detail={`${validReferrals} referidos validados`} icon={Gift} accent />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <ModulePanel title="Atención que impulsa la recurrencia" description="Señales operativas basadas en visitas, saldo y niveles del programa.">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3"><Clock3 className="mt-0.5 size-4 shrink-0 text-amber-300" /><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-zinc-200">Visitas por recuperar</p><p className="mt-1 text-[11px] leading-4 text-zinc-500">{inactiveMembers.length ? inactiveMembers.map((member) => member.customer).join(', ') : 'No hay clientes en riesgo de volver.'} · revisar última OT y kilometraje.</p></div><Badge variant="outline" className="border-amber-500/25 text-amber-300">{inactiveMembers.length}</Badge></div>
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"><TrendingUp className="mt-0.5 size-4 shrink-0 text-emerald-300" /><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-zinc-200">Próximos a subir de nivel</p><p className="mt-1 text-[11px] leading-4 text-zinc-500">{approachingLevel.map((member) => `${member.customer} · ${formatNumber(Math.max(0, (tiers.find((tier) => tier.minimumPoints > getTier(member, tiers).minimumPoints)?.minimumPoints ?? member.points) - member.points))} pts`).join(' · ') || 'Sin cambios de nivel próximos.'}</p></div><Badge variant="outline" className="border-emerald-500/25 text-emerald-300">{approachingLevel.length}</Badge></div>
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"><TicketCheck className="mt-0.5 size-4 shrink-0 text-[#ed1c24]" /><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-zinc-200">Cerca de una recompensa</p><p className="mt-1 text-[11px] leading-4 text-zinc-500">{closerToReward.map((member) => member.customer).join(', ') || 'Sin saldos cerca del siguiente canje.'} · saldo validado en la ficha del cliente.</p></div><Badge variant="outline" className="border-red-500/25 text-red-300">{closerToReward.length}</Badge></div>
              </div>
            </ModulePanel>
            <ModulePanel title="Niveles RODEX" description="Beneficios activados al cruzar puntos obtenidos en órdenes pagadas.">
              <div className="grid gap-2 sm:grid-cols-2">
                {tiers.map((tier, index) => {
                  const count = members.filter((member) => getTier(member, tiers).id === tier.id).length
                  return <div key={tier.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                    <div className="flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${index > 1 ? 'bg-[#ed1c24]/10 text-[#ed1c24]' : 'bg-zinc-800 text-zinc-300'}`}>{index === 3 ? <ShieldCheck className="size-3.5" /> : <Star className="size-3.5" />}</span><p className="truncate text-xs font-semibold">{tier.name}</p></div><Badge variant="outline" className="border-zinc-700 text-[10px] text-zinc-400">{formatNumber(tier.minimumPoints)}+</Badge></div>
                    <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-zinc-500">{tier.benefits}</p>
                    <p className="mt-2 text-[10px] text-zinc-600">{count} cliente{count === 1 ? '' : 's'} · {tier.active ? 'Activo' : 'Inactivo'}</p>
                  </div>
                })}
              </div>
            </ModulePanel>
          </div>

          <ModulePanel title="Clientes y motocicletas vinculadas" description="Puntos, nivel y RODEX ID en la misma vista del propietario." action={<div className="relative w-36 sm:w-48"><Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-600" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cliente o RODEX ID" className="h-8 border-zinc-800 bg-zinc-950 pl-8 text-xs" /></div>}>
            <div className="flex flex-col gap-2">
              {filteredMembers.map((member) => {
                const tier = getTier(member, tiers)
                const next = [...tiers].filter((item) => item.active && item.minimumPoints > tier.minimumPoints).sort((a, b) => a.minimumPoints - b.minimumPoints)[0]
                const progress = next ? Math.min(100, Math.round(((member.points - tier.minimumPoints) / Math.max(1, next.minimumPoints - tier.minimumPoints)) * 100)) : 100
                return <button key={member.customer} type="button" onClick={() => setSelectedCustomer(member.customer)} className={`flex w-full flex-col gap-3 rounded-xl border p-3 text-left transition sm:flex-row sm:items-center ${selectedCustomer === member.customer ? 'border-[#ed1c24]/45 bg-[#ed1c24]/[0.04]' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'}`}>
                  <div className="flex min-w-0 flex-1 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-200">{member.customer.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div className="min-w-0"><p className="truncate text-xs font-semibold text-zinc-100">{member.customer}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-zinc-500"><QrCode className="size-3" />{member.motorcycleIds.join(' · ') || 'Sin RODEX ID asociado'}</p></div></div>
                  <div className="grid w-full grid-cols-2 items-center gap-x-4 gap-y-1 sm:w-[240px]"><div className="flex items-center justify-between gap-2"><span className="text-[10px] text-zinc-500">{tier.name}</span><span className="font-mono text-xs font-semibold">{formatNumber(member.points)} pts</span></div><Progress value={progress} className="col-span-2 w-full [&_[data-slot=progress-indicator]]:bg-[#ed1c24]" /><span className="col-span-2 text-[10px] text-zinc-600">{next ? `${formatNumber(next.minimumPoints - member.points)} puntos para ${next.name}` : 'Nivel máximo'}</span></div>
                  <ArrowRight className="hidden size-4 shrink-0 text-zinc-600 sm:block" />
                </button>
              })}
              {filteredMembers.length === 0 && <PanelEmpty>No hay clientes con esa búsqueda.</PanelEmpty>}
            </div>
          </ModulePanel>
          {selectedMember && <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <ModulePanel title={`Perfil RODEX · ${selectedMember.customer}`} description="Resumen de fidelización conectado con la ficha técnica del vehículo.">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"><SectionLabel>Saldo</SectionLabel><p className="mt-1 text-sm font-bold">{formatNumber(selectedMember.points)} pts</p></div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"><SectionLabel>Nivel</SectionLabel><p className="mt-1 truncate text-sm font-bold">{selectedTier.name}</p></div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"><SectionLabel>Visitas</SectionLabel><p className="mt-1 text-sm font-bold">{selectedMember.visitCount}</p></div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"><SectionLabel>Referidos</SectionLabel><p className="mt-1 text-sm font-bold">{referralsForCustomer}</p></div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">{selectedMember.motorcycleIds.map((id) => <Badge key={id} variant="outline" className="border-zinc-700 text-zinc-300"><Bike data-icon="inline-start" /> {id}</Badge>)}</div>
              {nextTier && <div className="mt-4"><div className="mb-2 flex justify-between text-[11px]"><span className="text-zinc-400">Progreso a {nextTier.name}</span><span className="font-mono text-zinc-300">{formatNumber(nextTier.minimumPoints - selectedMember.points)} pts restantes</span></div><Progress value={nextLevelProgress} className="w-full [&_[data-slot=progress-indicator]]:bg-[#ed1c24]" /></div>}
            </ModulePanel>
            <ModulePanel title="Actividad reciente" description="Movimientos trazables a órdenes o ajustes registrados.">
              <div className="flex flex-col gap-2">
                {demo.loyalty.ledger.filter((entry) => entry.customer === selectedMember.customer).slice(0, 4).map((entry) => <div key={entry.id} className="flex min-w-0 items-center gap-3 rounded-lg border border-zinc-800/80 bg-zinc-900/30 px-3 py-2.5"><span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${entry.amount < 0 ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{entry.amount < 0 ? <Gift className="size-3.5" /> : <Wrench className="size-3.5" />}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{entry.concept}</p><p className="mt-1 truncate text-[10px] text-zinc-600">{entry.date} · {entry.orderId}</p></div><span className={`shrink-0 font-mono text-xs ${entry.amount < 0 ? 'text-amber-300' : 'text-emerald-300'}`}>{entry.amount > 0 ? '+' : ''}{formatNumber(entry.amount)}</span></div>)}
                {demo.loyalty.ledger.filter((entry) => entry.customer === selectedMember.customer).length === 0 && <PanelEmpty>Este cliente todavía no tiene movimientos.</PanelEmpty>}
              </div>
            </ModulePanel>
          </div>}
        </TabsContent>

        <TabsContent value="puntos" className="flex flex-col gap-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold">Libro de puntos</p><p className="mt-1 text-xs text-zinc-500">Cada movimiento debe tener cliente y OT, salvo ajustes manuales auditados.</p></div><Button type="button" onClick={() => { setShowAdjustmentForm((value) => !value); setFeedback('') }} variant="outline" className="h-9 border-zinc-700 text-xs"><Plus data-icon="inline-start" /> Ajuste manual</Button></div>
          {showAdjustmentForm && <Card className={RODEX_CARD}><CardHeader><CardTitle className="text-sm">Registrar ajuste de puntos</CardTitle></CardHeader><CardContent><form onSubmit={addPointAdjustment} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><label className="text-[11px] text-zinc-400">Cliente<select name="customer" defaultValue={selectedCustomer} className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200">{members.map((member) => <option key={member.customer}>{member.customer}</option>)}</select></label><label className="text-[11px] text-zinc-400">Movimiento<select name="direction" className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200"><option>Sumar</option><option>Restar</option></select></label><label className="text-[11px] text-zinc-400">Puntos<Input name="amount" type="number" min="1" step="1" required className={RODEX_FIELD} /></label><label className="text-[11px] text-zinc-400">Concepto<Input name="concept" required placeholder="Motivo del ajuste" className={RODEX_FIELD} /></label><div className="flex flex-wrap items-center gap-2 sm:col-span-2 xl:col-span-4"><PrimaryAction type="submit"><Check data-icon="inline-start" /> Aplicar ajuste</PrimaryAction><Button type="button" variant="ghost" onClick={() => setShowAdjustmentForm(false)} className="h-9 text-xs text-zinc-400">Cancelar</Button></div></form></CardContent></Card>}
          <ModulePanel title="Movimientos recientes" description="Ganado, redimido y ajustado con trazabilidad por cliente y orden.">
            <div className="flex flex-col gap-2">
              {demo.loyalty.ledger.map((entry) => <div key={entry.id} className="grid min-w-0 grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 sm:grid-cols-[115px_1fr_150px_105px_90px]"><span className="text-[10px] text-zinc-500">{entry.date}</span><div className="min-w-0"><p className="truncate text-xs font-semibold">{entry.customer}</p><p className="truncate text-[10px] text-zinc-500">{entry.concept}</p></div><span className="text-[10px] text-zinc-500">{entry.orderId}</span><StatusPill status={entry.type} /><span className={`text-right font-mono text-xs ${entry.amount < 0 ? 'text-amber-300' : 'text-emerald-300'}`}>{entry.amount > 0 ? '+' : ''}{formatNumber(entry.amount)}</span></div>)}
              {demo.loyalty.ledger.length === 0 && <PanelEmpty>No hay movimientos de puntos.</PanelEmpty>}
            </div>
          </ModulePanel>
          <div className="grid gap-3 sm:grid-cols-3"><MetricCard label="Puntos disponibles" value={formatNumber(members.reduce((total, member) => total + member.points, 0))} detail="Saldo de todos los perfiles activos" icon={Coins} accent /><MetricCard label="Puntos ganados" value={formatNumber(issuedPoints)} detail="Servicios, compras y campañas" icon={TrendingUp} /><MetricCard label="Puntos utilizados" value={formatNumber(redeemedPoints)} detail="Canjes descontados de saldo" icon={TicketCheck} /></div>
        </TabsContent>

        <TabsContent value="referidos" className="flex flex-col gap-5">
          <Card className="border-zinc-800/80 bg-gradient-to-r from-[#1b1112] via-[#111314] to-[#101213]"><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ed1c24]">Referidos que ruedan</p><h2 className="mt-2 text-xl font-bold">Premia recomendaciones que sí llegaron al taller.</h2><p className="mt-2 text-xs leading-5 text-zinc-400">Solo cuentan cuando el referido completa y paga un servicio elegible. La validación queda ligada a su primera OT pagada.</p></div><Button type="button" onClick={() => { setShowReferralForm((value) => !value); setFeedback('') }} className="h-9 shrink-0 bg-[#ed1c24] text-xs text-white hover:bg-[#c9151c]"><Plus data-icon="inline-start" /> Registrar referido</Button></CardContent></Card>
          <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-zinc-800 bg-[#101213] p-4"><div className="flex items-center justify-between gap-3"><div><SectionLabel>Meta de servicio</SectionLabel><p className="mt-1 text-sm font-semibold">Cambio de aceite gratis</p></div><Badge variant="outline" className="border-[#ed1c24]/30 text-[#ed1c24]">{demo.settings.loyalty.oilReferralThreshold} válidos</Badge></div><p className="mt-3 text-[11px] text-zinc-500">{countValidReferrals(demo.loyalty.referrals, selectedCustomer)} de {demo.settings.loyalty.oilReferralThreshold} para {selectedCustomer}</p><Progress value={Math.min(100, countValidReferrals(demo.loyalty.referrals, selectedCustomer) / demo.settings.loyalty.oilReferralThreshold * 100)} className="mt-2 w-full [&_[data-slot=progress-indicator]]:bg-[#ed1c24]" /><p className="mt-2 text-[10px] text-zinc-600">{Math.max(0, demo.settings.loyalty.oilReferralThreshold - countValidReferrals(demo.loyalty.referrals, selectedCustomer))} referidos válidos restantes</p></div><div className="rounded-xl border border-zinc-800 bg-[#101213] p-4"><div className="flex items-center justify-between gap-3"><div><SectionLabel>Meta de comunidad</SectionLabel><p className="mt-1 text-sm font-semibold">Kit de mantenimiento de cadena</p></div><Badge variant="outline" className="border-amber-500/30 text-amber-300">{demo.settings.loyalty.chainKitReferralThreshold} válidos</Badge></div><p className="mt-3 text-[11px] text-zinc-500">{countValidReferrals(demo.loyalty.referrals, selectedCustomer)} de {demo.settings.loyalty.chainKitReferralThreshold} referidos válidos</p><Progress value={Math.min(100, countValidReferrals(demo.loyalty.referrals, selectedCustomer) / demo.settings.loyalty.chainKitReferralThreshold * 100)} className="mt-2 w-full [&_[data-slot=progress-indicator]]:bg-amber-400" /><p className="mt-2 text-[10px] text-zinc-600">Las metas iniciales de RODEX se mantienen en 5 y 15 referidos.</p></div></div>
          {showReferralForm && <Card className={RODEX_CARD}><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-sm">Nuevo referido</CardTitle><Button type="button" variant="ghost" size="icon" onClick={() => setShowReferralForm(false)} aria-label="Cerrar formulario"><X /></Button></div></CardHeader><CardContent><form onSubmit={addReferral} className="grid gap-3 sm:grid-cols-2"><label className="text-[11px] text-zinc-400">Cliente que refiere<select name="referrer" defaultValue={selectedCustomer} className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200">{members.map((member) => <option key={member.customer}>{member.customer}</option>)}</select></label><label className="text-[11px] text-zinc-400">Nombre de la persona referida<Input name="referred" required placeholder="Nombre y apellido" className={RODEX_FIELD} /></label><label className="text-[11px] text-zinc-400">Correo electrónico<Input name="email" type="email" required placeholder="persona@correo.co" className={RODEX_FIELD} /></label><label className="text-[11px] text-zinc-400">Teléfono<Input name="phone" type="tel" required placeholder="+57 300 000 0000" className={RODEX_FIELD} /></label><p className="text-[11px] leading-5 text-zinc-500 sm:col-span-2">El registro inicia como pendiente. Solo una OT pagada valida el referido y habilita el beneficio.</p><div className="flex flex-wrap gap-2 sm:col-span-2"><PrimaryAction type="submit"><Check data-icon="inline-start" /> Crear referido</PrimaryAction><Button type="button" variant="outline" onClick={() => setShowReferralForm(false)} className="h-9 border-zinc-700 text-xs">Cancelar</Button></div></form></CardContent></Card>}
          <ModulePanel title="Trazabilidad de referidos" description="Pendiente hasta que la persona complete y pague un servicio elegible.">
            <div className="flex flex-col gap-2">{demo.loyalty.referrals.map((referral) => <div key={referral.id} className="grid min-w-0 grid-cols-1 gap-2 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 sm:grid-cols-[1fr_1fr_110px_130px]"><div className="min-w-0"><p className="truncate text-xs font-semibold">{referral.referred}</p><p className="mt-1 truncate text-[10px] text-zinc-500">{referral.email || 'Contacto pendiente'} · invita {referral.referrer}</p></div><span className="self-center text-[10px] text-zinc-500">{referral.orderId ? `OT ${referral.orderId}` : 'Esperando primera OT pagada'}</span><span className="self-center text-[10px] text-zinc-500">{referral.date}</span><span className="self-center"><StatusPill status={getReferralStatus(referral)} /></span></div>)}{demo.loyalty.referrals.length === 0 && <PanelEmpty>Aún no hay referidos. Registra uno para iniciar su trazabilidad.</PanelEmpty>}</div>
          </ModulePanel>
        </TabsContent>

        <TabsContent value="recompensas" className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-[#101213] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">Catálogo de beneficios RODEX</p><p className="mt-1 text-xs text-zinc-500">La reserva se asocia a la siguiente OT y descuenta puntos del saldo.</p></div><label className="flex items-center gap-2 text-[11px] text-zinc-400">Canjear para<select value={selectedCustomer} onChange={(event) => setSelectedCustomer(event.target.value)} className="h-9 max-w-[180px] rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-200">{members.map((member) => <option key={member.customer}>{member.customer}</option>)}</select></label></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{rewards.map((reward) => {
            const canRedeem = Boolean(selectedMember && selectedMember.points >= reward.points && reward.available > 0)
            return <Card key={reward.id} className={`${RODEX_CARD} flex flex-col`}><CardHeader className="flex-row items-start justify-between gap-3 space-y-0"><div className="flex size-9 items-center justify-center rounded-xl border border-[#ed1c24]/20 bg-[#ed1c24]/10 text-[#ed1c24]"><Gift className="size-4" /></div><Badge variant="outline" className="border-zinc-700 text-[10px] text-zinc-400">{reward.available} disp.</Badge></CardHeader><CardContent className="flex flex-1 flex-col"><h3 className="text-sm font-semibold">{reward.name}</h3><p className="mt-1 min-h-10 text-xs leading-5 text-zinc-500">{reward.description}</p><Separator className="my-3 bg-zinc-800" /><p className="text-[10px] leading-4 text-zinc-600">{reward.conditions}</p><div className="mt-auto flex items-center justify-between gap-3 pt-4"><span className="font-mono text-sm font-bold text-zinc-100">{formatNumber(reward.points)} pts</span><Button type="button" size="sm" disabled={!canRedeem} onClick={() => redeemReward(reward.id)} className="bg-[#ed1c24] text-white hover:bg-[#c9151c]">{canRedeem ? 'Reservar' : reward.available <= 0 ? 'Agotada' : 'Saldo insuficiente'}</Button></div></CardContent></Card>
          })}</div>
          <ModulePanel title="Recompensas reservadas" description="Se completan al registrar la redención en una orden de trabajo.">
            <div className="flex flex-col gap-2">{demo.loyalty.claims.map((claim) => {
              const reward = demo.settings.loyalty.rewards.find((item) => item.id === claim.rewardId)
              return <div key={claim.id} className="grid grid-cols-1 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 sm:grid-cols-[1fr_1fr_160px_150px]"><div><p className="text-xs font-semibold">{reward?.name ?? claim.rewardId}</p><p className="mt-1 text-[10px] text-zinc-500">{claim.customer} · {claim.date}</p></div><span className="text-[10px] text-zinc-500">{claim.orderId}</span><span className="text-[10px] text-zinc-500">{reward ? `${formatNumber(reward.points)} puntos` : 'Beneficio RODEX'}</span><StatusPill status={claim.status} /></div>
            })}{demo.loyalty.claims.length === 0 && <PanelEmpty>No hay recompensas reservadas.</PanelEmpty>}</div>
          </ModulePanel>
        </TabsContent>
      </Tabs>
      {feedback && <div role="status" className="flex items-start justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-xs leading-5 text-zinc-300"><span>{feedback}</span><Button type="button" size="icon-xs" variant="ghost" aria-label="Cerrar aviso" onClick={() => setFeedback('')}><X /></Button></div>}
    </div>
  )
}
