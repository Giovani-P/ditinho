import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { PeriodFilter } from '@/components/admin/PeriodFilter'
import { Suspense } from 'react'

type Period = 'diario' | 'semanal' | 'quinzenal' | 'mensal'

function calculateDateRange(periodo: Period) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const inicio = new Date(hoje)
  const mesLabel = (() => {
    if (periodo === 'diario') return hoje.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    if (periodo === 'semanal') return `Semana de ${new Date(hoje.getTime() - hoje.getDay() * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}`
    if (periodo === 'quinzenal') {
      const quinzenaNum = Math.ceil(hoje.getDate() / 15)
      return `${quinzenaNum}ª quinzena de ${hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
    }
    return hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  })()

  switch (periodo) {
    case 'diario':
      return { inicio: hoje, mesLabel }
    case 'semanal':
      inicio.setDate(hoje.getDate() - hoje.getDay())
      return { inicio, mesLabel }
    case 'quinzenal':
      const quinzenaInicio = Math.ceil(hoje.getDate() / 15)
      inicio.setDate((quinzenaInicio - 1) * 15 + 1)
      return { inicio, mesLabel }
    case 'mensal':
    default:
      inicio.setDate(1)
      return { inicio, mesLabel }
  }
}

async function RelatoriosContent({ periodo }: { periodo: Period }) {
  const session = await auth()
  if (!session || session.user.perfil !== 'ADMIN') redirect('/')

  const { inicio: inicioData, mesLabel } = calculateDateRange(periodo)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - hoje.getDay())

  const [
    pedidosPeriodo, pedidosSemana, pedidosHoje,
    faturamentoPeriodo, faturamentoSemana, faturamentoHoje,
    entreguesPeriodo, problemasPeriodo,
    pedidosPorStatus, entregadoresPerf,
    topClientes,
  ] = await Promise.all([
    prisma.pedido.count({ where: { createdAt: { gte: inicioData } } }),
    prisma.pedido.count({ where: { createdAt: { gte: inicioSemana } } }),
    prisma.pedido.count({ where: { createdAt: { gte: hoje } } }),

    prisma.pedido.aggregate({ _sum: { valor: true }, where: { createdAt: { gte: inicioData } } }),
    prisma.pedido.aggregate({ _sum: { valor: true }, where: { createdAt: { gte: inicioSemana } } }),
    prisma.pedido.aggregate({ _sum: { valor: true }, where: { createdAt: { gte: hoje } } }),

    prisma.espeto.count({ where: { status: 'ENTREGUE', updatedAt: { gte: inicioData } } }),
    prisma.espeto.count({ where: { status: 'PROBLEMA', updatedAt: { gte: inicioData } } }),

    prisma.pedido.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { createdAt: { gte: inicioData } },
    }),

    prisma.entregador.findMany({
      include: {
        user: { select: { nome: true } },
        espetos: {
          where: { updatedAt: { gte: inicioData } },
          select: { status: true },
        },
      },
    }),

    prisma.cliente.findMany({
      include: {
        _count: { select: { pedidos: true } },
        pedidos: {
          select: { valor: true },
          where: { createdAt: { gte: inicioData } },
        },
      },
      orderBy: { pedidos: { _count: 'desc' } },
      take: 10,
    }),
  ])

  const taxaEntrega = (entreguesPeriodo + problemasPeriodo) > 0
    ? ((entreguesPeriodo / (entreguesPeriodo + problemasPeriodo)) * 100).toFixed(1)
    : '—'

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500 text-sm mt-1">Dados de {mesLabel}</p>
      </div>

      {/* KPIs gerais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Pedidos" value={pedidosPeriodo} icon="📋" color="blue" subtitle={`${pedidosSemana} esta semana · ${pedidosHoje} hoje`} />
        <StatsCard title="Faturamento" value={`R$ ${(faturamentoPeriodo._sum.valor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon="💰" color="green" subtitle={`Semana: R$ ${(faturamentoSemana._sum.valor ?? 0).toFixed(2)}`} />
        <StatsCard title="Entregas OK" value={entreguesPeriodo} icon="✅" color="green" subtitle={`Taxa: ${taxaEntrega}%`} />
        <StatsCard title="Problemas" value={problemasPeriodo} icon="⚠️" color="red" subtitle="Entregas com problema neste período" />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Pedidos por status */}
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Pedidos por Status</h2></CardHeader>
          <CardContent>
            {pedidosPorStatus.length === 0 ? (
              <p className="text-gray-600 text-sm">Nenhum dado</p>
            ) : (
              <div className="space-y-3">
                {pedidosPorStatus.map(s => {
                  const total = pedidosPeriodo || 1
                  const pct = ((s._count._all / total) * 100).toFixed(0)
                  const cores: Record<string, string> = {
                    NOVO: 'bg-blue-500',
                    EM_SEPARACAO: 'bg-yellow-500',
                    AGUARDANDO_ENTREGA: 'bg-orange-500',
                    EM_ROTA: 'bg-purple-500',
                    ENTREGUE: 'bg-green-500',
                    CANCELADO: 'bg-red-500',
                  }
                  return (
                    <div key={s.status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{s.status.replace('_', ' ')}</span>
                        <span className="font-semibold">{s._count._all} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cores[s.status] ?? 'bg-gray-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance entregadores */}
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Performance Entregadores</h2></CardHeader>
          <CardContent>
            {entregadoresPerf.length === 0 ? (
              <p className="text-gray-600 text-sm">Nenhum entregador cadastrado</p>
            ) : (
              <div className="space-y-3">
                {entregadoresPerf.map(e => {
                  const total = e.espetos.length
                  const entregues = e.espetos.filter(s => s.status === 'ENTREGUE').length
                  const problemas = e.espetos.filter(s => s.status === 'PROBLEMA').length
                  const taxa = total > 0 ? ((entregues / total) * 100).toFixed(0) : '—'
                  return (
                    <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{e.user.nome}</p>
                        <p className="text-xs text-gray-600">{e.tipo === 'MOTO' ? '🏍️' : '🚚'} {e.tipo}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">{entregues}/{total}</p>
                        <p className={`text-xs ${problemas > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {taxa}% · {problemas} prob.
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top clientes */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Top Clientes</h2>
        </CardHeader>
        <CardContent className="p-0">
          {topClientes.filter(c => c.pedidos.length > 0).length === 0 ? (
            <p className="text-center py-8 text-gray-600">Nenhum pedido no mês</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">#</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Cliente</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Pedidos no Mês</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Total Gasto</th>
                </tr>
              </thead>
              <tbody>
                {topClientes
                  .filter(c => c.pedidos.length > 0)
                  .map((c, i) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-6 font-bold text-gray-600">{i + 1}</td>
                      <td className="py-3 px-6 font-medium text-gray-900">{c.nome}</td>
                      <td className="py-3 px-6">{c.pedidos.length} pedidos</td>
                      <td className="py-3 px-6 font-semibold text-green-600">
                        R$ {c.pedidos.reduce((acc, p) => acc + p.valor, 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default async function RelatoriosPage({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  const params = await searchParams
  const periodo = (params.periodo || 'mensal') as Period

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
      </div>

      <PeriodFilter />

      <Suspense fallback={<div className="text-center py-8">Carregando dados...</div>}>
        <RelatoriosContent periodo={periodo} />
      </Suspense>
    </div>
  )
}
