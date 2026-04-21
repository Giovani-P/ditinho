import type { NextAuthConfig } from 'next-auth'

// Config mínima para o Edge (middleware)
// Não importa Prisma nem bcrypt — só JWT
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const protectedPaths = ['/vendedor', '/logistica', '/admin', '/app-entregador', '/app-moto', '/app-caminhao', '/financeiro']
      const isProtected = protectedPaths.some(p => nextUrl.pathname.startsWith(p))

      if (isProtected) return isLoggedIn
      if (isLoggedIn && nextUrl.pathname === '/login') {
        return Response.redirect(new URL('/', nextUrl))
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.perfil = (user as { perfil: string }).perfil
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.perfil = token.perfil as string
      }
      return session
    },
  },
  providers: [], // providers são adicionados em auth.ts
  session: { strategy: 'jwt' },
}
