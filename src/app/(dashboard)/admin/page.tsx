import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { WhatsAppStatus } from '@/components/admin/WhatsAppStatus'
import { TourGuiado } from '@/components/tour/TourGuiado'
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient'

export default async function AdminPage() {
  const session = await auth()
  if (!session || session.user.perfil !== 'ADMIN') redirect('/')

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  const [pedidosHoje, espetosHoje, emRota, entregues, problemas, pendentes, espetos, pedidosDia, pedidosAgendados] =
    await Promise.all([
      prisma.pedido.count({ where: { createdAt: { gte: hoje } } }),
      prisma.espeto.count({ where: { createdAt: { gte: hoje } } }),
      prisma.espeto.count({ where: { status: 'EM_ROTA' } }),
      prisma.espeto.count({ where: { status: 'ENTREGUE', updatedAt: { gte: hoje } } }),
      prisma.espeto.count({ where: { status: 'PROBLEMA' } }),
      prisma.espeto.count({ where: { status: 'PENDENTE' } }),
      prisma.espeto.findMany({
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

      <AdminDashboardClient
        pedidosHoje={pedidosHoje}
        espetosHoje={espetosHoje}
        emRota={emRota}
        entregues={entregues}
        problemas={problemas}
        pendentes={pendentes}
        espetos={espetos as never}
        pedidosDia={pedidosDia as never}
        pedidosAgendados={pedidosAgendados as never}
      />
    </div>
  )
}
