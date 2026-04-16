import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { statusEspetoBadge, pagamentoBadge } from '@/components/ui/Badge'

export default async function EspetoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || !['LOGISTICA', 'ADMIN'].includes(session.user.perfil)) redirect('/')

  const { id } = await params

  const espeto = await prisma.espeto.findUnique({
    where: { id },
    include: {
      cliente: true,
      entregador: { include: { user: { select: { nome: true, email: true } } } },
      pedido: true,
      entrega: true,
    },
  })

  if (!espeto) notFound()

  let itens: { descricao: string; quantidade: number; valorUnit: number }[] = []
  try { itens = JSON.parse(espeto.pedido.itens) } catch { itens = [] }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <a href="/logistica" className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 mb-2">
          ← Logística
        </a>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Espeto #{espeto.numero}</h1>
          <div className="flex gap-2 items-center">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              espeto.prioridade === 'HOJE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {espeto.prioridade === 'HOJE' ? '🔴 Hoje' : '🟡 Amanhã'}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              espeto.tipo === 'MOTO' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {espeto.tipo === 'MOTO' ? '🏍️ Moto' : '🚚 Caminhão'}
            </span>
            {statusEspetoBadge(espeto.status)}
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-1">
          Criado em {new Date(espeto.createdAt).toLocaleString('pt-BR')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Cliente */}
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Cliente</h2></CardHeader>
          <CardContent>
            <p className="font-bold text-gray-900 text-lg">{espeto.cliente.nome}</p>
            {espeto.cliente.telefone && (
              <a href={`tel:${espeto.cliente.telefone}`} className="text-green-600 text-sm hover:underline block mt-1">
                📞 {espeto.cliente.telefone}
              </a>
            )}
            <div className="mt-3 text-sm text-gray-600 space-y-0.5">
              <p>{espeto.cliente.endereco}{espeto.cliente.numero ? `, ${espeto.cliente.numero}` : ''}</p>
              <p className="text-gray-500">{espeto.cliente.bairro}</p>
              {espeto.cliente.referencia && (
                <p className="text-gray-400 text-xs italic mt-1">📍 {espeto.cliente.referencia}</p>
              )}
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                `${espeto.cliente.endereco}, ${espeto.cliente.bairro}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg"
            >
              🗺️ Abrir no Maps
            </a>
          </CardContent>
        </Card>

        {/* Pagamento + Entregador */}
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Pedido</h2></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-2xl font-bold text-gray-900">R$ {espeto.pedido.valor.toFixed(2)}</p>
              {pagamentoBadge(espeto.pedido.statusPagamento)}
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Pedido {espeto.pedido.numeroCiss ?? `#${espeto.pedido.id.slice(-6).toUpperCase()}`} · {espeto.pedido.origem}
            </p>

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Entregador</p>
            {espeto.entregador ? (
              <p className="font-medium text-gray-900">{espeto.entregador.user.nome}</p>
            ) : (
              <p className="text-gray-400 text-sm italic">Não designado</p>
            )}

            {(espeto.horarioApos || espeto.horarioAte) && (
              <p className="mt-2 text-sm text-gray-600">
                🕐 Janela: {espeto.horarioApos || '--:--'} – {espeto.horarioAte || '--:--'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Itens */}
      {itens.length > 0 && (
        <Card className="mb-6">
          <CardHeader><h2 className="font-semibold text-gray-900">Itens</h2></CardHeader>
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
                    <td className="py-2 px-4 text-right font-medium">
                      R$ {(item.quantidade * item.valorUnit).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Comprovante de entrega */}
      {espeto.entrega && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Comprovante de Entrega</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Entregue em {new Date(espeto.entrega.dataEntrega).toLocaleString('pt-BR')}
            </p>
            {espeto.entrega.fotoUrl && (
              <img
                src={espeto.entrega.fotoUrl}
                alt="Foto da entrega"
                className="w-full rounded-lg object-cover max-h-64"
              />
            )}
            {espeto.entrega.observacoes && (
              <p className="mt-3 text-sm text-gray-600 italic">{espeto.entrega.observacoes}</p>
            )}
            {espeto.entrega.gpsLat && espeto.entrega.gpsLng && (
              <a
                href={`https://maps.google.com/?q=${espeto.entrega.gpsLat},${espeto.entrega.gpsLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs text-blue-600 hover:underline"
              >
                📍 Ver localização GPS
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {espeto.observacoes && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
          <p className="text-sm text-yellow-800">⚠️ {espeto.observacoes}</p>
        </div>
      )}
    </div>
  )
}
