'use client'

import { useEffect, useState } from 'react'

interface Status {
  configurado: boolean
  status: string
  instance?: string
}

export function WhatsAppStatus() {
  const [data, setData] = useState<Status | null>(null)

  useEffect(() => {
    fetch('/api/whatsapp/status')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) return null

  if (!data.configurado) {
    return (
      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg text-xs">
        <span className="w-2 h-2 rounded-full bg-yellow-400" />
        <span>WhatsApp não configurado — adicione as vars <code>EVOLUTION_*</code> no .env.local</span>
      </div>
    )
  }

  const online = data.status === 'open'

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${
      online
        ? 'bg-green-50 border-green-200 text-green-700'
        : 'bg-red-50 border-red-200 text-red-600'
    }`}>
      <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-red-400'}`} />
      <span>
        WhatsApp {online ? 'conectado' : `desconectado (${data.status})`}
        {data.instance && ` · ${data.instance}`}
      </span>
    </div>
  )
}
