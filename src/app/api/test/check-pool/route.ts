import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    console.log('[DEBUG] Hoje:', hoje.toISOString())
    console.log('[DEBUG] Amanhã:', amanha.toISOString())

    // Buscar TODOS os espetos do banco
    const todosEspetos = await prisma.espeto.findMany({
      select: {
        id: true,
        numero: true,
        status: true,
        tipo: true,
        createdAt: true,
        entregadorId: true,
        cliente: { select: { nome: true } },
      },
    })

    console.log('[DEBUG] Total de espetos no banco:', todosEspetos.length)

    // Buscar espetos MOTO PENDENTE de hoje (como faz o /api/espetos/pool)
    const poolEspetos = await prisma.espeto.findMany({
      where: {
        tipo: 'MOTO',
        status: 'PENDENTE',
        createdAt: { gte: hoje },
      },
      select: {
        id: true,
        numero: true,
        status: true,
        tipo: true,
        createdAt: true,
        entregadorId: true,
        cliente: { select: { nome: true } },
      },
    })

    console.log('[DEBUG] Espetos MOTO PENDENTE de hoje:', poolEspetos.length)

    return NextResponse.json({
      debug: {
        hojeISO: hoje.toISOString(),
        amanhaISO: amanha.toISOString(),
        totalEspetos: todosEspetos.length,
        poolEspetos: poolEspetos.length,
      },
      todosEspetos,
      poolEspetos,
    })
  } catch (error) {
    console.error('[DEBUG ERROR]', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
