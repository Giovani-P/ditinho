import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { pagamentoBadge } from '@/components/ui/Badge'
import { AtualizarPagamentoButton } from '@/components/financeiro/AtualizarPagamentoButton'

export default async function FinanceiroPage() {
  const session = await auth()
  if (!session || !['FINANCEIRO', 'ADMIN'].includes(session.user.perfil)) redirect('/')

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

  const [totalPago, totalNaoPago, totalPendente, pedidosMes] = await Promise.all([
    prisma.pedido.aggregate({
      _sum: { valor: true },
      _count: { _all: true },
      where: { statusPagamento: 'PAGO', createdAt: { gte: inicioMes } },
    }),
    prisma.pedido.aggregate({
      _sum: { valor: true },
      _count: { _all: true },
      where: { statusPagamento: 'NAO_PAGO', createdAt: { gte: inicioMes } },
    }),
    prisma.pedido.aggregate({
      _sum: { valor: true },
      _count: { _all: true },
      where: { statusPagamento: 'PENDENTE', createdAt: { gte: inicioMes } },
    }),
    prisma.pedido.findMany({
      where: {
        createdAt: { gte: inicioMes },
        status: { not: 'CANCELADO' },
      },
      include: {
        cliente: { select: { nome: true, telefone: true } },
      },
      orderBy: [{ statusPagamento: 'asc' }, { createdAt: 'desc' }],
    }),
  ])

  const valorPago = totalPago._sum.valor ?? 0
  const valorNaoPago = totalNaoPago._sum.valor ?? 0
  const valorPendente = totalPendente._sum.valor ?? 0
  const totalGeral = valorPago + valorNaoPago + valorPendente
  const taxaRecebimento = totalGeral > 0 ? ((valorPago / totalGeral) * 100).toFixed(1) : '0'

  const mesLabel = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-500 text-sm mt-1">{mesLabel} · Taxa de recebimento: {taxaRecebimento}%</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Recebido"
          value={`R$ ${valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon="✅"
          color="green"
          subtitle={`${totalPago._count._all} pedidos pagos`}
        />
        <StatsCard
          title="A Receber"
          value={`R$ ${valorNaoPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon="❌"
          color="red"
          subtitle={`${totalNaoPago._count._all} pedidos não pagos`}
        />
        <StatsCard
          title="Pendente"
          value={`R$ ${valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon="⏳"
          color="yellow"
          subtitle={`${totalPendente._count._all} pedidos pendentes`}
        />
      </div>

      {/* Barra de progresso */}
      <Card className="mb-8">
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Faturamento total do mês</span>
            <span className="font-bold text-gray-900">
              R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
            {totalGeral > 0 && (
              <>
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${(valorPago / totalGeral) * 100}%` }}
                  title={`Pago: R$ ${valorPago.toFixed(2)}`}
                />
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${(valorPendente / totalGeral) * 100}%` }}
                  title={`Pendente: R$ ${valorPendente.toFixed(2)}`}
                />
                <div
                  className="h-full bg-red-400"
                  style={{ width: `${(valorNaoPago / totalGeral) * 100}%` }}
                  title={`Não pago: R$ ${valorNaoPago.toFixed(2)}`}
                />
              </>
            )}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Pago {taxaRecebimento}%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Pendente</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Não pago</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de pedidos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Pedidos do Mês</h2>
            <span className="text-xs text-gray-400">{pedidosMes.length} pedidos</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {pedidosMes.length === 0 ? (
            <p className="text-center py-10 text-gray-400">Nenhum pedido no mês</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Pedido</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Cliente</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Valor</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Pagamento</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {pedidosMes.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-mono font-semibold text-gray-700">
                        {p.numeroCiss ?? `#${p.id.slice(-6).toUpperCase()}`}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{p.cliente.nome}</p>
                      {p.cliente.telefone && (
                        <a href={`tel:${p.cliente.telefone}`} className="text-green-600 text-xs hover:underline">
                          {p.cliente.telefone}
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      R$ {p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">{pagamentoBadge(p.statusPagamento)}</td>
                    <td className="py-3 px-4">
                      {p.statusPagamento !== 'PAGO' && (
                        <AtualizarPagamentoButton pedidoId={p.id} statusAtual={p.statusPagamento} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
