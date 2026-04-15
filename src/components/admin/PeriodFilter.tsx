'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

type Period = 'diario' | 'semanal' | 'quinzenal' | 'mensal' | 'customizado'

const periods: { value: Period; label: string; icon: string }[] = [
  { value: 'diario', label: 'Diário', icon: '📅' },
  { value: 'semanal', label: 'Semanal', icon: '📆' },
  { value: 'quinzenal', label: 'Quinzenal', icon: '📊' },
  { value: 'mensal', label: 'Mensal', icon: '📈' },
  { value: 'customizado', label: 'Customizado', icon: '📌' },
]

export function PeriodFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentPeriod = (searchParams.get('periodo') || 'mensal') as Period
  const [showCustom, setShowCustom] = useState(currentPeriod === 'customizado')
  const [startDate, setStartDate] = useState(searchParams.get('dataInicio') || '')
  const [endDate, setEndDate] = useState(searchParams.get('dataFim') || '')

  function handlePeriodChange(period: Period) {
    const params = new URLSearchParams(searchParams)
    params.set('periodo', period)
    // Remover filtros customizados se não for customizado
    if (period !== 'customizado') {
      params.delete('dataInicio')
      params.delete('dataFim')
      setShowCustom(false)
    } else {
      setShowCustom(true)
    }
    router.push(`?${params.toString()}`)
  }

  function handleApplyCustom() {
    if (!startDate || !endDate) {
      alert('Por favor, selecione data inicial e final')
      return
    }

    const params = new URLSearchParams(searchParams)
    params.set('periodo', 'customizado')
    params.set('dataInicio', startDate)
    params.set('dataFim', endDate)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex gap-2 flex-wrap">
        {periods.map(period => (
          <button
            key={period.value}
            onClick={() => handlePeriodChange(period.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              currentPeriod === period.value
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{period.icon}</span>
            <span>{period.label}</span>
          </button>
        ))}
      </div>

      {/* Filtro customizado */}
      {showCustom && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Selecione o período customizado</p>
          <div className="flex gap-4 items-end flex-wrap">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleApplyCustom}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
