'use client'

import { useState } from 'react'

export function SeedPoolButton() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleCreateTestData = async () => {
    setLoading(true)
    setMsg('Criando dados de teste...')
    try {
      const res = await fetch('/api/test/seed-pool', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setMsg(`✅ ${data.estatisticas?.espetoCriados || 10} espetos criados!`)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMsg(`❌ Erro: ${data.error}`)
      }
    } catch {
      setMsg('❌ Falha na requisição')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCreateTestData}
        disabled={loading}
        className="text-sm bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        title="Criar 10 espetos de teste para simulação"
      >
        {loading ? '⏳ Criando...' : '🧪 Criar Testes'}
      </button>
      {msg && <span className="text-xs text-gray-600 whitespace-nowrap">{msg}</span>}
    </div>
  )
}

