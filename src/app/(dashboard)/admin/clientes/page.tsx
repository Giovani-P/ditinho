import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import Link from 'next/link'

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">{clientes.length} clientes cadastrados</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Lista de Clientes</h2>
        </CardHeader>
        <CardContent className="p-0">
          {clientes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">👥</p>
              <p>Nenhum cliente cadastrado</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Nome</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Telefone</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Endereço</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium">Pedidos</th>
                  <th className="text-left py-3 px-6 text-gray-500 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-6 font-medium text-gray-900">{c.nome}</td>
                    <td className="py-3 px-6 text-gray-600">
                      {c.telefone
                        ? <a href={`tel:${c.telefone}`} className="text-green-600 hover:underline">{c.telefone}</a>
                        : <span className="text-gray-400 italic text-xs">Sem telefone</span>
                      }
                    </td>
                    <td className="py-3 px-6">
                      <p className="text-gray-700">{c.endereco}</p>
                      <p className="text-gray-400 text-xs">{c.bairro}</p>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        c._count.pedidos > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {c._count.pedidos} pedido{c._count.pedidos !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <Link
                        href={`/admin/clientes/${c.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Ver histórico →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
