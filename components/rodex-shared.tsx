'use client'

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const RODEX_CARD = 'border-zinc-800/80 bg-[#101213]'
export const RODEX_FIELD = 'mt-1 h-10 border-zinc-800 bg-zinc-950/70 text-sm placeholder:text-zinc-600 focus-visible:border-[#ed1c24]'
export const RODEX_TEXTAREA = 'mt-1 min-h-24 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-[#ed1c24]'

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = false,
}: {
  label: string
  value: string
  detail: string
  icon: LucideIcon
  accent?: boolean
}) {
  return (
    <Card className={RODEX_CARD}>
      <CardContent className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="text-xs text-zinc-500">{label}</p>
          <p className={`mt-2 truncate text-base font-bold tracking-tight sm:text-xl xl:text-2xl ${accent ? 'text-[#ed1c24]' : 'text-zinc-100'}`}>{value}</p>
          <p className="mt-2 text-[11px] leading-4 text-zinc-500">{detail}</p>
        </div>
        <span className="hidden size-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-[#ed1c24] sm:flex">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  )
}

export function ModulePanel({
  title,
  description,
  action,
  children,
  className = '',
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={`${RODEX_CARD} ${className}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="min-w-0">
          <CardTitle className="text-sm font-semibold sm:text-base">{title}</CardTitle>
          {description && <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function ModuleEyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ed1c24]">{children}</p>
}

export function DemoPill() {
  return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/5 text-[10px] font-semibold text-amber-300">DEMO</Badge>
}

export function DemoNotice({ children }: { children: ReactNode }) {
  return (
    <div role="note" className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="flex items-start gap-3">
        <DemoPill />
        <p className="text-xs leading-5 text-zinc-400">{children}</p>
      </div>
      <span className="shrink-0 text-[10px] text-zinc-600">RODEX · COP · Colombia</span>
    </div>
  )
}

export function PanelEmpty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-zinc-800 px-4 py-7 text-center text-xs text-zinc-500">{children}</p>
}

export function PrimaryAction({ children, onClick, type = 'button', disabled = false }: { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean }) {
  return (
    <Button type={type} disabled={disabled} onClick={onClick} className="h-9 gap-2 bg-[#ed1c24] text-xs font-semibold text-white hover:bg-[#c9151c]">
      {children}
    </Button>
  )
}

export function StatusPill({ status }: { status: string }) {
  const statusClass = status === 'Activo' || status === 'Validado' || status === 'Pagada' || status === 'Entregada' || status === 'Recompensa utilizada'
    ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-300'
    : status === 'Inactivo' || status === 'Cancelado' || status === 'Archivada'
      ? 'border-zinc-700 bg-zinc-900 text-zinc-400'
      : status === 'Recompensa disponible' || status === 'Pendiente' || status === 'Esperando aprobación' || status === 'En revisión'
        ? 'border-amber-500/25 bg-amber-500/5 text-amber-300'
        : 'border-zinc-700 bg-zinc-900 text-zinc-300'

  return <Badge variant="outline" className={statusClass}>{status}</Badge>
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{children}</p>
}
