'use client'

import { useState, useEffect } from 'react'
import { PROVINCIAS_CIUDADES, PROVINCIAS } from '@/lib/spain-locations'

interface Props {
  provincia: string
  ciudad: string
  onProvinciaChange: (v: string) => void
  onCiudadChange: (v: string) => void
}

export function LocationSelect({ provincia, ciudad, onProvinciaChange, onCiudadChange }: Props) {
  const [ciudades, setCiudades] = useState<string[]>(
    provincia ? (PROVINCIAS_CIUDADES[provincia] ?? []) : []
  )

  useEffect(() => {
    setCiudades(provincia ? (PROVINCIAS_CIUDADES[provincia] ?? []) : [])
  }, [provincia])

  const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    onProvinciaChange(val)
    onCiudadChange('') // reset ciudad
  }

  const selectClass = "w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium leading-none mb-2 block">Provincia</label>
        <select
          value={provincia}
          onChange={handleProvinciaChange}
          className={selectClass}
        >
          <option value="">Selecciona provincia</option>
          {PROVINCIAS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium leading-none mb-2 block">Ciudad</label>
        <select
          value={ciudad}
          onChange={e => onCiudadChange(e.target.value)}
          disabled={!provincia}
          className={selectClass}
        >
          <option value="">Selecciona ciudad</option>
          {ciudades.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
