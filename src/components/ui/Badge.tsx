interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default'
  children: React.ReactNode
}

const variants = {
  success: 'bg-green-100 text-green-800 border border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  danger: 'bg-red-100 text-red-800 border border-red-200',
  info: 'bg-blue-100 text-blue-800 border border-blue-200',
  default: 'bg-gray-100 text-gray-700 border border-gray-200',
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

export function statusPedidoBadge(status: string) {
  const map: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    NOVO: { variant: 'info', label: 'Novo' },
    EM_SEPARACAO: { variant: 'warning', label: 'Em Separação' },
    AGUARDANDO_ENTREGA: { variant: 'warning', label: 'Aguardando' },
    EM_ROTA: { variant: 'info', label: 'Em Rota' },
    ENTREGUE: { variant: 'success', label: 'Entregue' },
    CANCELADO: { variant: 'danger', label: 'Cancelado' },
  }
  const config = map[status] ?? { variant: 'default', label: status }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function statusEspetoBadge(status: string) {
  const map: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    PENDENTE: { variant: 'warning', label: 'Pendente' },
    EM_ROTA: { variant: 'info', label: 'Em Rota' },
    ENTREGUE: { variant: 'success', label: 'Entregue' },
    PROBLEMA: { variant: 'danger', label: 'Problema' },
  }
  const config = map[status] ?? { variant: 'default', label: status }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function pagamentoBadge(status: string) {
  const map: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    PAGO: { variant: 'success', label: '✓ Pago' },
    RECEBER_NA_ENTREGA: { variant: 'warning', label: '💰 Receber' },
  }
  const config = map[status] ?? { variant: 'default', label: status }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
