'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

interface Cliente {
  id: string
  nome: string
  telefone: string | null
  endereco: string
  bairro: string
}

interface Item {
  descricao: string
  quantidade: number
  valorUnit: number
}

export default function NovoPedidoPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteId, setClienteId] = useState('')
  const [clienteBusca, setClienteBusca] = useState('')
  const [novoCliente, setNovoCliente] = useState(false)
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [bairro, setBairro] = useState('')
  const [referencia, setReferencia] = useState('')
  const [items, setItems] = useState<Item[]>([{ descricao: '', quantidade: 1, valorUnit: 0 }])
  const [statusPagamento, setStatusPagamento] = useState('NAO_PAGO')
  const [observacoes, setObservacoes] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetch('/api/clientes')
      .then(r => r.json())
      .then(setClientes)
      .catch(() => {})
  }, [])

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(clienteBusca.toLowerCase()) ||
    (c.telefone ?? '').includes(clienteBusca)
  )

  const addItem = () => setItems(prev => [...prev, { descricao: '', quantidade: 1, valorUnit: 0 }])
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof Item, value: string | number) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const total = items.reduce((acc, item) => acc + item.quantidade * item.valorUnit, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!novoCliente && !clienteId) {
      setErro('Selecione ou cadastre um cliente.')
      return
    }
    if (items.some(i => !i.descricao.trim())) {
      setErro('Preencha a descrição de todos os itens.')
      return
    }

    setEnviando(true)
    try {
      let cid = clienteId

      if (novoCliente) {
        const resC = await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: nomeCliente, telefone, endereco, bairro, referencia }),
        })
        if (!resC.ok) throw new Error('Erro ao criar cliente')
        const clienteCriado = await resC.json()
        cid = clienteCriado.id
      }

      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: cid,
          itens: JSON.stringify(items),
          valor: total,
          statusPagamento,
          tipo: 'ENTREGA',
          origem: 'MANUAL',
          observacoes,
        }),
      })

      if (!res.ok) throw new Error('Erro ao criar pedido')
      const pedido = await res.json()
      router.push(`/vendedor/pedido/${pedido.id}`)
    } catch {
      setErro('Erro ao salvar. Tente novamente.')
      setEnviando(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm mb-2 flex items-center gap-1">
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Novo Pedido Manual</h1>
        <p className="text-gray-500 text-sm mt-1">Cadastre um pedido que não veio pelo CISS Poder</p>
      </div>

      {erro && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Cliente</h2>
              <button
                type="button"
                onClick={() => { setNovoCliente(!novoCliente); setClienteId('') }}
                className="text-sm text-green-600 hover:underline"
              >
                {novoCliente ? 'Selecionar existente' : '+ Novo cliente'}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {novoCliente ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    required
                    value={nomeCliente}
                    onChange={e => setNomeCliente(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nome completo do cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="(19) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                  <input
                    type="text"
                    required
                    value={bairro}
                    onChange={e => setBairro(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Centro"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
                  <input
                    type="text"
                    required
                    value={endereco}
                    onChange={e => setEndereco(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Rua, número"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referência</label>
                  <input
                    type="text"
                    value={referencia}
                    onChange={e => setReferencia(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Casa branca, portão azul"
                  />
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={clienteBusca}
                  onChange={e => setClienteBusca(e.target.value)}
                  placeholder="Buscar por nome ou telefone..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {clientesFiltrados.length === 0 ? (
                    <p className="text-center py-4 text-gray-400 text-sm">Nenhum cliente encontrado</p>
                  ) : (
                    clientesFiltrados.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setClienteId(c.id); setClienteBusca(c.nome) }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors ${
                          clienteId === c.id ? 'bg-green-50' : ''
                        }`}
                      >
                        <p className="font-medium text-gray-900 text-sm">{c.nome}</p>
                        <p className="text-gray-400 text-xs">{c.endereco}, {c.bairro} {c.telefone ? `· ${c.telefone}` : ''}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Itens */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Itens do Pedido</h2>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-green-600 hover:underline"
              >
                + Adicionar item
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={e => updateItem(i, 'descricao', e.target.value)}
                      placeholder="Descrição do produto"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={e => updateItem(i, 'quantidade', Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Qtd"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.valorUnit || ''}
                      onChange={e => updateItem(i, 'valorUnit', Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="R$ 0,00"
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-red-400 hover:text-red-600 px-2 py-2 text-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <p className="text-lg font-bold text-gray-900">
                  Total: R$ {total.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pagamento e obs */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Pagamento</h2>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {(['PAGO', 'NAO_PAGO', 'PENDENTE'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusPagamento(s)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    statusPagamento === s
                      ? s === 'PAGO' ? 'bg-green-600 text-white border-green-600'
                        : s === 'PENDENTE' ? 'bg-yellow-500 text-white border-yellow-500'
                        : 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {s === 'PAGO' ? '✅ Pago' : s === 'NAO_PAGO' ? '❌ Não pago' : '⏳ Pendente'}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Cuidado com vidros, ligar antes de entregar..."
              />
            </div>
          </CardContent>
        </Card>

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {enviando ? 'Salvando...' : 'Criar Pedido e Definir Entrega →'}
        </button>
      </form>
    </div>
  )
}
