'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SyncResult {
  importados: number
  ignorados: number
  erros: number
  configurado: boolean
  ultimoSync: string | null
}

export function CissSyncButton() {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [resultado, setResultado] = useState<SyncResult | null>(null)
  const [autoSync, setAutoSync] = useState(false)

  const sync = useCallback(async () => {
    if (syncing) return
    setSyncing(true)
    try {
      const res = await fetch('/api/ciss/sync', { method: 'POST' })
      const data = await res.json()
      setResultado(data)
      if (data.importados > 0) router.refresh()
    } catch {
      // falha silenciosa
    } finally {
      setSyncing(false)
    }
  }, [syncing, router])

  // Auto-sync a cada 10 segundos quando ativo
  useEffect(() => {
    if (!autoSync) return
    const interval = setInterval(sync, 10_000)
    return () => clearInterval(interval)
  }, [autoSync, sync])

  if (resultado && !resultado.configurado) {
    return (
      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg text-xs">
        <span>⚙️</span>
        <span>CISS não configurado — configure <code>CISS_BASE_URL</code> e <code>CISS_TOKEN</code></span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {resultado && (
        <span className="text-xs text-gray-500">
          {resultado.importados > 0 ? (
            <span className="text-green-600 font-medium">+{resultado.importados} novos</span>
          ) : resultado.erros > 0 ? (
            <span className="text-red-500">Erro no sync</span>
          ) : (
            <span>Sincronizado</span>
          )}
        </span>
      )}

      <button
        onClick={() => setAutoSync(v => !v)}
        className={`text-xs px-2 py-1 rounded border transition-colors ${
          autoSync
            ? 'bg-green-100 border-green-300 text-green-700'
            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
        }`}
        title="Auto-sync CISS a cada 10 segundos"
      >
        {autoSync ? '🔄 Auto ON' : '🔄 Auto'}
      </button>

      <button
        onClick={sync}
        disabled={syncing}
        className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
      >
        {syncing ? 'Sincronizando...' : '↓ Sync CISS'}
      </button>
    </div>
  )
}
