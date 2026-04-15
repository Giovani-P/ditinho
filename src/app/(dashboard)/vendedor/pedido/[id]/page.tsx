import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { pagamentoBadge, statusPedidoBadge } from '@/components/ui/Badge'
import { CriarEspetoForm } from '@/components/vendedor/CriarEspetoForm'

export default async function PedidoDecisaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || !['VENDEDOR', 'ADMIN'].includes(session.user.perfil)) redirect('/')

  const { id } = await params

  const [pedido, entregadores] = await Promise.all([
    prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: true,
        espetos: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.entregador.findMany({
      where: { disponivel: true },
      include: { user: { select: { nome: true } } },
    }),
  ])

  if (!pedido) notFound()

  const espetoExistente = pedido.espetos[0]
  let itens: { descricao: string; quantidade: number; valorUnit: number }[] = []
  try {
    itens = JSON.parse(pedido.itens)
  } catch { itens = [] }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <a href="/vendedor" className="text-gray-500 hover:text-gray-700 text-sm mb-2 flex items-center gap-1">
          ← Fila de Pedidos
        </a>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Pedido {pedido.numeroCiss ?? `#${pedido.id.slice(-6).toUpperCase()}`}
          </h1>
          <div className="flex gap-2">
            {pagamentoBadge(pedido.statusPagamento)}
            {statusPedidoBadge(pedido.status)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Info do cliente */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Cliente</h2>
          </CardHeader>
          <CardContent>
            <p className="font-bold text-gray-900 text-lg">{pedido.cliente.nome}</p>
            {pedido.cliente.telefone && (
              <a href={`tel:${pedido.cliente.telefone}`} className="text-green-600 text-sm hover:underline block mt-1">
                📞 {pedido.cliente.telefone}
              </a>
            )}
            <div className="mt-3 text-sm text-gray-600">
              <p>{pedido.cliente.endereco}</p>
              <p>{pedido.cliente.bairro}</p>
              {pedido.cliente.referencia && (
                <p className="text-gray-400 text-xs mt-1 italic">📍 {pedido.cliente.referencia}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumo financeiro */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Resumo</h2>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">R$ {pedido.valor.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {itens.length} {itens.length === 1 ? 'item' : 'itens'}
            </p>
            {pedido.observacoes && (
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                <p className="text-xs text-yellow-800">{pedido.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Itens */}
      {itens.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Itens</h2>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-4 text-gray-500 font-medium">Produto</th>
                  <th className="text-center py-2 px-4 text-gray-500 font-medium">Qtd</th>
                  <th className="text-right py-2 px-4 text-gray-500 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 px-4 text-gray-900">{item.descricao}</td>
                    <td className="py-2 px-4 text-center text-gray-600">{item.quantidade}</td>
                    <td className="py-2 px-4 text-right font-medium text-gray-900">
                      R$ {(item.quantidade * item.valorUnit).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Decisão de entrega */}
      {espetoExistente ? (
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 py-2">
              <span className="text-3xl">📦</span>
              <div>
                <p className="font-semibold text-gray-900">Espeto #{espetoExistente.numero} criado</p>
                <p className="text-sm text-gray-500">
                  {espetoExistente.tipo === 'MOTO' ? '🏍️ Moto' : '🚚 Caminhão'} ·{' '}
                  {espetoExistente.prioridade === 'HOJE' ? '🔴 Hoje' : '🟡 Amanhã'}
                </p>
              </div>
              <a
                href="/logistica"
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                Ver na Logística →
              </a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Definir Entrega</h2>
            <p className="text-sm text-gray-500 mt-0.5">Escolha como este pedido será entregue</p>
          </CardHeader>
          <CardContent>
            <CriarEspetoForm
              pedidoId={pedido.id}
              entregadores={entregadores.map(e => ({
                id: e.id,
                nome: e.user.nome,
                tipo: e.tipo,
              }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
