import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params

  // Impedir que admin desative a si mesmo
  if (id === session.user.id) {
    return NextResponse.json({ error: 'Não é possível desativar sua própria conta' }, { status: 400 })
  }

  const body = await req.json()
  const { ativo } = body

  const user = await prisma.user.update({
    where: { id },
    data: { ativo },
  })

  return NextResponse.json({ id: user.id, ativo: user.ativo })
}
