'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { statusEspetoBadge } from '@/components/ui/Badge'
import { EspetoModal } from '@/components/logistica/EspetoModal'
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
  const [selectedEspeto, setSelectedEspeto] = useState<EspetoCompleto | null>(null)

  function openEspetoModal(espeto: EspetoCompleto) {
    setSelectedEspeto(espeto)
  }

  function closeModal() {
    setSelectedEspeto(null)
    router.refresh()
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
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Endereço</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Veículo</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Entregador</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Prioridade</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody>
          {espetos.map((espeto) => (
            <tr key={espeto.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <span className="font-mono font-bold text-gray-700">#{espeto.numero}</span>
              </td>
              <td className="py-3 px-4">
                <p className="font-medium text-gray-900">{espeto.cliente.nome}</p>
                <p className="text-gray-500 text-xs">{espeto.cliente.telefone}</p>
              </td>
              <td className="py-3 px-4">
                <p className="text-gray-700 text-sm">{espeto.cliente.endereco}</p>
                <p className="text-gray-500 text-xs">{espeto.cliente.bairro}</p>
              </td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  espeto.tipo === 'MOTO' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {espeto.tipo === 'MOTO' ? '🏍️' : '🚚'} {espeto.tipo}
                </span>
              </td>
              <td className="py-3 px-4">
                {espeto.entregador ? (
                  <p className="text-sm text-gray-900 font-medium">{espeto.entregador.user.nome}</p>
                ) : (
                  <p className="text-xs text-gray-400 italic">Não designado</p>
                )}
              </td>
              <td className="py-3 px-4">
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  espeto.prioridade === 'HOJE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {espeto.prioridade === 'HOJE' ? '🔴 Hoje' : '🟡 Amanhã'}
                </span>
              </td>
              <td className="py-3 px-4">{statusEspetoBadge(espeto.status)}</td>
              <td className="py-3 px-4">
                <button
                  onClick={() => openEspetoModal(espeto)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                >
                  ⚙️ Ações
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Modal */}
      <EspetoModal
        isOpen={selectedEspeto !== null}
        onClose={closeModal}
        espeto={selectedEspeto as EspetoCompleto}
        entregadores={entregadores}
      />
    </>
  )
}
