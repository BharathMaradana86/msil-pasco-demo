import { IconType } from 'react-icons'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

interface KPICardProps {
  title: string
  value: number
  icon: IconType
  trend: string
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'indigo' | 'yellow'
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  yellow: 'bg-yellow-50 text-yellow-600',
}

export default function KPICard({ title, value, icon: Icon, trend, color }: KPICardProps) {
  const isPositive = !trend.includes('-') && trend !== 'Critical'
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex-1 min-w-[200px]">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center">
          {trend !== 'Critical' ? (
            <>
              {isPositive ? (
                <FiTrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <FiTrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend} from yesterday
              </span>
            </>
          ) : (
            <span className="text-xs text-red-600 font-medium">{trend}</span>
          )}
        </div>
      )}
    </div>
  )
}

