import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { EspetosTableClient } from '@/components/logistica/EspetosTableClient'

export default async function LogisticaPage() {
  const session = await auth()
  if (!session || !['LOGISTICA', 'ADMIN'].includes(session.user.perfil)) redirect('/')

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const [emRota, entregues, problemas, pendentes, espetos, entregadores] = await Promise.all([
    prisma.espeto.count({ where: { status: 'EM_ROTA' } }),
    prisma.espeto.count({ where: { status: 'ENTREGUE', updatedAt: { gte: hoje } } }),
    prisma.espeto.count({ where: { status: 'PROBLEMA' } }),
    prisma.espeto.count({ where: { status: 'PENDENTE' } }),
    prisma.espeto.findMany({
      where: { createdAt: { gte: hoje } },
      orderBy: [{ prioridade: 'asc' }, { createdAt: 'asc' }],
      include: {
        cliente: { select: { nome: true, telefone: true, endereco: true, bairro: true } },
        entregador: { include: { user: { select: { nome: true } } } },
      },
    }),
    prisma.entregador.findMany({
      include: { user: { select: { nome: true } } },
    }),
  ])

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Logística</h1>
          <p className="text-gray-500 text-sm mt-1">
            Entregas de hoje — {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          🏍️ {entregadores.filter(e => e.tipo === 'MOTO' && e.disponivel).length} motos disponíveis
          &nbsp;&nbsp;
          🚚 {entregadores.filter(e => e.tipo === 'CAMINHAO' && e.disponivel).length} caminhões disponíveis
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Em Rota" value={emRota} icon="🏍️" color="blue" subtitle="Saíram para entregar" />
        <StatsCard title="Entregues" value={entregues} icon="✅" color="green" subtitle="Confirmados hoje" />
        <StatsCard title="Pendentes" value={pendentes} icon="⏳" color="yellow" subtitle="Aguardando saída" />
        <StatsCard title="Problemas" value={problemas} icon="⚠️" color="red" subtitle="Requer atenção" />
      </div>

      {/* Tabela espetos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Espetos do Dia ({espetos.length})
            </h2>
            <div className="flex gap-2 text-xs">
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                🔴 Hoje: {espetos.filter(e => e.prioridade === 'HOJE').length}
              </span>
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                🟡 Amanhã: {espetos.filter(e => e.prioridade === 'AMANHA').length}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <EspetosTableClient
            espetos={espetos as never}
            entregadores={entregadores.map(e => ({
              id: e.id,
              nome: e.user.nome,
              tipo: e.tipo,
              disponivel: e.disponivel,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
