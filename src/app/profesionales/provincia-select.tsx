'use client'

import { useRouter } from 'next/navigation'

interface Props {
  provincias: string[]
  selected: string
}

export function ProvinciaSelect({ provincias, selected }: Props) {
  const router = useRouter()

  return (
    <select
      value={selected}
      onChange={e => {
        const val = e.target.value
        router.push(val ? `/profesionales?provincia=${encodeURIComponent(val)}&page=1` : '/profesionales?page=1')
      }}
      className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
    >
      <option value="">Toda España</option>
      {provincias.map(prov => (
        <option key={prov} value={prov}>{prov}</option>
      ))}
    </select>
  )
}
