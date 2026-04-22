'use client'

import { useQuery } from '@tanstack/react-query'
import { EspetoPoolCard } from './EspetoPoolCard'

interface EspetoPool {
  id: string
  numero: number | null
  prioridade: string
  status: string
  cliente: { nome: string; telefone: string | null; endereco: string; numero: string | null; bairro: string; referencia: string | null }
  pedido: { statusPagamento: string }
  entregador: { user: { nome: string } } | null
}

interface Props {
  poolInicial: EspetoPool[]
  entregadorId: string
}

export function PoolTab({ poolInicial, entregadorId }: Props) {
  const { data: pool = poolInicial, refetch, dataUpdatedAt } = useQuery<EspetoPool[]>({
    queryKey: ['pool-moto'],
    queryFn: () => fetch('/api/espetos/pool').then(r => r.json()),
    initialData: poolInicial,
    refetchInterval: 8000,
    staleTime: 3000,
  })

  const livres = pool.filter(e => !e.entregador)
  const pegadasPorOutros = pool.filter(e => e.entregador && e.entregador.user.nome !== undefined)
  const segundosAtras = Math.round((Date.now() - dataUpdatedAt) / 1000)

  return (
    <div className="space-y-4">
      {/* Header com contador e botão refresh */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900">Entregas Disponíveis</p>
          <p className="text-sm text-gray-500">{livres.length} aguardando entregador</p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
          title={`Atualizado há ${segundosAtras}s`}
        >
          ↻ Atualizar
        </button>
      </div>

      {/* Cards das entregas livres */}
      {livres.length > 0 ? (
        <div className="space-y-3">
          {livres.map(e => (
            <EspetoPoolCard key={e.id} espeto={e} onClaimed={() => refetch()} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gradient-to-b from-orange-50 to-transparent rounded-xl border border-orange-200">
          <p className="text-4xl mb-2">🎉</p>
          <p className="font-semibold text-gray-900">Parabéns!</p>
          <p className="text-sm text-gray-500">Todas as entregas foram pegadas</p>
        </div>
      )}

      {/* Entregas pegadas por outros */}
      {pegadasPorOutros.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            🚴 Já pegadas por outros ({pegadasPorOutros.length})
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            {pegadasPorOutros.map(e => (
              <div key={e.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                <span>#{e.numero} — {e.cliente.nome}</span>
                <span className="text-xs text-gray-400">{e.entregador?.user.nome}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
