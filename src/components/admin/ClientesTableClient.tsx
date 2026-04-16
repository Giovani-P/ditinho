'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Cliente {
  id: string
  nome: string
  telefone: string | null
  endereco: string
  bairro: string
  _count: { pedidos: number }
}

interface Props {
  clientes: Cliente[]
}

export function ClientesTableClient({ clientes }: Props) {
  const [busca, setBusca] = useState('')

  const filtrados = busca.trim()
    ? clientes.filter(c =>
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (c.telefone ?? '').includes(busca) ||
        c.bairro.toLowerCase().includes(busca.toLowerCase()) ||
        c.endereco.toLowerCase().includes(busca.toLowerCase())
      )
    : clientes

  return (
    <div>
      {/* Barra de busca */}
      <div className="px-6 py-4 border-b border-gray-100">
        <input
          type="text"
          placeholder="🔍 Buscar por nome, telefone, bairro ou endereço..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full sm:w-96 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400"
        />
        {busca && (
          <p className="text-xs text-gray-400 mt-1">
            {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''} de {clientes.length}
          </p>
        )}
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p>{busca ? 'Nenhum cliente encontrado para esta busca' : 'Nenhum cliente cadastrado'}</p>
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
            {filtrados.map(c => (
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
                  <Link href={`/admin/clientes/${c.id}`} className="text-xs text-blue-600 hover:underline">
                    Ver histórico →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
