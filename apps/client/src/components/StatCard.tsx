import type { LucideIcon } from 'lucide-react'

import React from 'react'

type StatCardProps = {
  icon: LucideIcon
  label: string
  value: string | number
  accentClassName: string
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  accentClassName
}) => {
  return (
    <div className="bg-cardBg border border-gray-800 rounded-xl p-6 flex items-center gap-4">
      <div className={`p-4 rounded-lg ${accentClassName}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium">{label}</p>
        <p className="text-3xl font-orbitron font-bold text-white">{value}</p>
      </div>
    </div>
  )
}
