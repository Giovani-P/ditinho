'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  espetoId: string
  statusAtual: string
  isMotoPool?: boolean
  onStatusChange?: (novoStatus: string) => void
}

export function ConfirmarEntregaButton({ espetoId, statusAtual, isMotoPool, onStatusChange }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [reportandoProblema, setReportandoProblema] = useState(false)
  const [descricaoProblema, setDescricaoProblema] = useState('')

  if (statusAtual === 'ENTREGUE') {
    return (
      <div className="px-4 pb-4">
        <div className="w-full bg-green-100 border border-green-200 text-green-700 text-sm font-medium py-3 rounded-xl text-center">
          ✅ Entregue!
        </div>
      </div>
    )
  }

  async function clamarEspeto() {
    setLoading(true)
    try {
      await fetch(`/api/espetos/${espetoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimar: true, status: 'PENDENTE' }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function iniciarRota() {
    setLoading(true)
    try {
      await fetch(`/api/espetos/${espetoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'EM_ROTA' }),
      })
      onStatusChange?.('EM_ROTA')
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
      onStatusChange?.('ENTREGUE')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function confirmarProblema() {
    if (!descricaoProblema.trim()) return
    setLoading(true)
    try {
      await fetch(`/api/espetos/${espetoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PROBLEMA',
          descricaoProblema: descricaoProblema.trim(),
        }),
      })
      setReportandoProblema(false)
      setDescricaoProblema('')
      onStatusChange?.('PROBLEMA')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  // Modal de problema
  if (reportandoProblema) {
    return (
      <div className="px-4 pb-4 space-y-3">
        <p className="text-sm font-semibold text-red-600">⚠️ Reportar Problema</p>
        <textarea
          value={descricaoProblema}
          onChange={e => setDescricaoProblema(e.target.value)}
          placeholder="Descreva o problema (obrigatório)..."
          rows={3}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <button
          onClick={confirmarProblema}
          disabled={loading || !descricaoProblema.trim()}
          className="w-full bg-red-600 text-white text-sm font-bold py-3 rounded-xl disabled:opacity-40"
        >
          {loading ? 'Enviando...' : '⚠️ Confirmar Problema'}
        </button>
        <button
          onClick={() => { setReportandoProblema(false); setDescricaoProblema('') }}
          className="w-full bg-gray-100 text-gray-600 text-sm py-2.5 rounded-xl"
        >
          Cancelar
        </button>
      </div>
    )
  }

  // Confirmação de entrega
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

  // Motoboy do pool — espeto ainda sem dono
  if (isMotoPool) {
    return (
      <div className="px-4 pb-4">
        <button
          onClick={clamarEspeto}
          disabled={loading}
          className="w-full bg-orange-500 text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Aguarde...' : '🏍️ Pegar esta entrega'}
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
            onClick={() => setReportandoProblema(true)}
            className="w-full bg-red-50 border border-red-200 text-red-600 text-sm py-2.5 rounded-xl"
          >
            ⚠️ Reportar Problema
          </button>
        </>
      )}
    </div>
  )
}
