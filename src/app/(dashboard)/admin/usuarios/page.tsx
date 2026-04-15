import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { NovoUsuarioForm } from '@/components/admin/NovoUsuarioForm'
import { UsuariosTable } from '@/components/admin/UsuariosTable'

export default async function UsuariosPage() {
  const session = await auth()
  if (!session || session.user.perfil !== 'ADMIN') redirect('/')

  const usuarios = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      entregador: { select: { tipo: true, disponivel: true } },
    },
  })

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-500 text-sm mt-1">{usuarios.length} usuários cadastrados</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Equipe</h2>
            </CardHeader>
            <CardContent className="p-0">
              <UsuariosTable usuarios={usuarios as never} currentUserId={session.user.id} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Novo Usuário</h2>
            </CardHeader>
            <CardContent>
              <NovoUsuarioForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
