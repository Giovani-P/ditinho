import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { ClientesTableClient } from '@/components/admin/ClientesTableClient'

export default async function ClientesPage() {
  const session = await auth()
  if (!session || session.user.perfil !== 'ADMIN') redirect('/')

  const clientes = await prisma.cliente.findMany({
    orderBy: { nome: 'asc' },
    include: {
      _count: { select: { pedidos: true } },
    },
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-500 text-sm mt-1">{clientes.length} clientes cadastrados</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Lista de Clientes</h2>
        </CardHeader>
        <CardContent className="p-0">
          <ClientesTableClient clientes={clientes} />
        </CardContent>
      </Card>
    </div>
  )
}
