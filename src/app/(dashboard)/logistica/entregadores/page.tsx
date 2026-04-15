import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { DisponibilidadeToggle } from '@/components/logistica/DisponibilidadeToggle'

export default async function EntregadoresPage() {
  const session = await auth()
  if (!session || !['LOGISTICA', 'ADMIN'].includes(session.user.perfil)) redirect('/')

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const entregadores = await prisma.entregador.findMany({
    include: {
      user: { select: { nome: true, email: true, ativo: true } },
      espetos: {
        where: { createdAt: { gte: hoje } },
        select: { status: true, tipo: true },
      },
    },
    orderBy: { tipo: 'asc' },
  })

  const motos = entregadores.filter(e => e.tipo === 'MOTO')
  const caminhoes = entregadores.filter(e => e.tipo === 'CAMINHAO')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Entregadores</h1>
        <p className="text-gray-500 text-sm mt-1">
          {entregadores.filter(e => e.disponivel).length} disponíveis hoje
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Motos */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">🏍️ Motoqueiros ({motos.length})</h2>
          </CardHeader>
          <CardContent className="p-0">
            {motos.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">Nenhum motoqueiro cadastrado</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {motos.map(e => {
                  const entreguesHoje = e.espetos.filter(s => s.status === 'ENTREGUE').length
                  const emRota = e.espetos.filter(s => s.status === 'EM_ROTA').length
                  const pendentes = e.espetos.filter(s => s.status === 'PENDENTE').length
                  return (
                    <div key={e.id} className="px-4 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{e.user.nome}</p>
                        <p className="text-xs text-gray-400">{e.user.email}</p>
                        <div className="flex gap-3 mt-1.5">
                          <span className="text-xs text-green-600">{entreguesHoje} entregues</span>
                          {emRota > 0 && <span className="text-xs text-blue-600">{emRota} em rota</span>}
                          {pendentes > 0 && <span className="text-xs text-yellow-600">{pendentes} pendentes</span>}
                        </div>
                      </div>
                      <DisponibilidadeToggle
                        entregadorId={e.id}
                        disponivel={e.disponivel}
                        userAtivo={e.user.ativo}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Caminhões */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">🚚 Caminhoneiros ({caminhoes.length})</h2>
          </CardHeader>
          <CardContent className="p-0">
            {caminhoes.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">Nenhum caminhoneiro cadastrado</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {caminhoes.map(e => {
                  const entreguesHoje = e.espetos.filter(s => s.status === 'ENTREGUE').length
                  const emRota = e.espetos.filter(s => s.status === 'EM_ROTA').length
                  const pendentes = e.espetos.filter(s => s.status === 'PENDENTE').length
                  return (
                    <div key={e.id} className="px-4 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{e.user.nome}</p>
                        <p className="text-xs text-gray-400">{e.user.email}</p>
                        <div className="flex gap-3 mt-1.5">
                          <span className="text-xs text-green-600">{entreguesHoje} entregues</span>
                          {emRota > 0 && <span className="text-xs text-blue-600">{emRota} em rota</span>}
                          {pendentes > 0 && <span className="text-xs text-yellow-600">{pendentes} pendentes</span>}
                        </div>
                      </div>
                      <DisponibilidadeToggle
                        entregadorId={e.id}
                        disponivel={e.disponivel}
                        userAtivo={e.user.ativo}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
