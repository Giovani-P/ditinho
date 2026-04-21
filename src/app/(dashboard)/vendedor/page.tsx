import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { VendedorClient } from '@/components/vendedor/VendedorClient'
import { CissSyncButton } from '@/components/vendedor/CissSyncButton'

export default async function VendedorPage() {
  const session = await auth()
  if (!session || !['VENDEDOR', 'ADMIN'].includes(session.user.perfil)) redirect('/')

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const [novos, processados, entregues, todosOsPedidos] = await Promise.all([
    prisma.pedido.count({ where: { status: 'NOVO' } }),
    prisma.pedido.count({ where: { status: { in: ['AGUARDANDO_ENTREGA', 'EM_SEPARACAO'] }, createdAt: { gte: hoje } } }),
    prisma.pedido.count({ where: { status: 'ENTREGUE', createdAt: { gte: hoje } } }),
    prisma.pedido.findMany({
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
      take: 100,
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

      <VendedorClient
        novos={novos}
        processados={processados}
        entregues={entregues}
        pedidos={todosOsPedidos as never}
        cissSync={<CissSyncButton />}
      />
    </div>
  )
}
