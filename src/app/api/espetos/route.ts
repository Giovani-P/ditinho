import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getCache, setCache, invalidateCache } from '@/lib/cache'

const CACHE_TTL = 15_000 // 15 segundos

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const entregadorId = searchParams.get('entregadorId')

  const cacheKey = `espetos:${status ?? 'all'}:${entregadorId ?? 'all'}`
  const cached = getCache(cacheKey)
  if (cached) return NextResponse.json(cached)

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const espetos = await prisma.espeto.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(entregadorId ? { entregadorId } : {}),
      createdAt: { gte: hoje },
    },
    include: {
      cliente: {
        select: { nome: true, telefone: true, endereco: true, bairro: true },
      },
      entregador: {
        include: { user: { select: { nome: true } } },
      },
    },
    orderBy: [{ prioridade: 'asc' }, { createdAt: 'asc' }],
  })

  setCache(cacheKey, espetos, CACHE_TTL)
  return NextResponse.json(espetos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { pedidoId, tipo, prioridade, entregadorId, horarioEst } = body

  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    select: { clienteId: true },
  })

  if (!pedido) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

  const espeto = await prisma.espeto.create({
    data: {
      pedidoId,
      clienteId: pedido.clienteId,
      tipo: tipo ?? 'MOTO',
      prioridade: prioridade ?? 'HOJE',
      entregadorId: entregadorId ?? null,
      horarioEst: horarioEst ?? null,
    },
  })

  await prisma.pedido.update({
    where: { id: pedidoId },
    data: { status: 'AGUARDANDO_ENTREGA' },
  })

  // Invalida cache para forçar reload dos dados atualizados
  invalidateCache('espetos:')
  invalidateCache('dashboard:')

  return NextResponse.json(espeto, { status: 201 })
}
