'use client'

import { useEffect, useState } from 'react'

interface Motoboy {
  id: string
  nome: string
  email: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: (motoId: string) => Promise<void>
}

export function TransferirEntregaModal({ isOpen, onClose, onConfirm }: Props) {
  const [motoboys, setMotoboys] = useState<Motoboy[]>([])
  const [selecionado, setSelecionado] = useState('')
  const [loading, setLoading] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (isOpen) {
      setCarregando(true)
      setErro('')
      setSelecionado('')
      fetch('/api/entregadores/motoboys-disponiveis')
        .then(r => r.json())
        .then(data => {
          if (data.motoboys) {
            setMotoboys(data.motoboys)
          } else {
            setErro('Erro ao carregar motoboys')
          }
        })
        .catch(() => setErro('Erro ao buscar motoboys'))
        .finally(() => setCarregando(false))
    }
  }, [isOpen])

  const handleConfirm = async () => {
    if (!selecionado) return
    setLoading(true)
    try {
      await onConfirm(selecionado)
      onClose()
    } catch {
      setErro('Erro ao transferir entrega')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom-4">
        <div className="bg-white rounded-t-3xl px-4 py-6 max-h-[80vh] overflow-y-auto">
          <div className="max-w-sm mx-auto">
            {/* Header */}
            <h2 className="text-xl font-bold text-gray-900 mb-6">Transferir entrega</h2>

            {carregando ? (
              <div className="text-center py-8 text-gray-500">Carregando motoboys...</div>
            ) : erro ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {erro}
              </div>
            ) : motoboys.length === 0 ? (
              <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                <p className="font-medium">Nenhum motoboy disponível</p>
                <p className="text-sm">Todos estão ocupados no momento</p>
              </div>
            ) : (
              <>
                {/* Lista de motoboys */}
                <div className="space-y-2 mb-6">
                  {motoboys.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelecionado(m.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        selecionado === m.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{m.nome}</p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </button>
                  ))}
                </div>

                {/* Botões */}
                <div className="space-y-2">
                  <button
                    onClick={handleConfirm}
                    disabled={!selecionado || loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    {loading ? 'Transferindo...' : '✓ Confirmar transferência'}
                  </button>
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-medium py-3 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
