'use client'

import { useState } from 'react'

interface Espeto {
  id: string
  numero: number | null
  cliente: { nome: string; endereco: string; numero: string | null; bairro: string }
  pedido: { statusPagamento: string }
}

interface Props {
  isOpen: boolean
  espeto: Espeto | null
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export function PegarEntregaModal({ isOpen, espeto, onConfirm, onCancel }: Props) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      setLoading(false)
    } catch {
      setLoading(false)
    }
  }

  if (!isOpen || !espeto) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom-4">
        <div className="bg-white rounded-t-3xl px-4 py-6 max-h-[80vh] overflow-y-auto">
          <div className="max-w-sm mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 mb-2">Confirmar entrega?</p>
              <h2 className="text-2xl font-bold text-gray-900">#{espeto.numero}</h2>
            </div>

            {/* Info da entrega */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 space-y-3">
              <div>
                <p className="text-xs font-semibold text-orange-600 uppercase">Destinatário</p>
                <p className="font-bold text-gray-900">{espeto.cliente.nome}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-orange-600 uppercase">Endereço</p>
                <p className="text-gray-700">
                  {espeto.cliente.endereco}{espeto.cliente.numero ? `, ${espeto.cliente.numero}` : ''}
                </p>
                <p className="text-sm text-gray-500">{espeto.cliente.bairro}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-orange-600 uppercase">Pagamento</p>
                <p className="text-sm text-gray-700">
                  {espeto.pedido.statusPagamento === 'PAGO' && '✅ Pago (Pix)'}
                  {espeto.pedido.statusPagamento === 'RECEBER_NA_ENTREGA' && '💰 Receber na entrega'}
                  {espeto.pedido.statusPagamento === 'A_PRAZO' && '📝 A prazo'}
                </p>
              </div>
            </div>

            {/* Botões */}
            <div className="space-y-2">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {loading ? 'Pegando...' : '✓ Confirmar'}
              </button>
              <button
                onClick={onCancel}
                disabled={loading}
                className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-medium py-3 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
