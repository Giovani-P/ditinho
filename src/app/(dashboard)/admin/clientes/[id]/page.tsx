import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { pagamentoBadge, statusPedidoBadge } from '@/components/ui/Badge'

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || session.user.perfil !== 'ADMIN') redirect('/')

  const { id } = await params

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      pedidos: {
        orderBy: { createdAt: 'desc' },
        include: {
          espetos: { select: { numero: true, status: true, tipo: true } },
        },
      },
    },
  })

  if (!cliente) notFound()

  const totalGasto = cliente.pedidos.reduce((acc, p) => acc + p.valor, 0)

  // Agrupar produtos de todos os pedidos
  const todosProdutos = cliente.pedidos.flatMap(pedido => {
    try {
      const itens = JSON.parse(pedido.itens) as Array<{ nome: string; quantidade?: number; valor?: number; precoUnit?: number }>
      return itens.map(item => ({
        ...item,
        dataPedido: pedido.createdAt,
        pedidoNum: pedido.numeroCiss ?? `#${pedido.id.slice(-6).toUpperCase()}`,
      }))
    } catch {
      return []
    }
  }).sort((a, b) => new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime())

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <a href="/admin/clientes" className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 mb-2">
          ← Clientes
        </a>
        <h1 className="text-2xl font-bold text-gray-900">{cliente.nome}</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Pedidos</p>
            <p className="text-3xl font-bold text-gray-900">{cliente.pedidos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Total gasto</p>
            <p className="text-2xl font-bold text-green-600">R$ {totalGasto.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Cliente desde</p>
            <p className="text-lg font-bold text-gray-900">
              {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Produtos */}
      {todosProdutos.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="font-semibold text-gray-900">
              Histórico de Produtos ({todosProdutos.length})
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Produto</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Quantidade</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Valor Unit.</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Pedido</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {todosProdutos.map((produto, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">{produto.nome}</td>
                      <td className="py-3 px-4 text-gray-700">{produto.quantidade || '—'}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {produto.precoUnit ? `R$ ${Number(produto.precoUnit).toFixed(2)}` : produto.valor ? `R$ ${Number(produto.valor).toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-gray-600 text-xs">{produto.pedidoNum}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {new Date(produto.dataPedido).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-1">
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-900">Dados</h2></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {cliente.telefone && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Telefone</p>
                  <a href={`tel:${cliente.telefone}`} className="text-green-600 hover:underline">{cliente.telefone}</a>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Endereço</p>
                <p className="text-gray-900">{cliente.endereco}{cliente.numero ? `, ${cliente.numero}` : ''}</p>
                <p className="text-gray-500">{cliente.bairro}, {cliente.cidade}</p>
              </div>
              {cliente.referencia && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Referência</p>
                  <p className="text-gray-600 italic">{cliente.referencia}</p>
                </div>
              )}
              {cliente.observacoes && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Obs</p>
                  <p className="text-gray-600">{cliente.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-900">Histórico de Pedidos</h2></CardHeader>
            <CardContent className="p-0">
              {cliente.pedidos.length === 0 ? (
                <p className="text-center py-8 text-gray-400">Nenhum pedido</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-4 text-gray-500 font-medium">Pedido</th>
                      <th className="text-left py-2 px-4 text-gray-500 font-medium">Valor</th>
                      <th className="text-left py-2 px-4 text-gray-500 font-medium">Pagamento</th>
                      <th className="text-left py-2 px-4 text-gray-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cliente.pedidos.map(p => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-4">
                          <p className="font-mono font-semibold text-gray-700">
                            {p.numeroCiss ?? `#${p.id.slice(-6).toUpperCase()}`}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </td>
                        <td className="py-2 px-4 font-semibold text-gray-900">
                          R$ {p.valor.toFixed(2)}
                        </td>
                        <td className="py-2 px-4">{pagamentoBadge(p.statusPagamento)}</td>
                        <td className="py-2 px-4">{statusPedidoBadge(p.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
