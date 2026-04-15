'use client'

import { useSearchParams, useRouter } from 'next/navigation'

type Period = 'diario' | 'semanal' | 'quinzenal' | 'mensal'

const periods: { value: Period; label: string }[] = [
  { value: 'diario', label: 'Diário' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quinzenal', label: 'Quinzenal' },
  { value: 'mensal', label: 'Mensal' },
]

export function PeriodFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentPeriod = (searchParams.get('periodo') || 'mensal') as Period

  function handlePeriodChange(period: Period) {
    const params = new URLSearchParams(searchParams)
    params.set('periodo', period)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 mb-8">
      {periods.map(period => (
        <button
          key={period.value}
          onClick={() => handlePeriodChange(period.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentPeriod === period.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}
