'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConfirmarEntregaButton } from '@/components/entregador/ConfirmarEntregaButton'
import { statusEspetoBadge } from '@/components/ui/Badge'
import { TransferirEntregaModal } from './TransferirEntregaModal'

interface EspetoMinha {
  id: string
  numero: number | null
  prioridade: string
  status: string
  cliente: { nome: string; telefone: string | null; endereco: string; numero: string | null; bairro: string; referencia: string | null }
  pedido: { statusPagamento: string }
}

interface Props {
  minhasEntregas: EspetoMinha[]
}

function pagamentoBadge(s: string) {
  if (s === 'PAGO') return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">💳 Pago (Pix)</span>
  if (s === 'A_PRAZO') return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">📝 A prazo</span>
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">💰 Receber na entrega</span>
}

export function MinhasEntregasTab({ minhasEntregas }: Props) {
  const router = useRouter()
  const [espetoTransferencia, setEspetoTransferencia] = useState<EspetoMinha | null>(null)
  const [entregasAtualizadas, setEntregasAtualizadas] = useState(minhasEntregas)

  const entregasHoje = entregasAtualizadas.filter(e => e.prioridade === 'HOJE')
  const entregasAmanha = entregasAtualizadas.filter(e => e.prioridade === 'AMANHA')

  const handleTransferirConfirm = async (motoId: string) => {
    if (!espetoTransferencia) return

    try {
      const res = await fetch(`/api/espetos/${espetoTransferencia.id}/transferir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novoEntregadorId: motoId }),
      })

      if (!res.ok) throw new Error('Erro ao transferir')

      // Remover da lista local
      setEntregasAtualizadas(prev => prev.filter(e => e.id !== espetoTransferencia.id))
      setEspetoTransferencia(null)
      router.refresh()
    } catch (error) {
      console.error('Erro ao transferir:', error)
      throw error
    }
  }

  return (
    <div className="space-y-4">
      {minhasEntregas.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-b from-blue-50 to-transparent rounded-xl border border-blue-200">
          <p className="text-4xl mb-2">📭</p>
          <p className="font-semibold text-gray-900">Sem entregas no momento</p>
          <p className="text-sm text-gray-500">Volte para o Pool e pegue algumas</p>
        </div>
      ) : (
        <>
          {/* Entregas de hoje */}
          {entregasHoje.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">
                🔴 HOJE ({entregasHoje.length})
              </p>
              <div className="space-y-3">
                {entregasHoje.map(e => (
                  <div key={e.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-2 flex items-center justify-between bg-red-50">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-700 text-sm">#{e.numero}</span>
                        <span className="text-xs text-red-600 font-medium">Urgente</span>
                      </div>
                      {statusEspetoBadge(e.status)}
                    </div>
                    <div className="px-4 py-3">
                      <p className="font-bold text-gray-900">{e.cliente.nome}</p>
                      <p className="text-gray-600 text-sm mt-1">{e.cliente.endereco}{e.cliente.numero ? `, ${e.cliente.numero}` : ''}</p>
                      <p className="text-gray-500 text-xs">{e.cliente.bairro}</p>
                      {e.cliente.referencia && <p className="text-gray-400 text-xs mt-1 italic">📍 {e.cliente.referencia}</p>}
                      <div className="mt-2">{pagamentoBadge(e.pedido.statusPagamento)}</div>
                    </div>
                    <div className="px-4 pb-2 flex gap-2">
                      {e.cliente.telefone && (
                        <a href={`tel:${e.cliente.telefone}`} className="flex-1 bg-green-50 border border-green-200 text-green-700 text-sm font-medium py-2.5 rounded-xl text-center">📞 Ligar</a>
                      )}
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(`${e.cliente.endereco}, ${e.cliente.bairro}`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium py-2.5 rounded-xl text-center"
                      >🗺️ GPS</a>
                    </div>
                    <div className="px-4 pb-2">
                      <ConfirmarEntregaButton espetoId={e.id} statusAtual={e.status} isMotoPool={false} />
                      <button
                        onClick={() => setEspetoTransferencia(e)}
                        className="w-full mt-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-sm font-medium py-2 rounded-lg transition-colors"
                      >
                        🔄 Transferir Entrega
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entregas para amanhã */}
          {entregasAmanha.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wide mb-3 mt-6 pt-6 border-t border-gray-200">
                🟡 AMANHÃ ({entregasAmanha.length})
              </p>
              <div className="space-y-3">
                {entregasAmanha.map(e => (
                  <div key={e.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-2 flex items-center justify-between bg-gray-50">
                      <span className="font-mono font-bold text-gray-700 text-sm">#{e.numero}</span>
                      {statusEspetoBadge(e.status)}
                    </div>
                    <div className="px-4 py-3">
                      <p className="font-bold text-gray-900">{e.cliente.nome}</p>
                      <p className="text-gray-600 text-sm mt-1">{e.cliente.endereco}{e.cliente.numero ? `, ${e.cliente.numero}` : ''}</p>
                      <p className="text-gray-500 text-xs">{e.cliente.bairro}</p>
                      {e.cliente.referencia && <p className="text-gray-400 text-xs mt-1 italic">📍 {e.cliente.referencia}</p>}
                      <div className="mt-2">{pagamentoBadge(e.pedido.statusPagamento)}</div>
                    </div>
                    <div className="px-4 pb-2 flex gap-2">
                      {e.cliente.telefone && (
                        <a href={`tel:${e.cliente.telefone}`} className="flex-1 bg-green-50 border border-green-200 text-green-700 text-sm font-medium py-2.5 rounded-xl text-center">📞 Ligar</a>
                      )}
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(`${e.cliente.endereco}, ${e.cliente.bairro}`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium py-2.5 rounded-xl text-center"
                      >🗺️ GPS</a>
                    </div>
                    <div className="px-4 pb-2">
                      <ConfirmarEntregaButton espetoId={e.id} statusAtual={e.status} isMotoPool={false} />
                      <button
                        onClick={() => setEspetoTransferencia(e)}
                        className="w-full mt-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-sm font-medium py-2 rounded-lg transition-colors"
                      >
                        🔄 Transferir Entrega
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <TransferirEntregaModal
        isOpen={!!espetoTransferencia}
        onClose={() => setEspetoTransferencia(null)}
        onConfirm={handleTransferirConfirm}
      />
    </div>
  )
}
