import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const { novoEntregadorId } = await req.json()

    if (!novoEntregadorId) {
      return NextResponse.json({ error: 'novoEntregadorId obrigatório' }, { status: 400 })
    }

    // Buscar espeto atual
    const espeto = await prisma.espeto.findUnique({ where: { id } })
    if (!espeto) {
      return NextResponse.json({ error: 'Espeto não encontrado' }, { status: 404 })
    }

    // Validar que pertence ao entregador atual
    const entregadorAtual = await prisma.entregador.findFirst({
      where: { userId: session.user.id },
    })

    if (!entregadorAtual || espeto.entregadorId !== entregadorAtual.id) {
      return NextResponse.json({ error: 'Espeto não pertence a você' }, { status: 403 })
    }

    // Validar que o novo entregador existe e é MOTO
    const novoEntregador = await prisma.entregador.findUnique({
      where: { id: novoEntregadorId },
      include: { user: { select: { nome: true } } },
    })

    if (!novoEntregador || novoEntregador.tipo !== 'MOTO') {
      return NextResponse.json({ error: 'Novo entregador inválido' }, { status: 400 })
    }

    // Atualizar espeto mantendo status PENDENTE
    const espetoAtualizado = await prisma.espeto.update({
      where: { id },
      data: {
        entregadorId: novoEntregadorId,
        status: 'PENDENTE', // garante que não se perde
      },
      include: {
        cliente: { select: { nome: true, telefone: true, endereco: true, numero: true, bairro: true, referencia: true } },
        pedido: { select: { statusPagamento: true } },
        entregador: { include: { user: { select: { nome: true } } } },
      },
    })

    return NextResponse.json({
      ok: true,
      espeto: espetoAtualizado,
      transferidoPara: novoEntregador.user.nome,
    })
  } catch (error) {
    console.error('[TRANSFERIR ERROR]', error)
    return NextResponse.json({ error: 'Erro ao transferir' }, { status: 500 })
  }
}
