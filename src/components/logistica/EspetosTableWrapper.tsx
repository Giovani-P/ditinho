'use client'

import { useEffect, useState } from 'react'
import { EspetosTableClient } from './EspetosTableClient'

interface Espeto {
  id: string
  numero: number | null
  prioridade: string
  status: string
  cliente: { nome: string; telefone: string | null; endereco: string; bairro: string }
  entregador: { user: { nome: string } } | null
  pedido: { itens: string; statusPagamento: string }
  entrega: { dataEntrega: string } | null
}

interface Props {
  espetosInicial: Espeto[]
  entregadores: Array<{
    id: string
    nome: string
    tipo: string
    disponivel: boolean
  }>
  filtroStatus?: string
}

export function EspetosTableWrapper({ espetosInicial, entregadores, filtroStatus }: Props) {
  const [espetos, setEspetos] = useState(espetosInicial)

  useEffect(() => {
    // Polling a cada 5 segundos
    const interval = setInterval(async () => {
      try {
        const params = new URLSearchParams()
        if (filtroStatus) params.append('status', filtroStatus)

        const res = await fetch(`/api/espetos/list?${params}`)
        if (res.ok) {
          const data = await res.json()
          setEspetos(data.espetos || [])
        }
      } catch (error) {
        console.error('Erro ao atualizar espetos:', error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [filtroStatus])

  return (
    <EspetosTableClient
      espetos={espetos as never}
      entregadores={entregadores}
    />
  )
}
