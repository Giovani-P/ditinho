import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { LogoutButton } from '@/components/entregador/LogoutButton'
import { SeedPoolButton } from '@/components/moto/SeedPoolButton'
import { AppMotoTabs } from '@/components/moto/AppMotoTabs'
import { ReactQueryProvider } from '@/components/moto/ReactQueryProvider'

export default async function AppMotoPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!['ENTREGADOR', 'ADMIN'].includes(session.user.perfil)) redirect('/')

  const entregador = await prisma.entregador.findFirst({
    where: { userId: session.user.id },
  })

  if (entregador?.tipo === 'CAMINHAO') redirect('/app-caminhao')

  // Calcular "hoje" em UTC (mesma forma que o seed-pool endpoint)
  const agora = new Date()
  const ano = agora.getUTCFullYear()
  const mes = String(agora.getUTCMonth() + 1).padStart(2, '0')
  const dia = String(agora.getUTCDate()).padStart(2, '0')
  const hoje = new Date(`${ano}-${mes}-${dia}T00:00:00Z`)

  const [minhasEntregas, pool] = await Promise.all([
    // Entregas já claimadas por mim (em andamento)
    prisma.espeto.findMany({
      where: {
        entregadorId: entregador?.id,
        status: { in: ['PENDENTE', 'EM_ROTA'] },
        createdAt: { gte: hoje },
      },
      include: {
        cliente: { select: { nome: true, telefone: true, endereco: true, numero: true, bairro: true, referencia: true } },
        pedido: { select: { statusPagamento: true } },
      },
      orderBy: [{ prioridade: 'asc' }, { createdAt: 'asc' }],
    }),
    // Pool compartilhado de hoje (todos os MOTO PENDENTES)
    prisma.espeto.findMany({
      where: {
        tipo: 'MOTO',
        status: 'PENDENTE',
        createdAt: { gte: hoje },
      },
      include: {
        cliente: { select: { nome: true, telefone: true, endereco: true, numero: true, bairro: true, referencia: true } },
        pedido: { select: { statusPagamento: true } },
        entregador: { include: { user: { select: { nome: true } } } },
      },
      orderBy: [{ prioridade: 'asc' }, { createdAt: 'asc' }],
    }),
  ])

  const livresNoPool = pool.filter(e => !e.entregadorId)
  const totalEntregas = minhasEntregas.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header laranja — identidade visual moto */}
      <div className="bg-orange-500 text-white px-4 py-5 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-orange-200 text-xs">🏍️ App Motoboy</p>
            <p className="font-bold text-lg">{session.user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <SeedPoolButton />
            <LogoutButton />
          </div>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-orange-200 text-xs">Minhas entregas</p>
            <p className="font-bold text-2xl">{totalEntregas}</p>
          </div>
          {livresNoPool.length > 0 && (
            <div>
              <p className="text-orange-200 text-xs">Disponíveis no pool</p>
              <p className="font-bold text-2xl">{livresNoPool.length}</p>
            </div>
          )}
        </div>
      </div>

      <ReactQueryProvider>
        <AppMotoTabs
          minhasEntregas={minhasEntregas as never}
          poolInicial={pool as never}
          entregadorId={entregador?.id ?? ''}
        />
      </ReactQueryProvider>
    </div>
  )
}
