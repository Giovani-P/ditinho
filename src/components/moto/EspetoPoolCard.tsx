'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { statusEspetoBadge } from '@/components/ui/Badge'

interface EspetoPool {
  id: string
  numero: number | null
  prioridade: string
  status: string
  cliente: { nome: string; telefone: string | null; endereco: string; numero: string | null; bairro: string; referencia: string | null }
  pedido: { statusPagamento: string }
  entregador: { user: { nome: string } } | null
}

function pagamentoBadge(s: string) {
  if (s === 'PAGO') return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">💳 Pago (Pix)</span>
  if (s === 'A_PRAZO') return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">📝 A prazo</span>
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">💰 Receber na entrega</span>
}

export function EspetoPoolCard({ espeto, onClaimed }: { espeto: EspetoPool; onClaimed: () => void }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const jaFoiPego = !!espeto.entregador

  async function pegar() {
    setLoading(true)
    setErro('')
    try {
      const res = await fetch(`/api/espetos/${espeto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimar: true }),
      })
      if (res.status === 409) {
        setErro('Já pego! Atualizando...')
        setTimeout(onClaimed, 1200)
        return
      }
      if (!res.ok) throw new Error()
      onClaimed()
      router.refresh()
    } catch {
      setErro('Erro ao pegar entrega')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${jaFoiPego ? 'opacity-60 border-gray-200' : 'border-orange-200'}`}>
      <div className={`px-4 py-2 flex items-center justify-between ${espeto.prioridade === 'HOJE' ? 'bg-red-50' : jaFoiPego ? 'bg-gray-50' : 'bg-orange-50'}`}>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-gray-700 text-sm">#{espeto.numero}</span>
          {jaFoiPego
            ? <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Pego por {espeto.entregador!.user.nome}</span>
            : <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">LIVRE</span>
          }
        </div>
        <div className="flex items-center gap-2">
          {espeto.prioridade === 'HOJE' && <span className="text-xs text-red-600 font-medium">🔴 Urgente</span>}
          {statusEspetoBadge(espeto.status)}
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="font-bold text-gray-900">{espeto.cliente.nome}</p>
        <p className="text-gray-600 text-sm mt-1">
          {espeto.cliente.endereco}{espeto.cliente.numero ? `, ${espeto.cliente.numero}` : ''}
        </p>
        <p className="text-gray-500 text-xs">{espeto.cliente.bairro}</p>
        {espeto.cliente.referencia && <p className="text-gray-400 text-xs mt-1 italic">📍 {espeto.cliente.referencia}</p>}
        <div className="mt-2">{pagamentoBadge(espeto.pedido.statusPagamento)}</div>
      </div>

      {!jaFoiPego && (
        <div className="px-4 pb-4 space-y-2">
          {erro && <p className="text-xs text-red-500 text-center">{erro}</p>}
          <div className="flex gap-2">
            {espeto.cliente.telefone && (
              <a href={`tel:${espeto.cliente.telefone}`} className="flex-1 bg-green-50 border border-green-200 text-green-700 text-sm font-medium py-2.5 rounded-xl text-center">📞</a>
            )}
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(`${espeto.cliente.endereco}, ${espeto.cliente.bairro}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium py-2.5 rounded-xl text-center"
            >🗺️ GPS</a>
          </div>
          <button
            onClick={pegar}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white text-sm font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Pegando...' : '🏍️ Pegar esta entrega'}
          </button>
        </div>
      )}
    </div>
  )
}
