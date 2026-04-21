'use client'

import { useQuery } from '@tanstack/react-query'
import { EspetoPoolCard } from './EspetoPoolCard'
import { ConfirmarEntregaButton } from '@/components/entregador/ConfirmarEntregaButton'
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
  poolInicial: EspetoPool[]
  entregadorId: string
}

function pagamentoBadge(s: string) {
  if (s === 'PAGO') return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">💳 Pago (Pix)</span>
  if (s === 'A_PRAZO') return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">📝 A prazo</span>
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">💰 Receber na entrega</span>
}

export function PoolSeparacaoClient({ minhasEntregas, poolInicial, entregadorId }: Props) {
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
    <div className="px-4 py-4 space-y-6">
      {/* Minhas entregas já claimadas */}
      {minhasEntregas.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Minhas Entregas ({minhasEntregas.length})
          </p>
          <div className="space-y-3">
            {minhasEntregas.map(e => (
              <div key={e.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className={`px-4 py-2 flex items-center justify-between ${e.prioridade === 'HOJE' ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-700 text-sm">#{e.numero}</span>
                    {e.prioridade === 'HOJE' && <span className="text-xs text-red-600 font-medium">🔴 Urgente</span>}
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
                <ConfirmarEntregaButton espetoId={e.id} statusAtual={e.status} isMotoPool={false} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pool de separação */}
      {(livres.length > 0 || pegadasPorOutros.length > 0) && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
              🏍️ Pool — Separação ({livres.length} livres)
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>atualizado há {segundosAtras}s</span>
              <button onClick={() => refetch()} className="text-blue-500 underline">↻</button>
            </div>
          </div>
          <div className="space-y-3">
            {livres.map(e => (
              <EspetoPoolCard key={e.id} espeto={e} onClaimed={() => refetch()} />
            ))}
            {pegadasPorOutros.map(e => (
              <EspetoPoolCard key={e.id} espeto={e} onClaimed={() => refetch()} />
            ))}
          </div>
        </section>
      )}

      {minhasEntregas.length === 0 && livres.length === 0 && pegadasPorOutros.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">🎉</p>
          <p className="font-semibold text-lg">Tudo entregue!</p>
          <p className="text-sm">Nenhuma entrega pendente hoje</p>
        </div>
      )}
    </div>
  )
}
