'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Entregador {
  id: string
  nome: string
  tipo: string
}

interface Props {
  pedidoId: string
  entregadores: Entregador[]
}

export function CriarEspetoForm({ pedidoId, entregadores }: Props) {
  const router = useRouter()
  const [tipo, setTipo] = useState<'MOTO' | 'CAMINHAO'>('MOTO')
  const [prioridade, setPrioridade] = useState<'HOJE' | 'AMANHA'>('HOJE')
  const [entregadorId, setEntregadorId] = useState('')
  const [horarioEst, setHorarioEst] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const entregadoresFiltrados = entregadores.filter(e => e.tipo === tipo)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)

    try {
      const res = await fetch('/api/espetos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId,
          tipo,
          prioridade,
          entregadorId: entregadorId || null,
          horarioEst: horarioEst || null,
        }),
      })

      if (!res.ok) throw new Error('Erro ao criar espeto')
      router.push('/logistica')
      router.refresh()
    } catch {
      setErro('Erro ao criar espeto. Tente novamente.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {erro}
        </div>
      )}

      {/* Tipo de veículo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Veículo</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => { setTipo('MOTO'); setEntregadorId('') }}
            className={`py-4 rounded-xl border-2 text-center transition-colors ${
              tipo === 'MOTO'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <p className="text-3xl mb-1">🏍️</p>
            <p className="font-semibold text-sm">Moto</p>
            <p className="text-xs text-gray-400">Entregas menores</p>
          </button>
          <button
            type="button"
            onClick={() => { setTipo('CAMINHAO'); setEntregadorId('') }}
            className={`py-4 rounded-xl border-2 text-center transition-colors ${
              tipo === 'CAMINHAO'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <p className="text-3xl mb-1">🚚</p>
            <p className="font-semibold text-sm">Caminhão</p>
            <p className="text-xs text-gray-400">Cargas pesadas</p>
          </button>
        </div>
      </div>

      {/* Prioridade */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Prioridade</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPrioridade('HOJE')}
            className={`py-3 rounded-xl border-2 text-center transition-colors ${
              prioridade === 'HOJE'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <p className="text-xl mb-0.5">🔴</p>
            <p className="font-semibold text-sm">Hoje</p>
          </button>
          <button
            type="button"
            onClick={() => setPrioridade('AMANHA')}
            className={`py-3 rounded-xl border-2 text-center transition-colors ${
              prioridade === 'AMANHA'
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <p className="text-xl mb-0.5">🟡</p>
            <p className="font-semibold text-sm">Amanhã</p>
          </button>
        </div>
      </div>

      {/* Entregador */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Entregador <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        {entregadoresFiltrados.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-2">
            Nenhum entregador de {tipo === 'MOTO' ? 'moto' : 'caminhão'} disponível no momento
          </p>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setEntregadorId('')}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                !entregadorId ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="text-gray-500">Não designar agora</span>
            </button>
            {entregadoresFiltrados.map(e => (
              <button
                key={e.id}
                type="button"
                onClick={() => setEntregadorId(e.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                  entregadorId === e.id
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tipo === 'MOTO' ? '🏍️' : '🚚'} {e.nome}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Horário estimado */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Horário estimado <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        <input
          type="time"
          value={horarioEst}
          onChange={e => setHorarioEst(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {enviando ? 'Criando espeto...' : '📦 Criar Espeto de Entrega'}
      </button>
    </form>
  )
}
