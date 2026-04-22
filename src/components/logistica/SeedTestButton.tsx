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
        setMsg(`✅ ${data.espetos?.length ?? 3} espetos de teste criados!`)
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
      {msg && <span className="text-sm text-gray-600">{msg}</span>}
    </div>
  )
}
