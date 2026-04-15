import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sincronizarVendasCiss } from '@/lib/ciss-polling'

// Timestamp do último sync bem-sucedido (em memória por processo)
let ultimoSync: Date | null = null
let syncEmAndamento = false

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['VENDEDOR', 'ADMIN'].includes(session.user.perfil)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  if (syncEmAndamento) {
    return NextResponse.json({ message: 'Sync já em andamento', ultimoSync })
  }

  syncEmAndamento = true
  try {
    const resultado = await sincronizarVendasCiss()
    ultimoSync = new Date()
    return NextResponse.json({ ...resultado, ultimoSync })
  } finally {
    syncEmAndamento = false
  }
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  return NextResponse.json({ ultimoSync, syncEmAndamento })
}
