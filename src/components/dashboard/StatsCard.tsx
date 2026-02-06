import { Card, CardContent } from '@/components/ui'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    positive: boolean
  }
}

export function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend.positive ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    trend.positive ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center bg-rose-50 text-rose-500 p-3 rounded-xl">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
