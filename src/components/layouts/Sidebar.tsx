'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface SidebarProps {
  perfil: string
  nome: string
}

const menuPorPerfil: Record<string, { href: string; icon: string; label: string }[]> = {
  VENDEDOR: [
    { href: '/vendedor', icon: '📋', label: 'Fila de Pedidos' },
    { href: '/vendedor/novo-pedido', icon: '➕', label: 'Novo Pedido' },
  ],
  LOGISTICA: [
    { href: '/logistica', icon: '🗺️', label: 'Dashboard' },
    { href: '/logistica/espetos', icon: '📦', label: 'Espetos do Dia' },
    { href: '/logistica/entregadores', icon: '🏍️', label: 'Entregadores' },
  ],
  FINANCEIRO: [
    { href: '/financeiro', icon: '💰', label: 'Pagamentos' },
  ],
  ADMIN: [
    { href: '/admin', icon: '📊', label: 'Dashboard Geral' },
    { href: '/vendedor', icon: '📋', label: 'Pedidos' },
    { href: '/logistica', icon: '🗺️', label: 'Logística' },
    { href: '/admin/clientes', icon: '👥', label: 'Clientes' },
    { href: '/admin/relatorios', icon: '📈', label: 'Relatórios' },
    { href: '/admin/usuarios', icon: '⚙️', label: 'Usuários' },
  ],
}

export function Sidebar({ perfil, nome }: SidebarProps) {
  const pathname = usePathname()
  const menu = menuPorPerfil[perfil] ?? menuPorPerfil['ADMIN']

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            D
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Agropecuária</p>
            <p className="font-bold text-green-600 text-sm">Ditinho</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Conectado como</p>
        <p className="font-semibold text-gray-900 text-sm mt-0.5">{nome}</p>
        <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
          {perfil}
        </span>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <span>🚪</span>
          Sair
        </button>
      </div>
    </aside>
  )
}
