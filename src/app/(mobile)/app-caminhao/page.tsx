import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { LogoutButton } from '@/components/entregador/LogoutButton'
import { ConfirmarEntregaButton } from '@/components/entregador/ConfirmarEntregaButton'
import { statusEspetoBadge } from '@/components/ui/Badge'

function pagamentoBadge(s: string) {
  if (s === 'PAGO') return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">💳 Pago (Pix)</span>
  if (s === 'A_PRAZO') return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">📝 A prazo — assinar via</span>
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">💰 Receber na entrega</span>
}

export default async function AppCaminhaoPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!['ENTREGADOR', 'ADMIN'].includes(session.user.perfil)) redirect('/')

  const entregador = await prisma.entregador.findFirst({
    where: { userId: session.user.id },
  })

  if (entregador?.tipo === 'MOTO') redirect('/app-moto')

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const entregas = await prisma.espeto.findMany({
    where: {
      entregadorId: entregador?.id,
      tipo: 'CAMINHAO',
      status: { in: ['PENDENTE', 'EM_ROTA'] },
      createdAt: { gte: hoje },
    },
    include: {
      cliente: { select: { nome: true, telefone: true, endereco: true, numero: true, bairro: true, referencia: true } },
      pedido: { select: { statusPagamento: true } },
    },
    orderBy: [{ prioridade: 'asc' }, { createdAt: 'asc' }],
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header azul — identidade visual caminhão */}
      <div className="bg-blue-700 text-white px-4 py-5 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-blue-200 text-xs">🚚 App Caminhão</p>
            <p className="font-bold text-lg">{session.user.name}</p>
          </div>
          <LogoutButton />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-xs">Entregas hoje</p>
            <p className="font-bold text-2xl">{entregas.length}</p>
          </div>
          <form action="">
            <button type="submit" className="text-sm bg-blue-600 border border-blue-400 text-white px-3 py-1.5 rounded-lg">
              ↻ Recarregar
            </button>
          </form>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {entregas.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🎉</p>
            <p className="font-semibold text-lg">Tudo entregue!</p>
            <p className="text-sm">Nenhuma entrega pendente hoje</p>
          </div>
        ) : (
          entregas.map(e => (
            <div key={e.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className={`px-4 py-2 flex items-center justify-between ${e.prioridade === 'HOJE' ? 'bg-red-50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-700 text-sm">#{e.numero}</span>
                  {e.prioridade === 'HOJE' && <span className="text-xs text-red-600 font-medium">🔴 Urgente</span>}
                </div>
                {statusEspetoBadge(e.status)}
              </div>

              <div className="px-4 py-3">
                <p className="font-bold text-gray-900">{e.cliente.nome}</p>
                <p className="text-gray-600 text-sm mt-1">
                  {e.cliente.endereco}{e.cliente.numero ? `, ${e.cliente.numero}` : ''}
                </p>
                <p className="text-gray-500 text-xs">{e.cliente.bairro}</p>
                {e.cliente.referencia && <p className="text-gray-400 text-xs mt-1 italic">📍 {e.cliente.referencia}</p>}
                <div className="mt-2">{pagamentoBadge(e.pedido.statusPagamento)}</div>
              </div>

              <div className="px-4 pb-2 flex gap-2">
                {e.cliente.telefone && (
                  <a href={`tel:${e.cliente.telefone}`} className="flex-1 bg-green-50 border border-green-200 text-green-700 text-sm font-medium py-2.5 rounded-xl text-center">
                    📞 Ligar
                  </a>
                )}
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${e.cliente.endereco}, ${e.cliente.bairro}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium py-2.5 rounded-xl text-center"
                >
                  🗺️ GPS
                </a>
              </div>

              <ConfirmarEntregaButton espetoId={e.id} statusAtual={e.status} isMotoPool={false} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
