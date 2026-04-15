'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { statusEspetoBadge } from '@/components/ui/Badge'
import type { EspetoCompleto } from '@/types'

interface Entregador {
  id: string
  nome: string
  tipo: string
  disponivel: boolean
}

interface Props {
  espetos: EspetoCompleto[]
  entregadores: Entregador[]
}

export function EspetosTableClient({ espetos: initial, entregadores }: Props) {
  const router = useRouter()
  const [espetos, setEspetos] = useState(initial)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function updateStatus(id: string, status: string) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/espetos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setEspetos(prev => prev.map(e => e.id === id ? { ...e, status } : e))
        router.refresh()
      }
    } finally {
      setLoadingId(null)
    }
  }

  async function designarEntregador(id: string, entregadorId: string) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/espetos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entregadorId: entregadorId || null }),
      })
      if (res.ok) {
        const entregador = entregadores.find(e => e.id === entregadorId)
        setEspetos(prev => prev.map(e =>
          e.id === id
            ? {
                ...e,
                entregador: entregadorId && entregador
                  ? { tipo: entregador.tipo, user: { nome: entregador.nome } }
                  : null,
              }
            : e
        ))
        router.refresh()
      }
    } finally {
      setLoadingId(null)
    }
  }

  if (espetos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-2">📦</p>
        <p className="font-medium">Nenhum espeto hoje</p>
        <p className="text-sm">Os espetos aparecem quando pedidos são confirmados para entrega</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Cliente</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Endereço</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Veículo</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Entregador</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Prioridade</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Ação</th>
          </tr>
        </thead>
        <tbody>
          {espetos.map((espeto) => {
            const loading = loadingId === espeto.id
            const entregadoresPorTipo = entregadores.filter(e => e.tipo === espeto.tipo && e.disponivel)

            return (
              <tr key={espeto.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${loading ? 'opacity-60' : ''}`}>
                <td className="py-3 px-4">
                  <Link href={`/logistica/espeto/${espeto.id}`} className="font-mono font-bold text-gray-700 hover:text-green-600 hover:underline">
                    #{espeto.numero}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium text-gray-900">{espeto.cliente.nome}</p>
                  <p className="text-gray-400 text-xs">{espeto.cliente.telefone}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-gray-700">{espeto.cliente.endereco}</p>
                  <p className="text-gray-400 text-xs">{espeto.cliente.bairro}</p>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    espeto.tipo === 'MOTO' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {espeto.tipo === 'MOTO' ? '🏍️' : '🚚'} {espeto.tipo}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={espeto.entregador ? entregadores.find(e => e.nome === espeto.entregador?.user.nome)?.id ?? '' : ''}
                    onChange={e => designarEntregador(espeto.id, e.target.value)}
                    disabled={loading || espeto.status === 'ENTREGUE'}
                    className="text-xs border border-gray-200 rounded px-2 py-1 max-w-[130px] disabled:opacity-50"
                  >
                    <option value="">Não designado</option>
                    {entregadoresPorTipo.map(e => (
                      <option key={e.id} value={e.id}>{e.nome}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    espeto.prioridade === 'HOJE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {espeto.prioridade === 'HOJE' ? '🔴 Hoje' : '🟡 Amanhã'}
                  </span>
                </td>
                <td className="py-3 px-4">{statusEspetoBadge(espeto.status)}</td>
                <td className="py-3 px-4">
                  {espeto.status !== 'ENTREGUE' ? (
                    <select
                      value={espeto.status}
                      onChange={e => updateStatus(espeto.id, e.target.value)}
                      disabled={loading}
                      className="text-xs border border-gray-200 rounded px-2 py-1 disabled:opacity-50"
                    >
                      <option value="PENDENTE">Pendente</option>
                      <option value="EM_ROTA">Em Rota</option>
                      <option value="ENTREGUE">Entregue</option>
                      <option value="PROBLEMA">Problema</option>
                    </select>
                  ) : (
                    <span className="text-xs text-green-600 font-medium">✅ Concluído</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
