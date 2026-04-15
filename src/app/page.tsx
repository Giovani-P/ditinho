import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const perfil = session.user.perfil

  if (perfil === 'VENDEDOR') redirect('/vendedor')
  if (perfil === 'LOGISTICA') redirect('/logistica')
  if (perfil === 'ENTREGADOR') redirect('/app-entregador')
  if (perfil === 'FINANCEIRO') redirect('/financeiro')

  redirect('/admin')
}
