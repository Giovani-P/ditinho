'use client'

export function SeedPoolButton() {
  return (
    <a
      href="/api/test/seed-pool"
      onClick={(e) => {
        e.preventDefault()
        fetch('/api/test/seed-pool', { method: 'POST' })
          .then(() => window.location.reload())
          .catch(() => alert('Erro ao criar dados de teste'))
      }}
      className="text-xs opacity-50 hover:opacity-100 transition-opacity"
      title="Criar dados de teste"
    >
      🧪
    </a>
  )
}
