'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { Activity, Check, Clock3, Eye, FileText, KeyRound, MoreHorizontal, Plus, Search, Shield, ShieldCheck, UserCheck, UserPlus, UsersRound, Wrench, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatNumber, initials, makeDemoId, nextAuditEvent, useRodexDemo } from '@/components/rodex-demo-state'
import { DemoNotice, MetricCard, ModulePanel, PanelEmpty, PrimaryAction, RODEX_FIELD, SectionLabel, StatusPill } from '@/components/rodex-shared'
import { allPermissionIds, permissionGroups, type AuditEvent, type RodexRole, type RodexUser } from '@/app/rodex-demo-store'

const roleDescriptions: Record<string, string> = {
  ADMIN: 'Administración completa del taller y sus reglas.',
  GERENCIA: 'Seguimiento de negocio, operación y rentabilidad.',
  RECEPCION: 'Ingreso de clientes, motocicletas y órdenes.',
  TECNICO: 'Diagnóstico, ejecución y evidencia de servicios.',
  INVENTARIO: 'Productos, movimientos, compras y proveedores.',
}

const roleBadgeClass: Record<string, string> = {
  ADMIN: 'border-red-500/30 bg-red-500/5 text-red-300',
  GERENCIA: 'border-violet-500/30 bg-violet-500/5 text-violet-300',
  RECEPCION: 'border-sky-500/30 bg-sky-500/5 text-sky-300',
  TECNICO: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
  INVENTARIO: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300',
}

function roleName(roles: RodexRole[], roleId: string) {
  return roles.find((role) => role.id === roleId)?.name ?? roleId
}

function UserAvatar({ user }: { user: RodexUser }) {
  return <Avatar className="size-9 border border-zinc-800"><AvatarImage src={user.avatarUrl || undefined} alt={`${user.firstName} ${user.lastName}`} /><AvatarFallback className="bg-zinc-800 text-[11px] font-semibold text-zinc-300">{initials(user.firstName, user.lastName)}</AvatarFallback></Avatar>
}

