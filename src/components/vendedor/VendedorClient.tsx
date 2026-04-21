'use client'

import { useState, ReactNode } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { PedidosTable } from '@/components/dashboard/PedidosTable'
import type { PedidoComCliente } from '@/types'

interface Props {
  novos: number
  processados: number
  entregues: number
  pedidos: PedidoComCliente[]
  cissSync: ReactNode
}

type FiltroType = 'todos' | 'novos' | 'processando' | 'entregues'

export function VendedorClient({ novos, processados, entregues, pedidos, cissSync }: Props) {
  const [filtro, setFiltro] = useState<FiltroType>('novos')

  const pedidosFiltrados = pedidos.filter(p => {
    switch (filtro) {
      case 'novos':
        return p.status === 'NOVO'
      case 'processando':
        return ['AGUARDANDO_ENTREGA', 'EM_SEPARACAO'].includes(p.status)
      case 'entregues':
        return p.status === 'ENTREGUE'
      case 'todos':
      default:
        return true
    }
  })

  const titulos = {
    todos: `Todos os Pedidos (${pedidos.length})`,
    novos: `Novos Pedidos (${novos})`,
    processando: `Em Processamento (${processados})`,
    entregues: `Entregues (${entregues})`,
  }

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Novos"
          value={novos}
          icon="🔔"
          color="blue"
          subtitle="Aguardando ação"
          onClick={() => setFiltro('novos')}
          isActive={filtro === 'novos'}
        />
        <StatsCard
          title="Em Processamento"
          value={processados}
          icon="⚙️"
          color="yellow"
          subtitle="Hoje"
          onClick={() => setFiltro('processando')}
          isActive={filtro === 'processando'}
        />
        <StatsCard
          title="Entregues"
          value={entregues}
          icon="✅"
          color="green"
          subtitle="Hoje"
          onClick={() => setFiltro('entregues')}
          isActive={filtro === 'entregues'}
        />
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {titulos[filtro]}
            </h2>
            <div className="flex items-center gap-3">
              {cissSync}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {pedidosFiltrados.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p>Nenhum pedido nesta categoria</p>
            </div>
          ) : (
            <PedidosTable pedidos={pedidosFiltrados} />
          )}
        </CardContent>
      </Card>
    </>
  )
}
