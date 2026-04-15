'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  pedidoId: string
  statusAtual: string
}

export function AtualizarPagamentoButton({ pedidoId, statusAtual }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function marcarPago() {
    setLoading(true)
    try {
      await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusPagamento: 'PAGO' }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={marcarPago}
      disabled={loading}
      className="text-xs bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? '...' : '✅ Marcar Pago'}
    </button>
  )
}
