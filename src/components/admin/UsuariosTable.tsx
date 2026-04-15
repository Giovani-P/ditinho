'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Usuario {
  id: string
  nome: string
  email: string
  perfil: string
  ativo: boolean
  createdAt: Date
  entregador: { tipo: string; disponivel: boolean } | null
}

interface Props {
  usuarios: Usuario[]
  currentUserId: string
}

const perfilLabel: Record<string, { label: string; cor: string }> = {
  ADMIN:      { label: 'Admin',      cor: 'bg-purple-100 text-purple-700' },
  VENDEDOR:   { label: 'Vendedor',   cor: 'bg-blue-100 text-blue-700' },
  LOGISTICA:  { label: 'Logística',  cor: 'bg-teal-100 text-teal-700' },
  ENTREGADOR: { label: 'Entregador', cor: 'bg-orange-100 text-orange-700' },
  FINANCEIRO: { label: 'Financeiro', cor: 'bg-green-100 text-green-700' },
}

export function UsuariosTable({ usuarios, currentUserId }: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function toggleAtivo(id: string, ativo: boolean) {
    setLoadingId(id)
    try {
      await fetch(`/api/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !ativo }),
      })
      router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left py-3 px-4 text-gray-500 font-medium">Nome</th>
          <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
          <th className="text-left py-3 px-4 text-gray-500 font-medium">Perfil</th>
          <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
          <th className="text-left py-3 px-4 text-gray-500 font-medium">Ação</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map(u => {
          const loading = loadingId === u.id
          const isCurrent = u.id === currentUserId
          const p = perfilLabel[u.perfil] ?? { label: u.perfil, cor: 'bg-gray-100 text-gray-600' }

          return (
            <tr key={u.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${!u.ativo ? 'opacity-50' : ''}`}>
              <td className="py-3 px-4">
                <p className="font-medium text-gray-900">{u.nome}</p>
                {u.entregador && (
                  <p className="text-xs text-gray-400">{u.entregador.tipo === 'MOTO' ? '🏍️' : '🚚'} {u.entregador.tipo}</p>
                )}
              </td>
              <td className="py-3 px-4 text-gray-600">{u.email}</td>
              <td className="py-3 px-4">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.cor}`}>
                  {p.label}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  u.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {u.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="py-3 px-4">
                {isCurrent ? (
                  <span className="text-xs text-gray-400 italic">Você</span>
                ) : (
                  <button
                    onClick={() => toggleAtivo(u.id, u.ativo)}
                    disabled={loading}
                    className={`text-xs px-3 py-1 rounded-lg border transition-colors disabled:opacity-50 ${
                      u.ativo
                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                        : 'border-green-200 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {loading ? '...' : u.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
