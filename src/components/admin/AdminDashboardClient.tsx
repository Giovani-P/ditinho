'use client'

import { useState } from 'react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { statusEspetoBadge, pagamentoBadge } from '@/components/ui/Badge'

type StatusEspetoFiltro = 'todos' | 'EM_ROTA' | 'ENTREGUE' | 'PENDENTE' | 'PROBLEMA'

interface Espeto {
  id: string
  numero: number
  tipo: string
  status: string
  createdAt: Date
  cliente: { nome: string; bairro: string }
  entregador: { user: { nome: string } } | null
}

interface Pedido {
  id: string
  dataAgendada: Date | null
  createdAt: Date
  statusPagamento: string
  status: string
  cliente: { nome: string; bairro: string }
}

interface Props {
  pedidosHoje: number
  espetosHoje: number
  emRota: number
  entregues: number
  problemas: number
  pendentes: number
  espetos: Espeto[]
  pedidosDia: Pedido[]
  pedidosAgendados: Pedido[]
}

export function AdminDashboardClient({
  pedidosHoje,
  espetosHoje,
  emRota,
  entregues,
  problemas,
  pendentes,
  espetos,
  pedidosDia,
  pedidosAgendados,
}: Props) {
  const [filtroEspeto, setFiltroEspeto] = useState<StatusEspetoFiltro>('todos')
  const [abaAtiva, setAbaAtiva] = useState<'dia' | 'agendados'>('dia')

  const espetosFiltrados = filtroEspeto === 'todos'
    ? espetos
    : espetos.filter(e => e.status === filtroEspeto)

  const pedidosExibidos = abaAtiva === 'agendados' ? pedidosAgendados : pedidosDia

  const tituloEspetos = {
    todos: `Espetos de Hoje (${espetos.length})`,
    EM_ROTA: `Em Rota (${emRota})`,
    ENTREGUE: `Entregues (${entregues})`,
    PENDENTE: `Pendentes (${pendentes})`,
    PROBLEMA: `Problemas (${problemas})`,
  }

  return (
    <>
      {/* KPIs */}
      <div id="tour-kpis" className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatsCard
          title="Pedidos Hoje"
          value={pedidosHoje}
          icon="📋"
          color="blue"
          onClick={() => setFiltroEspeto('todos')}
          isActive={filtroEspeto === 'todos'}
        />
        <StatsCard
          title="Espetos Criados"
          value={espetosHoje}
          icon="📦"
          color="purple"
          onClick={() => setFiltroEspeto('todos')}
          isActive={false}
        />
        <StatsCard
          title="Em Rota"
          value={emRota}
          icon="🏍️"
          color="yellow"
          onClick={() => setFiltroEspeto('EM_ROTA')}
          isActive={filtroEspeto === 'EM_ROTA'}
        />
        <StatsCard
          title="Entregues"
          value={entregues}
          icon="✅"
          color="green"
          onClick={() => setFiltroEspeto('ENTREGUE')}
          isActive={filtroEspeto === 'ENTREGUE'}
        />
        <StatsCard
          title="Pendentes"
          value={pendentes}
          icon="⏳"
          color="gray"
          onClick={() => setFiltroEspeto('PENDENTE')}
          isActive={filtroEspeto === 'PENDENTE'}
        />
        <StatsCard
          title="Problemas"
          value={problemas}
          icon="⚠️"
          color="red"
          onClick={() => setFiltroEspeto('PROBLEMA')}
          isActive={filtroEspeto === 'PROBLEMA'}
        />
      </div>

      {/* Espetos filtrados */}
      <Card id="tour-espetos" className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">{tituloEspetos[filtroEspeto]}</h2>
        </CardHeader>
        <CardContent className="p-0">
          {espetosFiltrados.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📦</p>
              <p>Nenhum espeto nesta categoria</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">#</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Cliente</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Entregador</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Tipo</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {espetosFiltrados.map((e) => (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-6 font-mono font-bold text-gray-700">#{e.numero}</td>
                    <td className="py-3 px-6">
                      <p className="font-medium text-gray-900">{e.cliente.nome}</p>
                      <p className="text-gray-400 text-xs">{e.cliente.bairro}</p>
                    </td>
                    <td className="py-3 px-6 text-gray-700">
                      {e.entregador?.user.nome ?? <span className="text-gray-400 italic text-xs">Não designado</span>}
                    </td>
                    <td className="py-3 px-6">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        e.tipo === 'MOTO' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {e.tipo === 'MOTO' ? '🏍️' : '🚚'} {e.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-6">{statusEspetoBadge(e.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Pedidos — abas Do Dia / Agendados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Pedidos</h2>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setAbaAtiva('dia')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  abaAtiva === 'dia'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📅 Do Dia ({pedidosDia.length})
              </button>
              <button
                onClick={() => setAbaAtiva('agendados')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  abaAtiva === 'agendados'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📆 Agendados ({pedidosAgendados.length})
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {pedidosExibidos.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">{abaAtiva === 'agendados' ? '📆' : '📋'}</p>
              <p>{abaAtiva === 'agendados' ? 'Nenhum pedido agendado para datas futuras' : 'Nenhum pedido para hoje'}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Cliente</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">
                    {abaAtiva === 'agendados' ? 'Entregar em' : 'Criado em'}
                  </th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Pagamento</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pedidosExibidos.map((p) => {
                  const isAgendadoPromovido = abaAtiva === 'dia' && p.dataAgendada !== null
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-6">
                        <p className="font-medium text-gray-900">{p.cliente.nome}</p>
                        <p className="text-gray-400 text-xs">{p.cliente.bairro}</p>
                      </td>
                      <td className="py-3 px-6">
                        <p className="text-gray-700 text-sm">
                          {abaAtiva === 'agendados'
                            ? new Date(p.dataAgendada!).toLocaleDateString('pt-BR')
                            : new Date(p.createdAt).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                          }
                        </p>
                        {isAgendadoPromovido && (
                          <p className="text-xs text-purple-500 font-medium">
                            📆 Agendado — gerado em {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-6">{pagamentoBadge(p.statusPagamento)}</td>
                      <td className="py-3 px-6">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          p.status === 'NOVO' ? 'bg-blue-100 text-blue-700' :
                          p.status === 'ENTREGUE' ? 'bg-green-100 text-green-700' :
                          p.status === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </>
  )
}
