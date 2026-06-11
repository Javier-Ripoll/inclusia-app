'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Zap, X } from 'lucide-react'

const SPECIALIZATIONS = [
  { value: 'pati', label: 'PATI' },
  { value: 'tea', label: 'TEA' },
  { value: 'tdah', label: 'TDAH' },
  { value: 'altas_capacidades', label: 'Altas capacidades' },
  { value: 'discapacidad_motora', label: 'Discapacidad motora' },
  { value: 'discapacidad_intelectual', label: 'Discapacidad intelectual' },
  { value: 'dificultades_aprendizaje', label: 'Dif. aprendizaje' },
  { value: 'lenguaje', label: 'Lenguaje' },
  { value: 'conducta', label: 'Conducta' },
]

const CONTRACT_TYPES = ['Indefinido', 'Temporal', 'Sustitución', 'Parcial']

interface Props {
  total: number
  filtered: number
}

export function OffersFilters({ total, filtered }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const q           = searchParams.get('q') ?? ''
  const urgente     = searchParams.get('urgente') === '1'
  const provincia   = searchParams.get('provincia') ?? ''
  const especialidad = searchParams.get('especialidad') ?? ''
  const tipo        = searchParams.get('tipo') ?? ''

  const hasFilters = q || urgente || provincia || especialidad || tipo

  const update = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    startTransition(() => router.replace(`${pathname}?${params.toString()}`))
  }, [searchParams, pathname, router])

  const clearAll = () => {
    startTransition(() => router.replace(pathname))
  }

  return (
    <div className={`transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      {/* Search bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, ciudad..."
            className="pl-9"
            defaultValue={q}
            onChange={e => update('q', e.target.value || null)}
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5 text-muted-foreground">
            <X className="h-4 w-4" /> Limpiar
          </Button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {/* Urgente toggle */}
        <button
          onClick={() => update('urgente', urgente ? null : '1')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            urgente
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-white text-muted-foreground border-border hover:border-red-300 hover:text-red-600'
          }`}
        >
          <Zap className="h-3 w-3" /> Urgente
        </button>

        {/* Provincia */}
        <div className="relative">
          <select
            value={provincia}
            onChange={e => update('provincia', e.target.value || null)}
            className={`appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              provincia
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-muted-foreground border-border hover:border-primary/50'
            }`}
          >
            <option value="">Provincia</option>
            {['Alicante','Castellón','Valencia','Madrid','Barcelona','Sevilla','Málaga','Murcia','Zaragoza','Bilbao'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Tipo contrato */}
        <div className="relative">
          <select
            value={tipo}
            onChange={e => update('tipo', e.target.value || null)}
            className={`appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              tipo
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-muted-foreground border-border hover:border-primary/50'
            }`}
          >
            <option value="">Tipo de contrato</option>
            {CONTRACT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      {hasFilters && (
        <p className="text-xs text-muted-foreground mt-3">
          {filtered === total
            ? `${total} ofertas`
            : `${filtered} de ${total} ofertas`}
        </p>
      )}
    </div>
  )
}
