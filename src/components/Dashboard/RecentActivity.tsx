'use client'

import { FiTruck, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi'
import { format } from 'date-fns'

interface Activity {
  id: string
  type: 'entry' | 'exit' | 'stage_change' | 'alert'
  message: string
  vehicleReg: string
  timestamp: Date
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'entry',
    message: 'Vehicle entered workshop',
    vehicleReg: 'DL-01-AB-1234',
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    id: '2',
    type: 'stage_change',
    message: 'Moved to washing bay',
    vehicleReg: 'DL-02-CD-5678',
    timestamp: new Date(Date.now() - 10 * 60000),
  },
  {
    id: '3',
    type: 'exit',
    message: 'Vehicle delivered',
    vehicleReg: 'DL-03-EF-9012',
    timestamp: new Date(Date.now() - 15 * 60000),
  },
  {
    id: '4',
    type: 'alert',
    message: 'JC not created within 10 minutes',
    vehicleReg: 'DL-04-GH-3456',
    timestamp: new Date(Date.now() - 20 * 60000),
  },
]

export default function RecentActivity() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return <FiTruck className="w-4 h-4 text-blue-600" />
      case 'exit':
        return <FiCheckCircle className="w-4 h-4 text-green-600" />
      case 'stage_change':
        return <FiClock className="w-4 h-4 text-orange-600" />
      case 'alert':
        return <FiAlertCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="mt-1">{getActivityIcon(activity.type)}</div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-xs text-gray-500 font-medium">{activity.vehicleReg}</span>
                <span className="text-xs text-gray-400">
                  {format(activity.timestamp, 'HH:mm:ss')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

