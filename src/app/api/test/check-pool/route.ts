import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const agora = new Date()
  const ano = agora.getUTCFullYear()
  const mes = String(agora.getUTCMonth() + 1).padStart(2, '0')
  const dia = String(agora.getUTCDate()).padStart(2, '0')
  const hoje = new Date(`${ano}-${mes}-${dia}T00:00:00Z`)

  const pool = await prisma.espeto.findMany({
    where: { tipo: 'MOTO', status: 'PENDENTE', createdAt: { gte: hoje } },
    select: { id: true, numero: true, status: true, tipo: true, createdAt: true },
  })

  return NextResponse.json({ hojeUTC: hoje.toISOString(), poolCount: pool.length, pool })
}
