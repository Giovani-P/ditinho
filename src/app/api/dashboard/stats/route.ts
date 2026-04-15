import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getCache, setCache } from '@/lib/cache'

const CACHE_KEY = 'dashboard:stats'
const CACHE_TTL = 30_000 // 30 segundos

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const cached = getCache(CACHE_KEY)
  if (cached) return NextResponse.json(cached)

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const [pedidosHoje, espetosHoje, emRota, entregues, problemas, pendentes] = await Promise.all([
    prisma.pedido.count({ where: { createdAt: { gte: hoje } } }),
    prisma.espeto.count({ where: { createdAt: { gte: hoje } } }),
    prisma.espeto.count({ where: { status: 'EM_ROTA' } }),
    prisma.espeto.count({ where: { status: 'ENTREGUE', updatedAt: { gte: hoje } } }),
    prisma.espeto.count({ where: { status: 'PROBLEMA' } }),
    prisma.espeto.count({ where: { status: 'PENDENTE' } }),
  ])

  const data = { pedidosHoje, espetosHoje, emRota, entregues, problemas, pendentes }
  setCache(CACHE_KEY, data, CACHE_TTL)

  return NextResponse.json(data)
}
