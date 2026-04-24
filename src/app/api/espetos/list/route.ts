import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || !['LOGISTICA', 'ADMIN'].includes(session.user.perfil)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const espetos = await prisma.espeto.findMany({
      where: {
        createdAt: { gte: hoje },
        ...(status ? { status } : {}),
      },
      orderBy: [{ prioridade: 'asc' }, { createdAt: 'asc' }],
      include: {
        cliente: { select: { nome: true, telefone: true, endereco: true, bairro: true } },
        entregador: { include: { user: { select: { nome: true } } } },
        pedido: { select: { itens: true, statusPagamento: true } },
        entrega: { select: { dataEntrega: true } },
      },
    })

    return NextResponse.json({ espetos })
  } catch (error) {
    console.error('[LIST ESPETOS ERROR]', error)
    return NextResponse.json({ error: 'Erro ao buscar espetos' }, { status: 500 })
  }
}
