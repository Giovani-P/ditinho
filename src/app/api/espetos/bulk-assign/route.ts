import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { invalidateCache } from '@/lib/cache'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['LOGISTICA', 'ADMIN'].includes(session.user.perfil)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await req.json()
  const { espetoIds, entregadorId } = body as { espetoIds: string[]; entregadorId: string }

  if (!espetoIds?.length) {
    return NextResponse.json({ error: 'Nenhum espeto selecionado' }, { status: 400 })
  }

  await prisma.espeto.updateMany({
    where: { id: { in: espetoIds } },
    data: { entregadorId: entregadorId || null },
  })

  invalidateCache('espetos:')
  invalidateCache('dashboard:')

  return NextResponse.json({ updated: espetoIds.length })
}
