import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { PedidosTable } from '@/components/dashboard/PedidosTable'
import { CissSyncButton } from '@/components/vendedor/CissSyncButton'

export default async function VendedorPage() {
  const session = await auth()
  if (!session || !['VENDEDOR', 'ADMIN'].includes(session.user.perfil)) redirect('/')

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const [novos, processados, entregues, pedidos] = await Promise.all([
    prisma.pedido.count({ where: { status: 'NOVO' } }),
    prisma.pedido.count({ where: { status: { in: ['AGUARDANDO_ENTREGA', 'EM_SEPARACAO'] }, createdAt: { gte: hoje } } }),
    prisma.pedido.count({ where: { status: 'ENTREGUE', createdAt: { gte: hoje } } }),
    prisma.pedido.findMany({
      where: { status: 'NOVO' },
      select: {
        id: true,
        numeroCiss: true,
        valor: true,
        itens: true,
        statusPagamento: true,
        tipo: true,
        origem: true,
        status: true,
        createdAt: true,
        cliente: { select: { id: true, nome: true, telefone: true, endereco: true, bairro: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Fila de Pedidos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Pedidos aguardando processamento — {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatsCard title="Novos" value={novos} icon="🔔" color="blue" subtitle="Aguardando ação" />
        <StatsCard title="Em Processamento" value={processados} icon="⚙️" color="yellow" subtitle="Hoje" />
        <StatsCard title="Entregues" value={entregues} icon="✅" color="green" subtitle="Hoje" />
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Novos Pedidos ({novos})
            </h2>
            <div className="flex items-center gap-3">
              <CissSyncButton />
              <a
                href="/vendedor/novo-pedido"
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                + Novo Pedido Manual
              </a>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <PedidosTable pedidos={pedidos as never} />
        </CardContent>
      </Card>
    </div>
  )
}
