'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface TourStep {
  targetId: string
  title: string
  description: string
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-kpis',
    title: '📊 Resumo do Dia',
    description: 'Acompanhe os números em tempo real: pedidos recebidos, espetos criados, entregas em rota, concluídas, pendentes e com problema.',
  },
  {
    targetId: 'tour-espetos',
    title: '📦 Espetos de Hoje',
    description: 'Lista de todas as entregas do dia. No painel de Logística você pode clicar em "⚙️ Ações" para alterar status, designar entregador ou abrir o WhatsApp do cliente.',
  },
  {
    targetId: 'tour-nav-pedidos',
    title: '📋 Pedidos',
    description: 'Crie novos pedidos e gerencie a fila de pedidos pendentes para entrega ou retirada na loja.',
  },
  {
    targetId: 'tour-nav-logistica',
    title: '🗺️ Logística',
    description: 'Painel de espetos do dia, designação de entregadores e acompanhamento de todas as rotas em tempo real.',
  },
  {
    targetId: 'tour-nav-financeiro',
    title: '💰 Financeiro',
    description: 'Controle de pagamentos: veja quem pagou, quem vai pagar na entrega e acompanhe os recebíveis do dia.',
  },
  {
    targetId: 'tour-nav-clientes',
    title: '👥 Clientes',
    description: 'Histórico completo de cada cliente: todos os pedidos, endereços, produtos comprados e valor acumulado.',
  },
  {
    targetId: 'tour-nav-relatorios',
    title: '📈 Relatórios',
    description: 'Relatórios por período customizável: diário, semanal, quinzenal, mensal ou datas específicas.',
  },
  {
    targetId: 'tour-nav-usuarios',
    title: '⚙️ Usuários',
    description: 'Gerencie os acessos da equipe. Crie perfis para Vendedor, Logística, Entregador, Financeiro e Admin.',
  },
]

interface HighlightRect {
  top: number
  left: number
  width: number
  height: number
}

export function TourGuiado() {
  const [isOpen, setIsOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  const updateHighlight = useCallback((index: number) => {
    const step = TOUR_STEPS[index]
    const el = document.getElementById(step.targetId)
    if (!el) return

    el.scrollIntoView({ behavior: 'smooth', block: 'center' })

    setTimeout(() => {
      const rect = el.getBoundingClientRect()
      const padding = 8
      const highlight: HighlightRect = {
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      }
      setHighlightRect(highlight)

      // Calculate tooltip position
      const tooltipWidth = 320
      const tooltipHeight = 200
      const margin = 16
      const vw = window.innerWidth
      const vh = window.innerHeight

      let top: number
      let left: number

      // Se o elemento está na sidebar (lado esquerdo), tooltip à direita
      if (highlight.left < 280) {
        left = highlight.left + highlight.width + margin
        top = highlight.top + highlight.height / 2 - tooltipHeight / 2
      } else {
        // Tenta posicionar abaixo
        top = highlight.top + highlight.height + margin
        left = highlight.left + highlight.width / 2 - tooltipWidth / 2

        // Se não cabe abaixo, posiciona acima
        if (top + tooltipHeight > vh - margin) {
          top = highlight.top - tooltipHeight - margin
        }
      }

      // Mantém dentro da tela
      if (left < margin) left = margin
      if (left + tooltipWidth > vw - margin) left = vw - tooltipWidth - margin
      if (top < margin) top = margin

      setTooltipStyle({ top, left, width: tooltipWidth })
    }, 300)
  }, [])

  const startTour = () => {
    setStepIndex(0)
    setIsOpen(true)
    setTimeout(() => updateHighlight(0), 100)
  }

  const next = () => {
    const nextIndex = stepIndex + 1
    if (nextIndex >= TOUR_STEPS.length) {
      setIsOpen(false)
      setHighlightRect(null)
      return
    }
    setStepIndex(nextIndex)
    updateHighlight(nextIndex)
  }

  const prev = () => {
    const prevIndex = stepIndex - 1
    if (prevIndex < 0) return
    setStepIndex(prevIndex)
    updateHighlight(prevIndex)
  }

  const close = () => {
    setIsOpen(false)
    setHighlightRect(null)
  }

  const step = TOUR_STEPS[stepIndex]

  return (
    <>
      <button
        onClick={startTour}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
      >
        🎯 Tour Guiado
      </button>

      {mounted && isOpen && createPortal(
        <>
          {/* Overlay escuro */}
          <div
            className="fixed inset-0 pointer-events-auto"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 9997 }}
            onClick={close}
          />

          {/* Destaque do elemento */}
          {highlightRect && (
            <div
              className="fixed pointer-events-none"
              style={{
                top: highlightRect.top,
                left: highlightRect.left,
                width: highlightRect.width,
                height: highlightRect.height,
                zIndex: 9998,
                borderRadius: 8,
                border: '2px solid #3b82f6',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55), 0 0 20px rgba(59,130,246,0.5)',
                transition: 'all 0.3s ease',
              }}
            />
          )}

          {/* Tooltip */}
          <div
            className="fixed bg-white rounded-2xl shadow-2xl p-5 pointer-events-auto"
            style={{ ...tooltipStyle, zIndex: 9999, transition: 'all 0.3s ease' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-1">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === stepIndex ? 'w-5 bg-blue-500' : i < stepIndex ? 'w-1.5 bg-blue-300' : 'w-1.5 bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={close}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2 flex-shrink-0"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-3">
              Passo {stepIndex + 1} de {TOUR_STEPS.length}
            </p>

            <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">{step.description}</p>

            <div className="flex items-center gap-2">
              {stepIndex > 0 && (
                <button
                  onClick={prev}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors"
                >
                  ← Anterior
                </button>
              )}
              <button
                onClick={next}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {stepIndex === TOUR_STEPS.length - 1 ? '✅ Concluir Tour' : 'Próximo →'}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
