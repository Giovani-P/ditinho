'use client'

interface Espeto {
  id: string
  startedAt?: Date | string | null
  completedAt?: Date | string | null
  status: string
}

export function TempoEntrega({ espeto }: { espeto: Espeto }) {
  if (!espeto.startedAt) {
    return <span className="text-xs text-gray-400">Aguardando saída</span>
  }

  const inicio = new Date(espeto.startedAt)
  const fim = espeto.completedAt ? new Date(espeto.completedAt) : new Date()
  const minutos = Math.round((fim.getTime() - inicio.getTime()) / 60000)
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60

  const tempoStr = horas > 0 ? `${horas}h ${mins}m` : `${mins}m`

  return (
    <span className={`text-xs font-semibold ${
      espeto.status === 'ENTREGUE' ? 'text-green-600' : 'text-blue-600'
    }`}>
      {espeto.status === 'ENTREGUE' ? '✅' : '⏱️'} {tempoStr}
    </span>
  )
}
