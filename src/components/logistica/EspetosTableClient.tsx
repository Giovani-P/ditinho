'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const [espetos] = useState(initial)
  const [selectedEspeto, setSelectedEspeto] = useState<EspetoCompleto | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [buscaBairro, setBuscaBairro] = useState('')
  const [bulkEntregadorId, setBulkEntregadorId] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)

  function closeModal() {
    setSelectedEspeto(null)
    router.refresh()
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleSelectAll() {
    if (selectedIds.length === espetosFiltrados.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(espetosFiltrados.map(e => e.id))
    }
  }

  async function bulkAssign() {
    if (!selectedIds.length || !bulkEntregadorId) return
    setBulkLoading(true)
    try {
      const res = await fetch('/api/espetos/bulk-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ espetoIds: selectedIds, entregadorId: bulkEntregadorId }),
      })
      if (res.ok) {
        setSelectedIds([])
        setBulkEntregadorId('')
        router.refresh()
      }
    } finally {
      setBulkLoading(false)
    }
  }

  const espetosFiltrados = buscaBairro.trim()
    ? espetos.filter(e =>
        e.cliente.bairro.toLowerCase().includes(buscaBairro.toLowerCase()) ||
        e.cliente.endereco.toLowerCase().includes(buscaBairro.toLowerCase())
      )
    : espetos

  const entregadoresCaminhao = entregadores.filter(e => e.tipo === 'CAMINHAO' && e.disponivel)

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
      {/* Filtro por bairro */}
      <div className="px-4 py-3 border-b border-gray-100">
        <input
          type="text"
          placeholder="🔍 Filtrar por bairro ou endereço..."
          value={buscaBairro}
          onChange={e => setBuscaBairro(e.target.value)}
          className="w-full sm:w-72 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400"
        />
        {buscaBairro && (
          <span className="ml-2 text-xs text-gray-400">
            {espetosFiltrados.length} resultado{espetosFiltrados.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="py-3 px-4">
                <input
                  type="checkbox"
                  checked={selectedIds.length === espetosFiltrados.length && espetosFiltrados.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-green-600"
                />
              </th>
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
            {espetosFiltrados.map((espeto) => (
              <tr
                key={espeto.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedIds.includes(espeto.id) ? 'bg-green-50' : ''
                }`}
              >
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(espeto.id)}
                    onChange={() => toggleSelect(espeto.id)}
                    className="rounded border-gray-300 text-green-600"
                  />
                </td>
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
                    <p className="text-xs text-gray-400 italic">
                      {espeto.tipo === 'MOTO' ? 'Pool motoboys' : 'Não designado'}
                    </p>
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
                    onClick={() => setSelectedEspeto(espeto)}
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

      {/* Barra de ação em lote — aparece quando há selecionados */}
      {selectedIds.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t-2 border-green-300 shadow-lg px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-green-700">
            {selectedIds.length} espeto{selectedIds.length !== 1 ? 's' : ''} selecionado{selectedIds.length !== 1 ? 's' : ''}
          </span>
          <select
            value={bulkEntregadorId}
            onChange={e => setBulkEntregadorId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">Selecionar caminhoneiro...</option>
            {entregadoresCaminhao.map(e => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
          <button
            onClick={bulkAssign}
            disabled={bulkLoading || !bulkEntregadorId}
            className="bg-green-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors"
          >
            {bulkLoading ? 'Atribuindo...' : '✅ Atribuir caminhão'}
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5"
          >
            Cancelar
          </button>
        </div>
      )}

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
