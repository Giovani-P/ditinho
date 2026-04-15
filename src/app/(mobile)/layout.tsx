import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="max-w-md mx-auto min-h-screen">
      {children}
    </div>
  )
}
