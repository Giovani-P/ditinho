'use client'

import { statusEspetoBadge, pagamentoBadge } from '@/components/ui/Badge'
import type { EspetoCompleto } from '@/types'

interface EspetosTableProps {
  espetos: EspetoCompleto[]
  onStatusChange?: (id: string, status: string) => void
}

export function EspetosTable({ espetos, onStatusChange }: EspetosTableProps) {
  if (espetos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p className="text-4xl mb-2">📦</p>
        <p className="font-medium">Nenhum espeto encontrado</p>
        <p className="text-sm">Os espetos aparecerão aqui quando pedidos forem confirmados para entrega</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Cliente</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Endereço</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Veículo</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Entregador</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Prioridade</th>
            {onStatusChange && <th className="text-left py-3 px-4 font-semibold text-gray-600">Ação</th>}
          </tr>
        </thead>
        <tbody>
          {espetos.map((espeto) => (
            <tr key={espeto.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 font-mono font-bold text-gray-700">#{espeto.numero}</td>
              <td className="py-3 px-4">
                <p className="font-medium text-gray-900">{espeto.cliente.nome}</p>
                <p className="text-gray-600 text-xs">{espeto.cliente.telefone}</p>
              </td>
              <td className="py-3 px-4">
                <p className="text-gray-700">{espeto.cliente.endereco}</p>
                <p className="text-gray-600 text-xs">{espeto.cliente.bairro}</p>
              </td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  espeto.tipo === 'MOTO'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {espeto.tipo === 'MOTO' ? '🏍️' : '🚚'} {espeto.tipo}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-700">
                {espeto.entregador?.user.nome ?? (
                  <span className="text-gray-600 italic">Não designado</span>
                )}
              </td>
              <td className="py-3 px-4">{statusEspetoBadge(espeto.status)}</td>
              <td className="py-3 px-4">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  espeto.prioridade === 'HOJE'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {espeto.prioridade === 'HOJE' ? '🔴 Hoje' : '🟡 Amanhã'}
                </span>
              </td>
              {onStatusChange && espeto.status !== 'ENTREGUE' && (
                <td className="py-3 px-4">
                  <select
                    className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-900 bg-white"
                    value={espeto.status}
                    onChange={(e) => onStatusChange(espeto.id, e.target.value)}
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="EM_ROTA">Em Rota</option>
                    <option value="ENTREGUE">Entregue</option>
                    <option value="PROBLEMA">Problema</option>
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
