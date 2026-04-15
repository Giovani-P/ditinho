'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  entregadorId: string
  disponivel: boolean
  userAtivo: boolean
}

export function DisponibilidadeToggle({ entregadorId, disponivel, userAtivo }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [estado, setEstado] = useState(disponivel)

  if (!userAtivo) {
    return <span className="text-xs text-red-400 italic">Conta inativa</span>
  }

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/entregadores/${entregadorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponivel: !estado }),
      })
      if (res.ok) {
        setEstado(v => !v)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
        estado
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${estado ? 'bg-green-500' : 'bg-gray-400'}`} />
      {loading ? '...' : estado ? 'Disponível' : 'Indisponível'}
    </button>
  )
}
