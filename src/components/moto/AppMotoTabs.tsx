'use client'

import { useState } from 'react'
import { PoolTab } from './PoolTab'
import { MinhasEntregasTab } from './MinhasEntregasTab'

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

export function AppMotoTabs({ minhasEntregas, poolInicial, entregadorId }: Props) {
  const [aba, setAba] = useState<'pool' | 'minhas'>('pool')

  return (
    <div className="pb-20">
      {/* Tabs */}
      <div className="sticky top-16 z-20 bg-white border-b border-gray-200 px-4 flex gap-0">
        <button
          onClick={() => setAba('pool')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            aba === 'pool'
              ? 'text-orange-600 border-orange-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          🏍️ Pool
        </button>
        <button
          onClick={() => setAba('minhas')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            aba === 'minhas'
              ? 'text-orange-600 border-orange-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          📦 Minhas Entregas
        </button>
      </div>

      {/* Conteúdo das abas */}
      <div className="px-4 py-4">
        {aba === 'pool' && <PoolTab poolInicial={poolInicial} entregadorId={entregadorId} />}
        {aba === 'minhas' && <MinhasEntregasTab minhasEntregas={minhasEntregas} />}
      </div>
    </div>
  )
}
