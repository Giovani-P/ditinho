import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getCache, setCache, invalidateCache } from '@/lib/cache'

const CACHE_TTL = 15_000 // 15 segundos

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'NOVO'
  const aba = searchParams.get('aba') // 'dia' | 'agendados'

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  const cacheKey = `pedidos:${status}:${aba ?? 'all'}`
  const cached = getCache(cacheKey)
  if (cached) return NextResponse.json(cached)

  // Filtro de agendamento
  let agendamentoWhere = {}
  if (aba === 'agendados') {
    agendamentoWhere = { dataAgendada: { gte: amanha } }
  } else if (aba === 'dia') {
    agendamentoWhere = {
      OR: [
        { dataAgendada: null, createdAt: { gte: hoje } },
        { dataAgendada: { lt: amanha } },
      ],
    }
  }

  const pedidos = await prisma.pedido.findMany({
    where: { status, ...agendamentoWhere },
    include: {
      cliente: {
        select: { id: true, nome: true, telefone: true, endereco: true, bairro: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  setCache(cacheKey, pedidos, CACHE_TTL)
  return NextResponse.json(pedidos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { clienteId, valor, itens, statusPagamento, tipo, origem, observacoes, dataAgendada } = body

  // itens pode vir como array ou string JSON — normalizar para string
  const itensStr = typeof itens === 'string' ? itens : JSON.stringify(itens ?? [])

  const pedido = await prisma.pedido.create({
    data: {
      clienteId,
      valor: parseFloat(valor),
      itens: itensStr,
      statusPagamento: statusPagamento ?? 'RECEBER_NA_ENTREGA',
      tipo: tipo ?? 'ENTREGA',
      origem: origem ?? 'MANUAL',
      dataAgendada: dataAgendada ? new Date(dataAgendada) : null,
      observacoes: observacoes ?? null,
    },
    include: {
      cliente: { select: { nome: true } },
    },
  })

  invalidateCache('pedidos:')
  invalidateCache('dashboard:')

  return NextResponse.json(pedido, { status: 201 })
}
