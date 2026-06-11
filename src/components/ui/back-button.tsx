'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface Props {
  href?: string
  label?: string
}

export function BackButton({ href, label = 'Volver' }: Props) {
  const router = useRouter()

  return (
    <button
      onClick={() => href ? router.push(href) : router.back()}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  )
}
