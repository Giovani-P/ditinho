'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  espetoId: string
  statusAtual: string
}

export function ConfirmarEntregaButton({ espetoId, statusAtual }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  if (statusAtual === 'ENTREGUE') {
    return (
      <div className="px-4 pb-4">
        <div className="w-full bg-green-100 border border-green-200 text-green-700 text-sm font-medium py-3 rounded-xl text-center">
          ✅ Entregue!
        </div>
      </div>
    )
  }

  async function iniciarRota() {
    setLoading(true)
    try {
      await fetch(`/api/espetos/${espetoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'EM_ROTA' }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function confirmarEntrega() {
    setLoading(true)
    try {
      await fetch(`/api/espetos/${espetoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ENTREGUE' }),
      })
      setConfirmando(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function reportarProblema() {
    setLoading(true)
    try {
      await fetch(`/api/espetos/${espetoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PROBLEMA' }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (confirmando) {
    return (
      <div className="px-4 pb-4 space-y-2">
        <p className="text-sm text-center text-gray-600 font-medium mb-3">Confirmar entrega?</p>
        <button
          onClick={confirmarEntrega}
          disabled={loading}
          className="w-full bg-green-600 text-white text-sm font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Confirmando...' : '✅ Sim, entreguei!'}
        </button>
        <button
          onClick={() => setConfirmando(false)}
          className="w-full bg-gray-100 text-gray-600 text-sm py-2.5 rounded-xl"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pb-4 space-y-2">
      {statusAtual === 'PENDENTE' && (
        <button
          onClick={iniciarRota}
          disabled={loading}
          className="w-full bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Aguarde...' : '🏍️ Iniciar Entrega'}
        </button>
      )}
      {statusAtual === 'EM_ROTA' && (
        <>
          <button
            onClick={() => setConfirmando(true)}
            className="w-full bg-green-600 text-white text-sm font-bold py-3 rounded-xl"
          >
            ✅ Confirmar Entrega
          </button>
          <button
            onClick={reportarProblema}
            disabled={loading}
            className="w-full bg-red-50 border border-red-200 text-red-600 text-sm py-2.5 rounded-xl"
          >
            ⚠️ Reportar Problema
          </button>
        </>
      )}
    </div>
  )
}
