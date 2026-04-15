import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { status, entregadorId } = body

  const espeto = await prisma.espeto.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(entregadorId !== undefined ? { entregadorId } : {}),
    },
  })

  if (status === 'ENTREGUE') {
    await prisma.pedido.update({
      where: { id: espeto.pedidoId },
      data: { status: 'ENTREGUE' },
    })
  }

  return NextResponse.json(espeto)
}
