import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { notificarEntregaRealizada, notificarPedidoEmRota } from '@/lib/whatsapp'
import { invalidateCache } from '@/lib/cache'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { status, entregadorId, descricaoProblema, horarioApos, horarioAte, itensRetirados, claimar } = body

  const espetoAtual = await prisma.espeto.findUnique({
    where: { id },
    select: { status: true, tipo: true },
  })
  const statusAnterior = espetoAtual?.status ?? null

  // Motoboy assume entrega do pool — usa transação serializable para evitar double-claim
  let entregadorIdResolvido = entregadorId
  if (claimar) {
    const entregador = await prisma.entregador.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })

    try {
      const claimado = await prisma.$transaction(async (tx) => {
        const livre = await tx.espeto.findFirst({
          where: { id, entregadorId: null },
        })
        if (!livre) throw new Error('ALREADY_CLAIMED')
        return tx.espeto.update({
          where: { id },
          data: { entregadorId: entregador?.id ?? null },
          include: {
            cliente: { select: { nome: true, telefone: true } },
            pedido: { select: { valor: true, numeroCiss: true } },
            entregador: { include: { user: { select: { nome: true } } } },
            entrega: { select: { fotoUrl: true } },
          },
        })
      }, { isolationLevel: 'Serializable' })

      invalidateCache('espetos:')
      return NextResponse.json(claimado)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'ALREADY_CLAIMED' || (err as { code?: string }).code === 'P2034') {
        return NextResponse.json({ error: 'ALREADY_CLAIMED', message: 'Esta entrega já foi pega por outro motoboy' }, { status: 409 })
      }
      throw err
    }
  }

  const espeto = await prisma.espeto.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(entregadorIdResolvido !== undefined ? { entregadorId: entregadorIdResolvido } : {}),
      ...(descricaoProblema !== undefined ? { descricaoProblema } : {}),
      ...(horarioApos !== undefined ? { horarioApos } : {}),
      ...(horarioAte !== undefined ? { horarioAte } : {}),
      ...(itensRetirados !== undefined ? { itensRetirados } : {}),
    },
    include: {
      cliente: { select: { nome: true, telefone: true } },
      pedido: { select: { valor: true, numeroCiss: true } },
      entregador: { include: { user: { select: { nome: true } } } },
      entrega: { select: { fotoUrl: true } },
    },
  })

  // Ao entregar: atualizar pedido + registrar data/hora de entrega
  if (status === 'ENTREGUE') {
    await Promise.all([
      prisma.pedido.update({
        where: { id: espeto.pedidoId },
        data: { status: 'ENTREGUE' },
      }),
      prisma.entrega.upsert({
        where: { espetoId: id },
        create: { espetoId: id, dataEntrega: new Date() },
        update: { dataEntrega: new Date() },
      }),
    ])
  }

  invalidateCache('espetos:')
  invalidateCache('dashboard:')

  // Notificações WhatsApp — só quando status muda (não em redesignação de entregador)
  if (status && status !== statusAnterior && espeto.cliente.telefone) {
    const numeroPedido = espeto.pedido.numeroCiss ?? espeto.numero ?? espeto.id.slice(-6).toUpperCase()

    if (status === 'ENTREGUE') {
      // Fire-and-forget — não bloqueia a resposta
      notificarEntregaRealizada({
        telefone: espeto.cliente.telefone,
        nomeCliente: espeto.cliente.nome,
        numeroPedido,
        valor: espeto.pedido.valor,
        fotoUrl: espeto.entrega?.fotoUrl,
      }).catch(err => console.error('[WPP] Falha na notificação de entrega:', err))
    }

    if (status === 'EM_ROTA') {
      notificarPedidoEmRota({
        telefone: espeto.cliente.telefone,
        nomeCliente: espeto.cliente.nome,
        numeroPedido,
        nomeEntregador: espeto.entregador?.user.nome,
        horarioEst: espeto.horarioAte ?? espeto.horarioApos ?? null,
      }).catch(err => console.error('[WPP] Falha na notificação em rota:', err))
    }
  }

  return NextResponse.json(espeto)
}
