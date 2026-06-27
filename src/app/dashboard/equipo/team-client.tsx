'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/back-button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Plus, Trash2, Phone, Mail, Euro, Loader2, Users, Pencil } from 'lucide-react'

interface Member {
  id: string
  full_name: string
  email?: string
  phone?: string
  role?: string
  department?: string
  start_date?: string
  salary?: number
  salary_period?: string
  contract_type?: string
  notes?: string
  status: string
}

interface Props {
  companyId: string
  companyName: string
  members: Member[]
}

const SALARY_PERIOD_LABELS: Record<string, string> = {
  hour: '/hora', month: '/mes', year: '/año'
}

function MemberForm({
  initial,
  onSubmit,
  onCancel,
  saving,
  error,
}: {
  initial: Partial<Member>
  onSubmit: (data: Partial<Member>) => void
  onCancel: () => void
  saving: boolean
  error: string | null
}) {
  const [fullName, setFullName] = useState(initial.full_name ?? '')
  const [email, setEmail] = useState(initial.email ?? '')
  const [phone, setPhone] = useState(initial.phone ?? '')
  const [role, setRole] = useState(initial.role ?? '')
  const [department, setDepartment] = useState(initial.department ?? '')
  const [startDate, setStartDate] = useState(initial.start_date ?? '')
  const [salary, setSalary] = useState(initial.salary ? String(initial.salary) : '')
  const [salaryPeriod, setSalaryPeriod] = useState(initial.salary_period ?? 'month')
  const [contractType, setContractType] = useState(initial.contract_type ?? '')
  const [notes, setNotes] = useState(initial.notes ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ full_name: fullName, email, phone, role, department, start_date: startDate, salary: salary ? parseFloat(salary) : undefined, salary_period: salaryPeriod, contract_type: contractType, notes })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Nombre completo *</Label>
          <Input value={fullName} onChange={e => setFullName(e.target.value)} required />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Teléfono</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div>
          <Label>Puesto / Cargo</Label>
          <Input placeholder="PATI, Logopeda..." value={role} onChange={e => setRole(e.target.value)} />
        </div>
        <div>
          <Label>Departamento</Label>
          <Input placeholder="Apoyo educativo..." value={department} onChange={e => setDepartment(e.target.value)} />
        </div>
        <div>
          <Label>Fecha de alta</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <Label>Tipo de contrato</Label>
          <Input placeholder="Indefinido, temporal..." value={contractType} onChange={e => setContractType(e.target.value)} />
        </div>
        <div>
          <Label>Salario (€)</Label>
          <Input type="number" placeholder="1500" value={salary} onChange={e => setSalary(e.target.value)} />
        </div>
        <div>
          <Label>Período</Label>
          <select value={salaryPeriod} onChange={e => setSalaryPeriod(e.target.value)}
            className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background">
            <option value="hour">Por hora</option>
            <option value="month">Al mes</option>
            <option value="year">Al año</option>
          </select>
        </div>
        <div className="col-span-2">
          <Label>Notas</Label>
          <Input placeholder="Cualquier información adicional..." value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Guardar
        </Button>
      </div>
    </form>
  )
}

export function TeamClient({ companyId, companyName, members: initialMembers }: Props) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async (data: Partial<Member>) => {
    if (!data.full_name?.trim()) { setError('El nombre es obligatorio.'); return }
    setSaving(true); setError(null)
    const supabase = createClient()
    const { data: inserted, error: err } = await supabase.from('team_members').insert({
      company_id: companyId,
      full_name: data.full_name,
      email: data.email || null,
      phone: data.phone || null,
      role: data.role || null,
      department: data.department || null,
      start_date: data.start_date || null,
      salary: data.salary ?? null,
      salary_period: data.salary_period,
      contract_type: data.contract_type || null,
      notes: data.notes || null,
    }).select().single()

    if (err || !inserted) { setError('Error al añadir el empleado.'); setSaving(false); return }
    setMembers(prev => [inserted, ...prev])
    setAddOpen(false)
    setSaving(false)
  }

  const handleEdit = async (id: string, data: Partial<Member>) => {
    if (!data.full_name?.trim()) return
    const supabase = createClient()
    const { data: updated, error: err } = await supabase.from('team_members').update({
      full_name: data.full_name,
      email: data.email || null,
      phone: data.phone || null,
      role: data.role || null,
      department: data.department || null,
      start_date: data.start_date || null,
      salary: data.salary ?? null,
      salary_period: data.salary_period,
      contract_type: data.contract_type || null,
      notes: data.notes || null,
    }).eq('id', id).select().single()

    if (!err && updated) {
      setMembers(prev => prev.map(m => m.id === id ? updated : m))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este empleado del equipo?')) return
    const supabase = createClient()
    await supabase.from('team_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  const active = members.filter(m => m.status === 'active')
  const inactive = members.filter(m => m.status === 'inactive')

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <BackButton href="/dashboard" label="Panel" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Gestión de equipo
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{companyName} · {active.length} empleado{active.length !== 1 ? 's' : ''} activo{active.length !== 1 ? 's' : ''}</p>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger>
            <Button className="gap-2" type="button"><Plus className="h-4 w-4" /> Añadir empleado</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo empleado</DialogTitle>
            </DialogHeader>
            <MemberForm
              initial={{}}
              onSubmit={handleAdd}
              onCancel={() => setAddOpen(false)}
              saving={saving}
              error={error}
            />
          </DialogContent>
        </Dialog>
      </div>

      {members.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aún no hay empleados</p>
            <p className="text-sm">Añade a tu equipo para gestionar su información desde aquí</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {active.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Activos</p>
              {active.map(m => <MemberCard key={m.id} member={m} onDelete={handleDelete} onEdit={handleEdit} />)}
            </>
          )}
          {inactive.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-2">Inactivos</p>
              {inactive.map(m => <MemberCard key={m.id} member={m} onDelete={handleDelete} onEdit={handleEdit} />)}
            </>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center mt-8">
        Próximamente: gestión de nóminas, documentos y más
      </p>
    </div>
  )
}

function MemberCard({ member: m, onDelete, onEdit }: {
  member: Member
  onDelete: (id: string) => void
  onEdit: (id: string, data: Partial<Member>) => Promise<void>
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleEdit = async (data: Partial<Member>) => {
    setSaving(true)
    await onEdit(m.id, data)
    setSaving(false)
    setEditOpen(false)
  }

  const initials = m.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold">{m.full_name}</p>
              {m.role && <Badge variant="secondary" className="text-xs">{m.role}</Badge>}
              {m.department && <Badge variant="outline" className="text-xs">{m.department}</Badge>}
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
              {m.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</span>}
              {m.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{m.phone}</span>}
              {m.salary && <span className="flex items-center gap-1"><Euro className="h-3 w-3" />{m.salary.toLocaleString('es-ES')}€{SALARY_PERIOD_LABELS[m.salary_period ?? 'month']}</span>}
              {m.contract_type && <span>{m.contract_type}</span>}
              {m.start_date && <span>Alta: {new Date(m.start_date).toLocaleDateString('es-ES')}</span>}
            </div>
            {m.notes && <p className="text-xs text-muted-foreground mt-1 italic">{m.notes}</p>}
          </div>
          <div className="flex gap-1 shrink-0">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar empleado</DialogTitle>
                </DialogHeader>
                <MemberForm
                  initial={m}
                  onSubmit={handleEdit}
                  onCancel={() => setEditOpen(false)}
                  saving={saving}
                  error={null}
                />
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={() => onDelete(m.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
