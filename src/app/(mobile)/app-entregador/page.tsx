import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { statusEspetoBadge } from '@/components/ui/Badge'
import { ConfirmarEntregaButton } from '@/components/entregador/ConfirmarEntregaButton'

export default async function AppEntregadorPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!['ENTREGADOR', 'ADMIN'].includes(session.user.perfil)) redirect('/')

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const entregador = await prisma.entregador.findFirst({
    where: { userId: session.user.id },
  })

  const espetos = await prisma.espeto.findMany({
    where: {
      ...(entregador ? { entregadorId: entregador.id } : {}),
      status: { in: ['PENDENTE', 'EM_ROTA'] },
      createdAt: { gte: hoje },
    },
    include: {
      cliente: { select: { nome: true, telefone: true, endereco: true, numero: true, bairro: true, referencia: true } },
    },
    orderBy: [{ prioridade: 'asc' }, { createdAt: 'asc' }],
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mobile */}
      <div className="bg-green-600 text-white px-4 py-5 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-200 text-xs">Olá,</p>
            <p className="font-bold text-lg">{session.user.name}</p>
          </div>
          <div className="text-right">
            <p className="text-green-200 text-xs">Entregas hoje</p>
            <p className="font-bold text-2xl">{espetos.length}</p>
          </div>
        </div>
      </div>

      {/* Lista de espetos */}
      <div className="px-4 py-4 space-y-3">
        {espetos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🎉</p>
            <p className="font-semibold text-lg">Tudo entregue!</p>
            <p className="text-sm">Nenhuma entrega pendente para hoje</p>
          </div>
        ) : (
          espetos.map((espeto) => (
            <div key={espeto.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header card */}
              <div className={`px-4 py-2 flex items-center justify-between ${
                espeto.prioridade === 'HOJE' ? 'bg-red-50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-700 text-sm">#{espeto.numero}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    espeto.tipo === 'MOTO' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {espeto.tipo === 'MOTO' ? '🏍️' : '🚚'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {espeto.prioridade === 'HOJE' && (
                    <span className="text-xs text-red-600 font-medium">🔴 Urgente</span>
                  )}
                  {statusEspetoBadge(espeto.status)}
                </div>
              </div>

              {/* Conteúdo */}
              <div className="px-4 py-3">
                <p className="font-bold text-gray-900">{espeto.cliente.nome}</p>
                <p className="text-gray-600 text-sm mt-1">
                  {espeto.cliente.endereco}{espeto.cliente.numero ? `, ${espeto.cliente.numero}` : ''}
                </p>
                <p className="text-gray-500 text-xs">{espeto.cliente.bairro}</p>
                {espeto.cliente.referencia && (
                  <p className="text-gray-400 text-xs mt-1 italic">📍 {espeto.cliente.referencia}</p>
                )}
              </div>

              {/* Ações rápidas */}
              <div className="px-4 pb-2 flex gap-2">
                {espeto.cliente.telefone && (
                  <a
                    href={`tel:${espeto.cliente.telefone}`}
                    className="flex-1 bg-green-50 border border-green-200 text-green-700 text-sm font-medium py-2.5 rounded-xl text-center"
                  >
                    📞 Ligar
                  </a>
                )}
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${espeto.cliente.endereco}, ${espeto.cliente.bairro}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium py-2.5 rounded-xl text-center"
                >
                  🗺️ GPS
                </a>
              </div>
              {/* Confirmar entrega */}
              <ConfirmarEntregaButton espetoId={espeto.id} statusAtual={espeto.status} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
