import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { statusEspetoBadge, pagamentoBadge } from '@/components/ui/Badge'
import { WhatsAppStatus } from '@/components/admin/WhatsAppStatus'
import { TourGuiado } from '@/components/tour/TourGuiado'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ aba?: string }>
}

export default async function AdminPage({ searchParams }: Props) {
  const session = await auth()
  if (!session || session.user.perfil !== 'ADMIN') redirect('/')

  const { aba } = await searchParams
  const abaAtiva = aba === 'agendados' ? 'agendados' : 'dia'

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  const [pedidosHoje, espetosHoje, emRota, entregues, problemas, pendentes, ultimosEspetos, pedidosDia, pedidosAgendados] =
    await Promise.all([
      prisma.pedido.count({ where: { createdAt: { gte: hoje } } }),
      prisma.espeto.count({ where: { createdAt: { gte: hoje } } }),
      prisma.espeto.count({ where: { status: 'EM_ROTA' } }),
      prisma.espeto.count({ where: { status: 'ENTREGUE', updatedAt: { gte: hoje } } }),
      prisma.espeto.count({ where: { status: 'PROBLEMA' } }),
      prisma.espeto.count({ where: { status: 'PENDENTE' } }),
      prisma.espeto.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          cliente: { select: { nome: true, bairro: true } },
          entregador: { include: { user: { select: { nome: true } } } },
        },
      }),
      prisma.pedido.findMany({
        where: {
          OR: [
            { dataAgendada: null, createdAt: { gte: hoje } },
            { dataAgendada: { lt: amanha } },
          ],
          status: { notIn: ['CANCELADO'] },
        },
        include: { cliente: { select: { nome: true, bairro: true } } },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.pedido.findMany({
        where: {
          dataAgendada: { gte: amanha },
          status: { notIn: ['CANCELADO', 'ENTREGUE'] },
        },
        include: { cliente: { select: { nome: true, bairro: true } } },
        orderBy: { dataAgendada: 'asc' },
        take: 30,
      }),
    ])

  const pedidosExibidos = abaAtiva === 'agendados' ? pedidosAgendados : pedidosDia

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Geral</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TourGuiado />
          <WhatsAppStatus />
        </div>
      </div>

      {/* KPIs */}
      <div id="tour-kpis" className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatsCard title="Pedidos Hoje" value={pedidosHoje} icon="📋" color="blue" href="/vendedor" />
        <StatsCard title="Espetos Criados" value={espetosHoje} icon="📦" color="purple" href="/logistica" />
        <StatsCard title="Em Rota" value={emRota} icon="🏍️" color="yellow" href="/logistica?status=EM_ROTA" />
        <StatsCard title="Entregues" value={entregues} icon="✅" color="green" href="/logistica?status=ENTREGUE" />
        <StatsCard title="Pendentes" value={pendentes} icon="⏳" color="gray" href="/logistica?status=PENDENTE" />
        <StatsCard title="Problemas" value={problemas} icon="⚠️" color="red" href="/logistica?status=PROBLEMA" />
      </div>

      {/* Últimas entregas */}
      <Card id="tour-espetos" className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Espetos de Hoje</h2>
        </CardHeader>
        <CardContent className="p-0">
          {ultimosEspetos.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📦</p>
              <p>Nenhum espeto criado hoje</p>
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
                {ultimosEspetos.map((e) => (
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
              <Link
                href="/admin"
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  abaAtiva === 'dia'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📅 Do Dia ({pedidosDia.length})
              </Link>
              <Link
                href="/admin?aba=agendados"
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  abaAtiva === 'agendados'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📆 Agendados ({pedidosAgendados.length})
              </Link>
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
    </div>
  )
}
