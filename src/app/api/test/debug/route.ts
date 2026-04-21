import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 🔓 SEM AUTENTICAÇÃO - APENAS PARA DEBUG
export async function GET() {
  try {
    const hoje = new Date()
    const ano = hoje.getUTCFullYear()
    const mes = String(hoje.getUTCMonth() + 1).padStart(2, '0')
    const dia = String(hoje.getUTCDate()).padStart(2, '0')
    const hojeString = `${ano}-${mes}-${dia}T00:00:00Z`
    const hojeDate = new Date(hojeString)

    console.log('[DEBUG] Data de hoje:', hojeString)

    // Ver TUDO que foi criado nas últimas 24h
    const espetosRecentes = await prisma.espeto.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        numero: true,
        status: true,
        tipo: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const espetosHoje = espetosRecentes.filter(
      (e) => e.createdAt.toISOString().split('T')[0] === `${ano}-${mes}-${dia}`
    )

    const espetosHojeMoto = espetosHoje.filter((e) => e.tipo === 'MOTO')
    const espetosHojePendente = espetosHoje.filter((e) => e.status === 'PENDENTE')
    const espetosHojeMotoPendente = espetosHoje.filter(
      (e) => e.tipo === 'MOTO' && e.status === 'PENDENTE'
    )

    return NextResponse.json({
      dataHoje: hojeString,
      ultimasHora: espetosRecentes.slice(0, 20),
      estatísticas: {
        totalUltimas24h: espetosRecentes.length,
        totalHoje: espetosHoje.length,
        motosHoje: espetosHojeMoto.length,
        pendentesHoje: espetosHojePendente.length,
        motosMotoPendenteHoje: espetosHojeMotoPendente.length,
      },
      espetosHojeMotoPendente,
    })
  } catch (error) {
    console.error('[DEBUG ERROR]', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
