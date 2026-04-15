import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await req.json()
  const { nome, email, senha, perfil, tipoEntregador } = body

  if (!nome || !email || !senha || !perfil) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const existente = await prisma.user.findUnique({ where: { email } })
  if (existente) {
    return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
  }

  const senhaHash = await bcrypt.hash(senha, 10)

  const user = await prisma.user.create({
    data: { nome, email, senha: senhaHash, perfil },
  })

  // Se for entregador, criar registro de entregador automaticamente
  if (perfil === 'ENTREGADOR') {
    await prisma.entregador.create({
      data: {
        userId: user.id,
        tipo: tipoEntregador ?? 'MOTO',
        disponivel: true,
      },
    })
  }

  return NextResponse.json({ id: user.id, nome: user.nome, email: user.email, perfil: user.perfil }, { status: 201 })
}
