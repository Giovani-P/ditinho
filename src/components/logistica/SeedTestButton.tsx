'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SeedTestButton() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  async function handleSeed() {
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('/api/test/seed-pool', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setMsg(`✅ ${data.estatisticas?.espetoCriados ?? 10} espetos criados! (${data.estatisticas?.espetoHoje} hoje + ${data.estatisticas?.espetoAmanha} amanhã)`)
        router.refresh()
      } else {
        setMsg(`❌ Erro: ${data.error}`)
      }
    } catch {
      setMsg('❌ Falha na requisição')
    } finally {
      setLoading(false)
    }
  }

  async function handleCleanup() {
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('/api/test/cleanup-pool', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setMsg(`✅ Removidos ${data.deletedPedidos} pedidos e ${data.deletedClientes} clientes de teste`)
        router.refresh()
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
    <div className="flex items-center gap-3">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="text-sm bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        {loading ? 'Criando...' : '🧪 Criar dados de teste'}
      </button>
      <button
        onClick={handleCleanup}
        disabled={loading}
        className="text-sm bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        title="Remove todos os dados de teste criados"
      >
        {loading ? 'Limpando...' : '🗑️ Limpar'}
      </button>
      {msg && <span className="text-sm text-gray-600">{msg}</span>}
    </div>
  )
}
