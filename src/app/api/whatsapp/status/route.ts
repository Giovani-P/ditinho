import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isWhatsAppConfigured } from '@/lib/whatsapp'

export async function GET() {
  const session = await auth()
  if (!session || session.user.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const configurado = isWhatsAppConfigured()

  if (!configurado) {
    return NextResponse.json({ configurado: false, status: 'not_configured' })
  }

  // Verificar se a Evolution API está online
  try {
    const res = await fetch(
      `${process.env.EVOLUTION_API_URL}/instance/connectionState/${process.env.EVOLUTION_INSTANCE}`,
      {
        headers: { apikey: process.env.EVOLUTION_API_KEY! },
        signal: AbortSignal.timeout(5000),
      }
    )

    if (!res.ok) {
      return NextResponse.json({ configurado: true, status: 'api_error', code: res.status })
    }

    const data = await res.json()
    return NextResponse.json({
      configurado: true,
      status: data.instance?.state ?? 'unknown',
      instance: process.env.EVOLUTION_INSTANCE,
    })
  } catch {
    return NextResponse.json({ configurado: true, status: 'offline' })
  }
}
