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
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ email: '', novaSenha: '' })

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

  async function salvarEdicao(id: string) {
    setLoadingId(id)
    try {
      await fetch(`/api/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editForm.email || undefined,
          senha: editForm.novaSenha || undefined,
        }),
      })
      setEditandoId(null)
      setEditForm({ email: '', novaSenha: '' })
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
                {editandoId === u.id ? (
                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder="Email"
                      value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                    />
                    <input
                      type="password"
                      placeholder="Nova senha"
                      value={editForm.novaSenha}
                      onChange={e => setEditForm({ ...editForm, novaSenha: e.target.value })}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => salvarEdicao(u.id)}
                        disabled={loading}
                        className="flex-1 text-xs bg-blue-600 text-white rounded px-2 py-1 disabled:opacity-50"
                      >
                        {loading ? '...' : 'Salvar'}
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="flex-1 text-xs border border-gray-200 rounded px-2 py-1"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : isCurrent ? (
                  <span className="text-xs text-gray-400 italic">Você</span>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditandoId(u.id)
                        setEditForm({ email: u.email, novaSenha: '' })
                      }}
                      className="flex-1 text-xs border border-blue-200 text-blue-600 hover:bg-blue-50 rounded px-2 py-1"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => toggleAtivo(u.id, u.ativo)}
                      disabled={loading}
                      className={`flex-1 text-xs rounded px-2 py-1 border transition-colors disabled:opacity-50 ${
                        u.ativo
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {loading ? '...' : u.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
