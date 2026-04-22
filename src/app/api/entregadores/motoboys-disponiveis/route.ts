import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const entregadorAtual = await prisma.entregador.findFirst({
      where: { userId: session.user.id },
    })

    if (!entregadorAtual) {
      return NextResponse.json({ error: 'Entregador não encontrado' }, { status: 404 })
    }

    // Buscar todos os MOTO disponíveis, exceto o atual
    const motoboys = await prisma.entregador.findMany({
      where: {
        tipo: 'MOTO',
        disponivel: true,
        NOT: { id: entregadorAtual.id },
      },
      include: {
        user: { select: { nome: true, email: true } },
      },
      orderBy: { user: { nome: 'asc' } },
    })

    return NextResponse.json({
      motoboys: motoboys.map(m => ({
        id: m.id,
        nome: m.user.nome,
        email: m.user.email,
      })),
    })
  } catch (error) {
    console.error('[MOTOBOYS DISPONIVEIS ERROR]', error)
    return NextResponse.json({ error: 'Erro ao buscar motoboys' }, { status: 500 })
  }
}
