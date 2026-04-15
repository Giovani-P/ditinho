import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')

  const clientes = await prisma.cliente.findMany({
    where: q
      ? {
          OR: [
            { nome: { contains: q } },
            { telefone: { contains: q } },
            { cpfCnpj: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { nome: 'asc' },
    take: 100,
  })

  return NextResponse.json(clientes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { nome, telefone, cpfCnpj, endereco, numero, bairro, cep, referencia, observacoes } = body

  if (!nome || !endereco || !bairro) {
    return NextResponse.json({ error: 'Nome, endereço e bairro são obrigatórios' }, { status: 400 })
  }

  const cliente = await prisma.cliente.create({
    data: { nome, telefone, cpfCnpj, endereco, numero, bairro, cep, referencia, observacoes },
  })

  return NextResponse.json(cliente, { status: 201 })
}
