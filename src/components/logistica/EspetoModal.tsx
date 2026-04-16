'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { statusEspetoBadge } from '@/components/ui/Badge'
import type { EspetoCompleto } from '@/types'

interface Entregador {
  id: string
  nome: string
  tipo: string
  disponivel: boolean
}

interface EspetoModalProps {
  isOpen: boolean
  onClose: () => void
  espeto?: EspetoCompleto
  entregadores: Entregador[]
}

export function EspetoModal({ isOpen, onClose, espeto, entregadores }: EspetoModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!espeto) return null

  const entregadoresPorTipo = entregadores.filter(e => e.tipo === espeto.tipo && e.disponivel)

  async function updateStatus(status: string) {
    if (!espeto) return
    setLoading(true)
    try {
      const res = await fetch(`/api/espetos/${espeto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        router.refresh()
        onClose()
      }
    } finally {
      setLoading(false)
    }
  }

  async function designarEntregador(entregadorId: string) {
    if (!espeto) return
    setLoading(true)
    try {
      const res = await fetch(`/api/espetos/${espeto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entregadorId: entregadorId || null }),
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Espeto #${espeto.numero}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Status Current */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-medium">Status Atual:</span>
          <div>{statusEspetoBadge(espeto.status)}</div>
        </div>

        {/* Cliente Info */}
        <div className="space-y-3 pb-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Cliente
          </h3>
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-gray-600">Nome:</span>
              <span className="font-medium text-gray-900">{espeto.cliente.nome}</span>
            </div>
            {espeto.cliente.telefone && (
            <div className="flex items-start justify-between">
              <span className="text-gray-600">Telefone:</span>
              <a
                href={`https://wa.me/55${espeto.cliente.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                {espeto.cliente.telefone}
              </a>
            </div>
            )}
            <div className="flex items-start justify-between">
              <span className="text-gray-600">Endereço:</span>
              <span className="text-right">
                <div className="font-medium text-gray-900">{espeto.cliente.endereco}</div>
                <div className="text-gray-500 text-sm">{espeto.cliente.bairro}</div>
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="space-y-3 pb-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Entrega
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tipo de Veículo:</span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${
                espeto.tipo === 'MOTO' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {espeto.tipo === 'MOTO' ? '🏍️' : '🚚'} {espeto.tipo}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Prioridade:</span>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                espeto.prioridade === 'HOJE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {espeto.prioridade === 'HOJE' ? '🔴 Hoje' : '🟡 Amanhã'}
              </span>
            </div>
            {espeto.itensRetirados && (
              <div className="flex items-start justify-between">
                <span className="text-gray-600">Itens Retirados:</span>
                <span className="text-gray-900">{espeto.itensRetirados}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Change Status */}
          {espeto.status !== 'ENTREGUE' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Alterar Status</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'PENDENTE', label: '⏳ Pendente' },
                  { value: 'EM_ROTA', label: '🏍️ Em Rota' },
                  { value: 'ENTREGUE', label: '✅ Entregue' },
                  { value: 'PROBLEMA', label: '⚠️ Problema' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateStatus(option.value)}
                    disabled={loading}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      espeto.status === option.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assign Entregador */}
          {espeto.status !== 'ENTREGUE' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Designar Entregador</label>
              <select
                value={espeto.entregador ? entregadores.find(e => e.nome === espeto.entregador?.user.nome)?.id ?? '' : ''}
                onChange={e => designarEntregador(e.target.value)}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                <option value="">Não designado</option>
                {entregadoresPorTipo.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Current Assignment */}
          {espeto.entregador && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Atribuído a:</strong> {espeto.entregador.user.nome}
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
