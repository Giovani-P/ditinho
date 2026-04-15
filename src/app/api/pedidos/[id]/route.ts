import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { invalidateCache } from '@/lib/cache'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { statusPagamento, status } = body

  const pedido = await prisma.pedido.update({
    where: { id },
    data: {
      ...(statusPagamento ? { statusPagamento } : {}),
      ...(status ? { status } : {}),
    },
  })

  invalidateCache('pedidos:')
  invalidateCache('dashboard:')

  return NextResponse.json(pedido)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      cliente: true,
      espetos: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  if (!pedido) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  return NextResponse.json(pedido)
}
