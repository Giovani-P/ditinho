/**
 * Módulo de integração com CISS Poder
 *
 * API: MIMP API + CISS Live V2
 * Docs: docs.cisslive.com.br/documentation/mimp e /live/v2
 * Estratégia: Polling a cada 10s (sem webhook nativo)
 *
 * Para ativar: configure as variáveis no .env.local:
 *   CISS_BASE_URL=https://api.cisslive.com.br
 *   CISS_TOKEN=seu_bearer_token
 */

import { prisma } from '@/lib/prisma'
import { invalidateCache } from '@/lib/cache'

interface CissVenda {
  id: string
  numero: string
  cliente: {
    nome: string
    cpf_cnpj?: string
    telefone?: string
    endereco: string
    numero?: string
    bairro: string
    cidade: string
    cep?: string
    referencia?: string
  }
  itens: {
    descricao: string
    quantidade: number
    valor_unitario: number
  }[]
  valor_total: number
  status_pagamento: 'PAGO' | 'A_PRAZO' | 'PENDENTE'
  tipo_entrega: 'ENTREGA' | 'RETIRADA'
  status: string
  data_venda: string
}

export function isCissConfigured(): boolean {
  return !!(process.env.CISS_BASE_URL && process.env.CISS_TOKEN)
}

async function fetchVendasCiss(): Promise<CissVenda[]> {
  const baseUrl = process.env.CISS_BASE_URL
  const token = process.env.CISS_TOKEN

  if (!baseUrl || !token) return []

  const resp = await fetch(`${baseUrl}/live/v2/vendas?tipo_entrega=ENTREGA&status=APROVADO&limit=50`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(8000),
  })

  if (!resp.ok) {
    console.error('[CISS] Erro ao buscar vendas:', resp.status, resp.statusText)
    return []
  }

  const data = await resp.json()
  return data.vendas ?? data.data ?? []
}

function mapStatusPagamento(status: string): string {
  if (status === 'PAGO') return 'PAGO'
  if (status === 'A_PRAZO') return 'PENDENTE'
  return 'NAO_PAGO'
}

export async function sincronizarVendasCiss(): Promise<{
  importados: number
  ignorados: number
  erros: number
  configurado: boolean
}> {
  if (!isCissConfigured()) {
    return { importados: 0, ignorados: 0, erros: 0, configurado: false }
  }

  let importados = 0
  let ignorados = 0
  let erros = 0

  try {
    const vendas = await fetchVendasCiss()

    for (const venda of vendas) {
      try {
        // Verificar se pedido já foi importado
        const existente = await prisma.pedido.findFirst({
          where: { numeroCiss: venda.numero },
        })

        if (existente) {
          ignorados++
          continue
        }

        // Buscar ou criar cliente
        let cliente = await prisma.cliente.findFirst({
          where: {
            OR: [
              venda.cliente.cpf_cnpj ? { cpfCnpj: venda.cliente.cpf_cnpj } : {},
              {
                nome: venda.cliente.nome,
                bairro: venda.cliente.bairro,
              },
            ],
          },
        })

        if (!cliente) {
          cliente = await prisma.cliente.create({
            data: {
              nome: venda.cliente.nome,
              cpfCnpj: venda.cliente.cpf_cnpj ?? null,
              telefone: venda.cliente.telefone ?? null,
              endereco: venda.cliente.endereco,
              numero: venda.cliente.numero ?? null,
              bairro: venda.cliente.bairro,
              cidade: venda.cliente.cidade ?? 'Serra Negra',
              cep: venda.cliente.cep ?? null,
              referencia: venda.cliente.referencia ?? null,
            },
          })
        }

        // Criar pedido
        await prisma.pedido.create({
          data: {
            numeroCiss: venda.numero,
            clienteId: cliente.id,
            valor: venda.valor_total,
            itens: JSON.stringify(
              venda.itens.map(i => ({
                descricao: i.descricao,
                quantidade: i.quantidade,
                valorUnit: i.valor_unitario,
              }))
            ),
            statusPagamento: mapStatusPagamento(venda.status_pagamento),
            tipo: venda.tipo_entrega === 'ENTREGA' ? 'ENTREGA' : 'RETIRADA',
            origem: 'CISS_POWER',
            status: 'NOVO',
          },
        })

        importados++
      } catch (err) {
        console.error('[CISS] Erro ao importar venda', venda.numero, err)
        erros++
      }
    }

    if (importados > 0) {
      invalidateCache('pedidos:')
      invalidateCache('dashboard:')
    }
  } catch (err) {
    console.error('[CISS] Falha no polling:', err)
    erros++
  }

  return { importados, ignorados, erros, configurado: true }
}
