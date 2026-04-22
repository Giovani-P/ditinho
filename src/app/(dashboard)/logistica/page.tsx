import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { EspetosTableClient } from '@/components/logistica/EspetosTableClient'
import { SeedTestButton } from '@/components/logistica/SeedTestButton'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ status?: string }>
}

const STATUS_FILTROS = [
  { value: 'EM_ROTA',   label: 'Em Rota',   icon: '🏍️', color: 'blue',   bg: 'bg-blue-50',   border: 'border-blue-300',  text: 'text-blue-700',   sub: 'Saíram para entregar' },
  { value: 'ENTREGUE',  label: 'Entregues', icon: '✅', color: 'green',  bg: 'bg-green-50',  border: 'border-green-300', text: 'text-green-700',  sub: 'Confirmados hoje' },
  { value: 'PENDENTE',  label: 'Pendentes', icon: '⏳', color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-300',text: 'text-yellow-700', sub: 'Aguardando saída' },
  { value: 'PROBLEMA',  label: 'Problemas', icon: '⚠️', color: 'red',    bg: 'bg-red-50',    border: 'border-red-300',   text: 'text-red-700',    sub: 'Requer atenção' },
]

export default async function LogisticaPage({ searchParams }: Props) {
  const session = await auth()
  if (!session || !['LOGISTICA', 'ADMIN'].includes(session.user.perfil)) redirect('/')

  const { status: filtroStatus } = await searchParams

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const [emRota, entregues, problemas, pendentes, espetos, entregadores] = await Promise.all([
    prisma.espeto.count({ where: { status: 'EM_ROTA' } }),
    prisma.espeto.count({ where: { status: 'ENTREGUE', updatedAt: { gte: hoje } } }),
    prisma.espeto.count({ where: { status: 'PROBLEMA' } }),
    prisma.espeto.count({ where: { status: 'PENDENTE' } }),
    prisma.espeto.findMany({
      where: {
        createdAt: { gte: hoje },
        ...(filtroStatus ? { status: filtroStatus } : {}),
      },
      orderBy: [{ prioridade: 'asc' }, { createdAt: 'asc' }],
      include: {
        cliente: { select: { nome: true, telefone: true, endereco: true, bairro: true } },
        entregador: { include: { user: { select: { nome: true } } } },
        pedido: { select: { itens: true, statusPagamento: true } },
        entrega: { select: { dataEntrega: true } },
      },
    }),
    prisma.entregador.findMany({
      include: { user: { select: { nome: true } } },
    }),
  ])

  const counts: Record<string, number> = {
    EM_ROTA: emRota,
    ENTREGUE: entregues,
    PENDENTE: pendentes,
    PROBLEMA: problemas,
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Logística</h1>
          <p className="text-gray-500 text-sm mt-1">
            Entregas de hoje — {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            🏍️ {entregadores.filter(e => e.tipo === 'MOTO' && e.disponivel).length} motos disponíveis
            &nbsp;&nbsp;
            🚚 {entregadores.filter(e => e.tipo === 'CAMINHAO' && e.disponivel).length} caminhões disponíveis
          </div>
          <SeedTestButton />
        </div>
      </div>

      {/* KPIs clicáveis */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATUS_FILTROS.map(f => {
          const ativo = filtroStatus === f.value
          return (
            <Link
              key={f.value}
              href={ativo ? '/logistica' : `/logistica?status=${f.value}`}
              className={`rounded-xl border-2 p-4 transition-all cursor-pointer select-none ${
                ativo
                  ? `${f.bg} ${f.border} shadow-md`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${ativo ? f.text : 'text-gray-600'}`}>{f.label}</span>
                <span className="text-2xl">{f.icon}</span>
              </div>
              <p className={`text-3xl font-bold ${ativo ? f.text : 'text-gray-900'}`}>{counts[f.value]}</p>
              <p className={`text-xs mt-1 ${ativo ? f.text : 'text-gray-400'}`}>{f.sub}</p>
              {ativo && (
                <p className="text-xs mt-2 font-medium opacity-70">{f.text.includes('text-') ? '✕ Remover filtro' : ''}</p>
              )}
            </Link>
          )
        })}
      </div>

      {/* Tabela espetos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {filtroStatus
                ? `${STATUS_FILTROS.find(f => f.value === filtroStatus)?.label ?? filtroStatus} (${espetos.length})`
                : `Espetos do Dia (${espetos.length})`}
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
