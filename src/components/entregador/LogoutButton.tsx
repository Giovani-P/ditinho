'use client'

import { signOut } from 'next-auth/react'
import { useState } from 'react'

export function LogoutButton() {
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await signOut({ redirect: true, callbackUrl: '/login' })
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      {loading ? '⏳ Saindo...' : '🚪 Sair'}
    </button>
  )
}
