interface StatsCardProps {
  title: string
  value: string | number
  icon: string
  color: 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'gray'
  subtitle?: string
  href?: string
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:shadow-md',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 hover:shadow-md',
  green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:shadow-md',
  red: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:shadow-md',
  purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:shadow-md',
  gray: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-md',
}

export function StatsCard({ title, value, icon, color, subtitle, href }: StatsCardProps) {
  const baseClasses = `border rounded-xl p-6 transition-all flex items-start justify-between ${colorClasses[color]}`

  const content = (
    <>
      <div className="flex-1">
        <p className="text-sm font-medium opacity-75">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {subtitle && <p className="text-xs mt-2 opacity-60">{subtitle}</p>}
      </div>
      <div className="text-4xl">{icon}</div>
    </>
  )

  if (href) {
    return (
      <a href={href} className={`${baseClasses} cursor-pointer block no-underline`}>
        {content}
      </a>
    )
  }

  return (
    <div className={baseClasses}>
      {content}
    </div>
  )
}
