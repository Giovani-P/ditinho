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
  const { status, entregadorId } = body

  const statusAnterior = status
    ? (await prisma.espeto.findUnique({ where: { id }, select: { status: true } }))?.status
    : null

  const espeto = await prisma.espeto.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(entregadorId !== undefined ? { entregadorId } : {}),
    },
    include: {
      cliente: { select: { nome: true, telefone: true } },
      pedido: { select: { valor: true, numeroCiss: true } },
      entregador: { include: { user: { select: { nome: true } } } },
      entrega: { select: { fotoUrl: true } },
    },
  })

  // Atualizar pedido quando entregue
  if (status === 'ENTREGUE') {
    await prisma.pedido.update({
      where: { id: espeto.pedidoId },
      data: { status: 'ENTREGUE' },
    })
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
        horarioEst: espeto.horarioEst,
      }).catch(err => console.error('[WPP] Falha na notificação em rota:', err))
    }
  }

  return NextResponse.json(espeto)
}
