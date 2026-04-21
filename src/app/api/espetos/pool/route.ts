import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const espetos = await prisma.espeto.findMany({
    where: {
      tipo: 'MOTO',
      status: 'PENDENTE',
      createdAt: { gte: hoje },
    },
    include: {
      cliente: {
        select: { nome: true, telefone: true, endereco: true, numero: true, bairro: true, referencia: true },
      },
      pedido: { select: { statusPagamento: true } },
      entregador: { include: { user: { select: { nome: true } } } },
    },
    orderBy: [{ prioridade: 'asc' }, { createdAt: 'asc' }],
  })

  return NextResponse.json(espetos, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  })
}
