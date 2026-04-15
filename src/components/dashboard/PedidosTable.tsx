'use client'

import Link from 'next/link'
import { statusPedidoBadge, pagamentoBadge } from '@/components/ui/Badge'
import type { PedidoComCliente } from '@/types'

interface PedidosTableProps {
  pedidos: PedidoComCliente[]
  onCriarEspeto?: (pedidoId: string) => void
}

export function PedidosTable({ pedidos, onCriarEspeto }: PedidosTableProps) {
  if (pedidos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-2">🎉</p>
        <p className="font-medium">Nenhum pedido pendente</p>
        <p className="text-sm">Todos os pedidos foram processados!</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Pedido</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Cliente</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Endereço</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Valor</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Pagamento</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Ação</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <p className="font-mono font-bold text-gray-700">
                  {pedido.numeroCiss ?? `#${pedido.id.slice(-6).toUpperCase()}`}
                </p>
                <p className="text-gray-400 text-xs">
                  {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </td>
              <td className="py-3 px-4">
                <p className="font-medium text-gray-900">{pedido.cliente.nome}</p>
                <p className="text-gray-400 text-xs">{pedido.cliente.telefone}</p>
              </td>
              <td className="py-3 px-4">
                <p className="text-gray-700">{pedido.cliente.endereco}</p>
                <p className="text-gray-400 text-xs">{pedido.cliente.bairro}</p>
              </td>
              <td className="py-3 px-4 font-semibold text-gray-900">
                R$ {pedido.valor.toFixed(2)}
              </td>
              <td className="py-3 px-4">{pagamentoBadge(pedido.statusPagamento)}</td>
              <td className="py-3 px-4">{statusPedidoBadge(pedido.status)}</td>
              {pedido.status === 'NOVO' && (
                <td className="py-3 px-4">
                  <Link
                    href={`/vendedor/pedido/${pedido.id}`}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors inline-block"
                  >
                    Definir entrega →
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
