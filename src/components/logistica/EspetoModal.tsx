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

function parsePedidoItens(itensStr: string): { nome: string; quantidade: number; valorUnit: number }[] {
  try {
    const parsed = JSON.parse(itensStr)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function parseItensRetirados(itensRetirados: string | null): number[] {
  if (!itensRetirados) return []
  try {
    return JSON.parse(itensRetirados)
  } catch {
    return []
  }
}

export function EspetoModal({ isOpen, onClose, espeto, entregadores }: EspetoModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [itensRetirados, setItensRetirados] = useState<number[]>(() =>
    parseItensRetirados(espeto?.itensRetirados ?? null)
  )
  const [horarioApos, setHorarioApos] = useState(espeto?.horarioApos ?? '')
  const [horarioAte, setHorarioAte] = useState(espeto?.horarioAte ?? '')

  if (!espeto) return null

  const isMoto = espeto.tipo === 'MOTO'
  const entregadoresPorTipo = entregadores.filter(e => e.tipo === espeto.tipo && e.disponivel)
  const itens = parsePedidoItens(espeto.pedido.itens)

  async function updateStatus(status: string) {
    if (!espeto) return
    setLoading(true)
    try {
      const res = await fetch(`/api/espetos/${espeto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) { router.refresh(); onClose() }
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
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function salvarItensRetirados(indices: number[]) {
    if (!espeto) return
    await fetch(`/api/espetos/${espeto.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itensRetirados: JSON.stringify(indices) }),
    })
    router.refresh()
  }

  async function salvarHorarios() {
    if (!espeto) return
    setLoading(true)
    try {
      const res = await fetch(`/api/espetos/${espeto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horarioApos: horarioApos || null, horarioAte: horarioAte || null }),
      })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  function toggleItemRetirado(index: number) {
    const novos = itensRetirados.includes(index)
      ? itensRetirados.filter(i => i !== index)
      : [...itensRetirados, index]
    setItensRetirados(novos)
    salvarItensRetirados(novos)
  }

  const dataEntregaFormatada = espeto.entrega?.dataEntrega
    ? new Date(espeto.entrega.dataEntrega).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Espeto #${espeto.numero}`} size="lg">
      <div className="space-y-5">

        {/* Status atual */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-medium">Status Atual:</span>
          <div>{statusEspetoBadge(espeto.status)}</div>
        </div>

        {/* Data de entrega (quando entregue) */}
        {dataEntregaFormatada && (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-sm text-green-700 font-medium">✅ Entregue em:</span>
            <span className="text-sm font-bold text-green-800">{dataEntregaFormatada}</span>
          </div>
        )}

        {/* Problema */}
        {espeto.status === 'PROBLEMA' && espeto.descricaoProblema && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-semibold text-red-600 mb-1">⚠️ Descrição do Problema</p>
            <p className="text-sm text-red-700">{espeto.descricaoProblema}</p>
          </div>
        )}

        {/* Cliente */}
        <div className="space-y-3 pb-4 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</h3>
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-gray-600 text-sm">Nome:</span>
              <span className="font-medium text-gray-900 text-sm">{espeto.cliente.nome}</span>
            </div>
            {espeto.cliente.telefone && (
              <div className="flex items-start justify-between">
                <span className="text-gray-600 text-sm">Telefone:</span>
                <a
                  href={`https://wa.me/55${espeto.cliente.telefone.replace(/\D/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  {espeto.cliente.telefone}
                </a>
              </div>
            )}
            <div className="flex items-start justify-between">
              <span className="text-gray-600 text-sm">Endereço:</span>
              <span className="text-right">
                <div className="font-medium text-gray-900 text-sm">{espeto.cliente.endereco}</div>
                <div className="text-gray-500 text-xs">{espeto.cliente.bairro}</div>
              </span>
            </div>
          </div>
        </div>

        {/* Itens da entrega com checklist */}
        {itens.length > 0 && (
          <div className="space-y-2 pb-4 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Itens — marque os que o cliente já retirou na loja
            </h3>
            <div className="space-y-1.5">
              {itens.map((item, index) => {
                const retirado = itensRetirados.includes(index)
                return (
                  <label
                    key={index}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      retirado ? 'bg-gray-100 opacity-60' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={retirado}
                      onChange={() => toggleItemRetirado(index)}
                      className="rounded border-gray-300 text-green-600"
                    />
                    <span className={`text-sm flex-1 ${retirado ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {item.nome}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.quantidade}x
                    </span>
                    {retirado && (
                      <span className="text-xs font-medium text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
                        retirado
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
            {itensRetirados.length > 0 && (
              <p className="text-xs text-orange-600 font-medium mt-1">
                ⚠️ {itensRetirados.length} item(ns) já retirado(s) — entrega parcial
              </p>
            )}
          </div>
        )}

        {/* Entrega — tipo, prioridade, horários */}
        <div className="space-y-3 pb-4 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Entrega</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Tipo:</span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${
                isMoto ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {isMoto ? '🏍️' : '🚚'} {espeto.tipo}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Prioridade:</span>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                espeto.prioridade === 'HOJE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {espeto.prioridade === 'HOJE' ? '🔴 Hoje' : '🟡 Amanhã'}
              </span>
            </div>
            {/* Horários */}
            {espeto.status !== 'ENTREGUE' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">Janela de entrega</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Entregar após</label>
                    <input
                      type="time"
                      value={horarioApos}
                      onChange={e => setHorarioApos(e.target.value)}
                      onBlur={salvarHorarios}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <span className="text-gray-400 text-sm pt-4">até</span>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Entregar até</label>
                    <input
                      type="time"
                      value={horarioAte}
                      onChange={e => setHorarioAte(e.target.value)}
                      onBlur={salvarHorarios}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>
                {(espeto.horarioApos || espeto.horarioAte) && (
                  <p className="text-xs text-blue-600">
                    ⏰ Janela atual: {espeto.horarioApos || '--:--'} – {espeto.horarioAte || '--:--'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        {espeto.status !== 'ENTREGUE' && (
          <div className="space-y-4">
            {/* Alterar status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Alterar Status</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'PENDENTE', label: '⏳ Pendente' },
                  { value: 'EM_ROTA',  label: '🏍️ Em Rota' },
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

            {/* Designar entregador — apenas para CAMINHAO */}
            {!isMoto && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Designar Motorista</label>
                <select
                  value={espeto.entregador
                    ? entregadores.find(e => e.nome === espeto.entregador?.user.nome)?.id ?? ''
                    : ''}
                  onChange={e => designarEntregador(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <option value="">Não designado</option>
                  {entregadoresPorTipo.map(e => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Moto — informativo */}
            {isMoto && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700">
                  🏍️ <strong>Entrega de moto</strong> — os motoboys escolhem no próprio app
                </p>
                {espeto.entregador && (
                  <p className="text-xs text-orange-600 mt-1">Assumido por: {espeto.entregador.user.nome}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
