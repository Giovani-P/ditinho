import Link from 'next/link'

interface StatsCardProps {
  title: string
  value: string | number
  icon: string
  color: 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'gray'
  subtitle?: string
  href?: string
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  gray: 'bg-gray-50 border-gray-200 text-gray-700',
}

export function StatsCard({ title, value, icon, color, subtitle, href }: StatsCardProps) {
  const content = (
    <div className={`border rounded-xl p-6 transition-all ${colorClasses[color]} ${href ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-xs mt-2 opacity-60">{subtitle}</p>}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
