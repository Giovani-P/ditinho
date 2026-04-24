import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || !['ADMIN', 'LOGISTICA'].includes(session.user.perfil)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const entidadeId = searchParams.get('entidadeId')
    const limite = parseInt(searchParams.get('limit') || '50')

    const logs = await prisma.auditLog.findMany({
      where: entidadeId ? { entidadeId } : {},
      include: {
        user: { select: { nome: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limite,
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('[AUDIT LOG ERROR]', error)
    return NextResponse.json({ error: 'Erro ao buscar audit log' }, { status: 500 })
  }
}
