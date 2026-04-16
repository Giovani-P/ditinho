'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const perfis = [
  { value: 'VENDEDOR',   label: 'Vendedor' },
  { value: 'LOGISTICA',  label: 'Logística' },
  { value: 'ENTREGADOR', label: 'Entregador' },
  { value: 'FINANCEIRO', label: 'Financeiro' },
  { value: 'ADMIN',      label: 'Admin' },
]

export function NovoUsuarioForm() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [perfil, setPerfil] = useState('VENDEDOR')
  const [tipoEntregador, setTipoEntregador] = useState<'MOTO' | 'CAMINHAO'>('MOTO')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setEnviando(true)

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, perfil, tipoEntregador }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao criar usuário')
      }

      setSucesso(`Usuário ${nome} criado com sucesso!`)
      setNome('')
      setEmail('')
      setSenha('')
      setPerfil('VENDEDOR')
      router.refresh()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar usuário')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
          {erro}
        </div>
      )}
      {sucesso && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs">
          {sucesso}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Nome completo</label>
        <input
          type="text"
          required
          value={nome}
          onChange={e => setNome(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Nome do funcionário"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="email@ditinho.com"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Senha</label>
        <input
          type="password"
          required
          minLength={6}
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Perfil</label>
        <select
          value={perfil}
          onChange={e => setPerfil(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {perfis.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {perfil === 'ENTREGADOR' && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Tipo de veículo</label>
          <div className="grid grid-cols-2 gap-2">
            {(['MOTO', 'CAMINHAO'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTipoEntregador(t)}
                className={`py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                  tipoEntregador === t
                    ? t === 'MOTO'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t === 'MOTO' ? '🏍️ Moto' : '🚚 Caminhão'}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        {enviando ? 'Criando...' : '+ Criar Usuário'}
      </button>
    </form>
  )
}