function UserForm({
  user,
  roles,
  onClose,
  onSubmit,
  error,
}: {
  user: RodexUser | null
  roles: RodexRole[]
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  error: string
}) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="rodex-user-form-title" className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 p-3 pt-8 sm:items-center sm:p-6">
      <Card className="my-5 w-full max-w-2xl border-[#ed1c24]/30 bg-[#101213] sm:my-0">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0"><div><CardTitle id="rodex-user-form-title" className="text-lg">{user ? 'Editar usuario RODEX' : 'Invitar a una persona del equipo'}</CardTitle><p className="mt-1 text-xs leading-5 text-zinc-500">Usuarios internos que trabajan en el taller. Los clientes y propietarios se administran en Clientes.</p></div><Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar formulario"><X /></Button></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div><SectionLabel>Información personal</SectionLabel><div className="mt-2 grid gap-3 sm:grid-cols-2"><label className="text-[11px] text-zinc-400">Nombre<Input name="firstName" required defaultValue={user?.firstName ?? ''} placeholder="Nombre" className={RODEX_FIELD} /></label><label className="text-[11px] text-zinc-400">Apellido<Input name="lastName" required defaultValue={user?.lastName ?? ''} placeholder="Apellido" className={RODEX_FIELD} /></label><label className="text-[11px] text-zinc-400">Email de trabajo<Input name="email" type="email" required defaultValue={user?.email ?? ''} placeholder="persona@rodex.co" className={RODEX_FIELD} /></label><label className="text-[11px] text-zinc-400">Teléfono<Input name="phone" type="tel" required defaultValue={user?.phone ?? ''} placeholder="+57 300 000 0000" className={RODEX_FIELD} /></label><label className="text-[11px] text-zinc-400">Avatar (URL opcional)<Input name="avatarUrl" type="url" defaultValue={user?.avatarUrl ?? ''} placeholder="https://..." className={RODEX_FIELD} /></label></div></div>
            <div className="grid gap-3 sm:grid-cols-2"><label className="text-[11px] text-zinc-400">Rol dentro del taller<select name="roleId" defaultValue={user?.roleId ?? 'TECNICO'} className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200">{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label><label className="text-[11px] text-zinc-400">Estado<select name="status" defaultValue={user?.status ?? 'Activo'} className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200"><option>Activo</option><option>Inactivo</option></select></label></div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"><p className="flex items-center gap-2 text-xs font-semibold text-zinc-300"><KeyRound className="size-3.5 text-[#ed1c24]" /> Acceso seguro</p><p className="mt-1 text-[11px] leading-5 text-zinc-500">No se crean ni se muestran contraseñas desde esta pantalla. La invitación y autenticación se conectarán al backend.</p></div>
            {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
            <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" onClick={onClose} className="h-9 border-zinc-700 text-xs">Cancelar</Button><PrimaryAction type="submit"><Check data-icon="inline-start" />{user ? 'Guardar perfil' : 'Crear usuario demo'}</PrimaryAction></div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function RodexUsersModule() {
  const { demo, updateDemo } = useRodexDemo()
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<RodexUser | null>(null)
  const [formError, setFormError] = useState('')
  const [activeRoleId, setActiveRoleId] = useState('TECNICO')
  const [notice, setNotice] = useState('')
  const roles = demo.settings.security.roles
  const activeUsers = demo.users.filter((user) => user.status === 'Activo')
  const inactiveUsers = demo.users.filter((user) => user.status === 'Inactivo')
  const adminUsers = demo.users.filter((user) => user.roleId === 'ADMIN' && user.status === 'Activo')
  const technicianUsers = demo.users.filter((user) => user.roleId === 'TECNICO' && user.status === 'Activo')
  const selectedUser = demo.users.find((user) => user.id === selectedId)
  const activeRole = roles.find((role) => role.id === activeRoleId) ?? roles[0]
  const filteredUsers = useMemo(() => demo.users.filter((user) => {
    const name = `${user.firstName} ${user.lastName}`
    const matchesQuery = `${name} ${user.email} ${user.phone} ${user.id}`.toLowerCase().includes(query.toLowerCase())
    const matchesRole = roleFilter === 'Todos' || user.roleId === roleFilter
    const matchesStatus = statusFilter === 'Todos' || user.status === statusFilter
    return matchesQuery && matchesRole && matchesStatus
  }), [demo.users, query, roleFilter, statusFilter])
  const selectedUserActivity = selectedUser ? demo.audit.filter((event) => event.actorId === selectedUser.id || event.targetUserId === selectedUser.id) : []

  function openCreate() {
    setEditingUser(null)
    setFormError('')
    setFormOpen(true)
  }

  function openEdit(user: RodexUser) {
    setEditingUser(user)
    setFormError('')
    setFormOpen(true)
  }

  function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const firstName = String(values.get('firstName')).trim()
    const lastName = String(values.get('lastName')).trim()
    const email = String(values.get('email')).trim().toLowerCase()
    const phone = String(values.get('phone')).trim()
    const avatarUrl = String(values.get('avatarUrl') ?? '').trim()
    const roleId = String(values.get('roleId'))
    const status = String(values.get('status')) as RodexUser['status']
    if (demo.users.some((user) => user.email.toLowerCase() === email && user.id !== editingUser?.id)) {
      setFormError('Ya existe un usuario con ese correo de trabajo.')
      return
    }
    const userId = editingUser?.id ?? makeDemoId('usr')
    const nextUser: RodexUser = {
      id: userId,
      firstName,
      lastName,
      email,
      phone,
      avatarUrl,
      roleId,
      status,
      lastAccess: editingUser?.lastAccess ?? 'Sin acceso registrado',
      createdAt: editingUser?.createdAt ?? '06 OCT 2026',
      assignedOrderIds: editingUser?.assignedOrderIds ?? [],
      servicesCompleted: editingUser?.servicesCompleted ?? 0,
    }
    const auditEvent = nextAuditEvent({ targetUserId: userId, module: 'Usuarios', entity: userId, action: editingUser ? 'Actualizó el perfil del equipo' : 'Creó un usuario demo', previousValue: editingUser?.roleId, newValue: roleId })
    updateDemo((current) => ({
      ...current,
      users: editingUser ? current.users.map((user) => user.id === userId ? nextUser : user) : [nextUser, ...current.users],
      audit: [auditEvent, ...current.audit],
    }))
    setFormOpen(false)
    setSelectedId(userId)
    setNotice(editingUser ? 'Perfil actualizado en esta sesión de demo.' : 'Usuario agregado al equipo demo.')
  }

  function toggleUserStatus(user: RodexUser) {
    const nextStatus: RodexUser['status'] = user.status === 'Activo' ? 'Inactivo' : 'Activo'
    const event: AuditEvent = nextAuditEvent({ targetUserId: user.id, module: 'Usuarios', entity: user.id, action: nextStatus === 'Activo' ? 'Reactivó el acceso' : 'Desactivó el acceso', previousValue: user.status, newValue: nextStatus })
    updateDemo((current) => ({
      ...current,
      users: current.users.map((item) => item.id === user.id ? { ...item, status: nextStatus } : item),
      audit: [event, ...current.audit],
    }))
    setNotice(`${user.firstName} ${user.lastName}: acceso ${nextStatus.toLowerCase()} en el demo.`)
  }

  function togglePermission(permissionId: string) {
    if (!activeRole || activeRole.id === 'ADMIN') return
    const hasPermission = activeRole.permissions.includes(permissionId)
    updateDemo((current) => ({
      ...current,
      settings: {
        ...current.settings,
        security: {
          ...current.settings.security,
          roles: current.settings.security.roles.map((role) => role.id !== activeRole.id ? role : {
            ...role,
            permissions: hasPermission ? role.permissions.filter((permission) => permission !== permissionId) : [...role.permissions, permissionId],
          }),
        },
      },
      audit: [nextAuditEvent({ module: 'Usuarios', entity: activeRole.id, action: 'Actualizó permisos del rol', previousValue: hasPermission ? permissionId : undefined, newValue: hasPermission ? undefined : permissionId }), ...current.audit],
    }))
    setNotice(`Permiso de ${activeRole.name} actualizado en el demo.`)
  }

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <DemoNotice>Usuarios internos de RODEX: recepción, técnicos, inventario y gerencia. Las acciones del demo generan eventos de auditoría en esta sesión; la autenticación real requiere backend.</DemoNotice>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Usuarios activos" value={formatNumber(activeUsers.length)} detail="Acceso habilitado en el demo" icon={UserCheck} />
        <MetricCard label="Usuarios inactivos" value={formatNumber(inactiveUsers.length)} detail="Sin acceso operativo" icon={Shield} />
        <MetricCard label="Administradores" value={formatNumber(adminUsers.length)} detail="Permisos completos" icon={ShieldCheck} accent />
        <MetricCard label="Técnicos" value={formatNumber(technicianUsers.length)} detail={`${demo.users.reduce((total, user) => total + user.assignedOrderIds.length, 0)} OT asignadas al equipo`} icon={Wrench} />
      </div>

      <Tabs defaultValue="equipo" className="gap-5">
        <TabsList className="rodex-tab-strip flex h-auto w-full flex-nowrap justify-start gap-1 overflow-x-auto overflow-y-hidden rounded-xl border border-zinc-800 bg-[#101213] p-1 sm:w-fit md:flex-wrap md:overflow-x-visible md:overflow-y-visible">
          <TabsTrigger value="equipo" className="min-h-9 flex-none px-3 text-xs">Equipo</TabsTrigger>
          <TabsTrigger value="roles" className="min-h-9 flex-none px-3 text-xs">Roles y permisos</TabsTrigger>
          <TabsTrigger value="auditoria" className="min-h-9 flex-none px-3 text-xs">Auditoría</TabsTrigger>
        </TabsList>

        <TabsContent value="equipo" className="flex flex-col gap-4">
          {selectedUser && <Card className="border-[#ed1c24]/25 bg-gradient-to-r from-[#1a1112] to-[#101213]"><CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start"><UserAvatar user={selectedUser} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-semibold">{selectedUser.firstName} {selectedUser.lastName}</h2><Badge variant="outline" className={roleBadgeClass[selectedUser.roleId] ?? 'border-zinc-700 text-zinc-300'}>{roleName(roles, selectedUser.roleId)}</Badge><StatusPill status={selectedUser.status} /></div><p className="mt-1 break-all text-xs text-zinc-500">{selectedUser.email} · {selectedUser.phone}</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><div><SectionLabel>Último acceso</SectionLabel><p className="mt-1 text-[11px] text-zinc-300">{selectedUser.lastAccess}</p></div><div><SectionLabel>Ingreso</SectionLabel><p className="mt-1 text-[11px] text-zinc-300">{selectedUser.createdAt}</p></div><div><SectionLabel>Órdenes asignadas</SectionLabel><p className="mt-1 text-[11px] text-zinc-300">{selectedUser.assignedOrderIds.length}</p></div><div><SectionLabel>Servicios realizados</SectionLabel><p className="mt-1 text-[11px] text-zinc-300">{selectedUser.servicesCompleted}</p></div></div><Separator className="my-3 bg-zinc-800" /><div className="flex flex-wrap gap-2">{selectedUser.assignedOrderIds.length ? selectedUser.assignedOrderIds.map((orderId) => <Badge key={orderId} variant="outline" className="border-zinc-700 font-mono text-[10px] text-zinc-400">{orderId}</Badge>) : <span className="text-[10px] text-zinc-500">Sin órdenes asignadas.</span>}</div><div className="mt-3 flex flex-col gap-2">{selectedUserActivity.slice(0, 2).map((event) => <p key={event.id} className="flex items-start gap-2 text-[11px] text-zinc-400"><Activity className="mt-0.5 size-3 shrink-0 text-[#ed1c24]" />{event.action} · {event.entity} · {event.date}</p>)}</div></div><div className="flex shrink-0 gap-2"><Button type="button" variant="outline" size="sm" onClick={() => openEdit(selectedUser)} className="border-zinc-700 text-xs">Editar</Button><Button type="button" variant="ghost" size="icon-sm" onClick={() => setSelectedId(null)} aria-label="Cerrar perfil"><X /></Button></div></CardContent></Card>}

          <ModulePanel title="Equipo RODEX" description="Personas que operan el taller. No incluye propietarios de motocicletas." action={<Button type="button" onClick={openCreate} className="h-9 bg-[#ed1c24] text-xs text-white hover:bg-[#c9151c]"><UserPlus data-icon="inline-start" /> Invitar usuario</Button>}>
            <div className="mb-4 grid gap-2 sm:grid-cols-[minmax(180px,1fr)_170px_145px]"><div className="relative"><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-600" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nombre, email o teléfono" aria-label="Buscar usuarios" className="h-9 border-zinc-800 bg-zinc-950 pl-9 text-xs" /></div><select aria-label="Filtrar por rol" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-300"><option value="Todos">Todos los roles</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select><select aria-label="Filtrar por estado" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-300"><option>Todos</option><option>Activo</option><option>Inactivo</option></select></div>
            <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left text-xs"><thead><tr className="border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-600"><th className="py-3 pr-3 font-medium">Usuario</th><th className="px-3 py-3 font-medium">Teléfono</th><th className="px-3 py-3 font-medium">Rol</th><th className="px-3 py-3 font-medium">Estado</th><th className="px-3 py-3 font-medium">Último acceso</th><th className="px-3 py-3 font-medium">Ingreso</th><th className="px-3 py-3 text-right font-medium">Acciones</th></tr></thead><tbody>{filteredUsers.map((user) => <tr key={user.id} className="border-b border-zinc-800/60 last:border-0"><td className="py-3 pr-3"><button type="button" onClick={() => setSelectedId(user.id)} className="flex items-center gap-2.5 text-left"><UserAvatar user={user} /><span className="min-w-0"><span className="block font-semibold text-zinc-200">{user.firstName} {user.lastName}</span><span className="mt-1 block text-[10px] text-zinc-500">{user.email}</span></span></button></td><td className="px-3 py-3 text-zinc-400">{user.phone}</td><td className="px-3 py-3"><Badge variant="outline" className={roleBadgeClass[user.roleId] ?? 'border-zinc-700 text-zinc-300'}>{roleName(roles, user.roleId)}</Badge></td><td className="px-3 py-3"><StatusPill status={user.status} /></td><td className="px-3 py-3 text-zinc-400">{user.lastAccess}</td><td className="px-3 py-3 text-zinc-500">{user.createdAt}</td><td className="px-3 py-3"><div className="flex justify-end gap-1"><Button type="button" variant="ghost" size="icon-xs" onClick={() => setSelectedId(user.id)} aria-label={`Ver a ${user.firstName}`}><Eye /></Button><Button type="button" variant="ghost" size="icon-xs" onClick={() => openEdit(user)} aria-label={`Editar a ${user.firstName}`}><MoreHorizontal /></Button><Button type="button" variant="ghost" size="icon-xs" onClick={() => toggleUserStatus(user)} aria-label={`${user.status === 'Activo' ? 'Desactivar' : 'Activar'} a ${user.firstName}`}>{user.status === 'Activo' ? <X /> : <Check />}</Button></div></td></tr>)}</tbody></table></div>
            <div className="flex flex-col gap-2 md:hidden">{filteredUsers.map((user) => <div key={user.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3"><div className="flex items-start gap-3"><UserAvatar user={user} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setSelectedId(user.id)} className="truncate text-left text-xs font-semibold text-zinc-100">{user.firstName} {user.lastName}</button><StatusPill status={user.status} /></div><p className="mt-1 break-all text-[10px] text-zinc-500">{user.email}</p><p className="mt-1 text-[10px] text-zinc-500">{user.phone}</p></div></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-3"><Badge variant="outline" className={roleBadgeClass[user.roleId] ?? 'border-zinc-700 text-zinc-300'}>{roleName(roles, user.roleId)}</Badge><span className="text-[10px] text-zinc-600">Acceso: {user.lastAccess}</span></div><div className="mt-2 flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => setSelectedId(user.id)} className="h-7 flex-1 border-zinc-700 text-[10px]">Ver perfil</Button><Button type="button" size="sm" variant="outline" onClick={() => openEdit(user)} className="h-7 flex-1 border-zinc-700 text-[10px]">Editar</Button><Button type="button" size="sm" variant="ghost" onClick={() => toggleUserStatus(user)} className="h-7 text-[10px] text-zinc-400">{user.status === 'Activo' ? 'Desactivar' : 'Activar'}</Button></div></div>)}</div>
            {filteredUsers.length === 0 && <PanelEmpty>No hay usuarios con esos filtros.</PanelEmpty>}
          </ModulePanel>
          <div className="grid gap-4 md:grid-cols-2"><ModulePanel title="Últimos accesos" description="El historial de acceso real se habilitará al conectar autenticación."><div className="flex flex-col gap-2">{demo.users.slice().sort((a, b) => { const recency = (value: string) => value.startsWith('Hoy') ? 0 : value.startsWith('Ayer') ? 1 : 2; return recency(a.lastAccess) - recency(b.lastAccess) }).slice(0, 4).map((user) => <div key={user.id} className="flex items-center gap-3 rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-2.5"><UserAvatar user={user} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{user.firstName} {user.lastName}</p><p className="truncate text-[10px] text-zinc-500">{roleName(roles, user.roleId)}</p></div><span className="text-[10px] text-zinc-500">{user.lastAccess}</span></div>)}</div></ModulePanel><ModulePanel title="Responsabilidad de operación" description="Asignaciones actuales asociadas a técnicos RODEX."><div className="flex flex-col gap-2">{technicianUsers.map((user) => <div key={user.id} className="flex items-center gap-3 rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-3"><Wrench className="size-4 text-[#ed1c24]" /><div className="min-w-0 flex-1"><p className="text-xs font-medium">{user.firstName} {user.lastName}</p><p className="mt-1 text-[10px] text-zinc-500">{user.servicesCompleted} servicios registrados</p></div><Badge variant="outline" className="border-zinc-700 font-mono text-[10px] text-zinc-400">{user.assignedOrderIds.length} OT</Badge></div>)}</div></ModulePanel></div>
        </TabsContent>

        <TabsContent value="roles" className="flex flex-col gap-4">
          <div className="grid gap-4 xl:grid-cols-[270px_1fr]">
            <ModulePanel title="Roles del taller" description="Permisos por función. Los roles del sistema no se pueden eliminar.">
              <div className="flex flex-col gap-2">{roles.map((role) => <button key={role.id} type="button" onClick={() => setActiveRoleId(role.id)} className={`rounded-lg border p-3 text-left transition ${activeRole?.id === role.id ? 'border-[#ed1c24]/45 bg-[#ed1c24]/[0.05]' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'}`}><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold">{role.name}</span>{role.system && <Badge variant="outline" className="border-zinc-700 text-[9px] text-zinc-500">Sistema</Badge>}</div><p className="mt-1 text-[10px] leading-4 text-zinc-500">{roleDescriptions[role.id] ?? 'Rol personalizado de RODEX.'}</p><p className="mt-2 text-[10px] text-zinc-600">{role.permissions.length} / {allPermissionIds.length} permisos · {demo.users.filter((user) => user.roleId === role.id).length} usuarios</p></button>)}</div>
            </ModulePanel>
            {activeRole && <ModulePanel title={`Permisos · ${activeRole.name}`} description="Permisos granulares para módulos, acciones y cierre de órdenes." action={activeRole.id === 'ADMIN' ? <Badge variant="outline" className="border-red-500/25 text-red-300">Acceso completo</Badge> : <Badge variant="outline" className="border-zinc-700 text-zinc-400">{activeRole.permissions.length} habilitados</Badge>}>
              <div className="flex flex-col gap-4">{permissionGroups.map((group) => <fieldset key={group.name} className="rounded-xl border border-zinc-800 p-3"><legend className="px-1 text-xs font-semibold text-zinc-300">{group.name}</legend><div className="grid gap-2 pt-1 sm:grid-cols-2">{group.permissions.map((permission) => <label key={permission.id} className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[11px] ${activeRole.permissions.includes(permission.id) ? 'border-zinc-700 bg-zinc-900/70 text-zinc-200' : 'border-transparent text-zinc-500'}`}><input type="checkbox" checked={activeRole.permissions.includes(permission.id)} disabled={activeRole.id === 'ADMIN'} onChange={() => togglePermission(permission.id)} className="size-3.5 accent-[#ed1c24]" /><span className="min-w-0 flex-1">{permission.label}</span><code className="hidden text-[9px] text-zinc-600 lg:block">{permission.id}</code></label>)}</div></fieldset>)}</div>
              <p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-[11px] leading-5 text-zinc-500">La interfaz demuestra la matriz de permisos; el control de acceso real debe validarse en cada endpoint del backend.</p>
            </ModulePanel>}
          </div>
          <ModulePanel title="Roles personalizados" description="Estructura lista para añadir perfiles propios sin alterar los roles base."><div className="flex flex-col gap-3 rounded-lg border border-dashed border-zinc-800 p-4 sm:flex-row sm:items-center"><div className="flex size-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400"><ShieldCheck className="size-4" /></div><p className="min-w-0 flex-1 text-xs leading-5 text-zinc-500">Los roles ADMIN, GERENCIA, RECEPCIÓN, TÉCNICO e INVENTARIO son plantillas del sistema. La persistencia y asignación de roles personalizados se activa al conectar autenticación.</p><Badge variant="outline" className="w-fit border-zinc-700 text-[10px] text-zinc-500">Preparado para backend</Badge></div></ModulePanel>
        </TabsContent>

        <TabsContent value="auditoria" className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><MetricCard label="Eventos registrados" value={formatNumber(demo.audit.length)} detail="Acciones de operación y permisos" icon={Activity} /><MetricCard label="Usuarios con actividad" value={formatNumber(new Set(demo.audit.map((event) => event.actorId)).size)} detail="Actores presentes en la auditoría" icon={UsersRound} /><MetricCard label="Último cambio" value={demo.audit[0]?.date.split(' · ')[0] ?? 'Sin actividad'} detail={demo.audit[0]?.module ?? 'Auditoría del taller'} icon={Clock3} accent /></div>
          <ModulePanel title="Registro de actividad RODEX" description="Usuario, fecha, módulo, entidad y cambio. Los eventos del demo no son una bitácora de producción.">
            <div className="flex flex-col gap-2">{demo.audit.map((event) => <AuditRow key={event.id} event={event} />)}{demo.audit.length === 0 && <PanelEmpty>No hay eventos de auditoría.</PanelEmpty>}</div>
          </ModulePanel>
          <div className="grid gap-3 sm:grid-cols-3">{[['Identidad', 'Actor y usuario afectado'], ['Trazabilidad', 'Módulo, entidad y acción'], ['Contexto', 'Valor anterior y nuevo']].map(([title, description]) => <div key={title} className="rounded-xl border border-zinc-800 bg-[#101213] p-3"><p className="text-xs font-semibold">{title}</p><p className="mt-1 text-[11px] text-zinc-500">{description}</p></div>)}</div>
        </TabsContent>
      </Tabs>
      {formOpen && <UserForm user={editingUser} roles={roles} onClose={() => setFormOpen(false)} onSubmit={saveUser} error={formError} />}
      {notice && <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-xs text-zinc-300"><span>{notice}</span><Button type="button" size="icon-xs" variant="ghost" aria-label="Cerrar aviso" onClick={() => setNotice('')}><X /></Button></div>}
    </div>
  )
}

function AuditRow({ event }: { event: AuditEvent }) {
  return <div className="grid min-w-0 grid-cols-[auto_1fr] gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 sm:grid-cols-[auto_145px_120px_1fr_150px]"><span className="flex size-8 items-center justify-center rounded-lg bg-[#ed1c24]/10 text-[#ed1c24]"><FileText className="size-3.5" /></span><div className="min-w-0"><p className="truncate text-xs font-semibold">{event.actor}</p><p className="mt-1 truncate text-[10px] text-zinc-500">{event.date}</p></div><span className="hidden self-center text-[10px] text-zinc-400 sm:block">{event.module}</span><div className="min-w-0"><p className="text-xs text-zinc-300">{event.action}</p><p className="mt-1 truncate text-[10px] text-zinc-500">{event.entity}{event.previousValue || event.newValue ? ` · ${event.previousValue ?? '—'} → ${event.newValue ?? '—'}` : ''}</p></div><span className="hidden self-center text-right font-mono text-[10px] text-zinc-500 sm:block">{event.entity}</span></div>
}
