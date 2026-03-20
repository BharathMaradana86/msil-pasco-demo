import { useState } from 'react'
import { FiTool, FiCheckCircle, FiClock, FiEdit, FiTrendingUp } from 'react-icons/fi'

interface Bay {
  id: string
  name: string
  type: '2-Tech Bay' | 'Express Bay' | 'Smart Bay'
  status: 'occupied' | 'vacant' | 'maintenance'
  vehicleReg?: string
  technician?: string
  allocatedAt?: Date
  utilization: number
}

const mockBays: Bay[] = [
  {
    id: '1',
    name: 'Bay 1',
    type: '2-Tech Bay',
    status: 'occupied',
    vehicleReg: 'DL-01-AB-1234',
    technician: 'Tech A & Tech B',
    allocatedAt: new Date(Date.now() - 30 * 60000),
    utilization: 85,
  },
  {
    id: '2',
    name: 'Bay 2',
    type: 'Express Bay',
    status: 'occupied',
    vehicleReg: 'DL-02-CD-5678',
    technician: 'Tech C',
    allocatedAt: new Date(Date.now() - 15 * 60000),
    utilization: 72,
  },
  {
    id: '3',
    name: 'Bay 3',
    type: 'Smart Bay',
    status: 'vacant',
    utilization: 65,
  },
  {
    id: '4',
    name: 'Bay 4',
    type: '2-Tech Bay',
    status: 'occupied',
    vehicleReg: 'DL-03-EF-9012',
    technician: 'Tech D & Tech E',
    allocatedAt: new Date(Date.now() - 45 * 60000),
    utilization: 90,
  },
]

export default function BayManagement() {
  const [bays, setBays] = useState<Bay[]>(mockBays)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-50 border-red-200'
      case 'vacant':
        return 'bg-green-50 border-green-200'
      case 'maintenance':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied':
        return <FiTool className="w-5 h-5 text-red-600" />
      case 'vacant':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />
      case 'maintenance':
        return <FiClock className="w-5 h-5 text-yellow-600" />
      default:
        return null
    }
  }

  const averageUtilization = Math.round(
    bays.reduce((sum, bay) => sum + bay.utilization, 0) / bays.length
  )

  return (
    <div className="space-y-6">
      {/* Bay Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-primary-600">{bays.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Bays</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {bays.filter(b => b.status === 'occupied').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Occupied</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {bays.filter(b => b.status === 'vacant').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Vacant</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{averageUtilization}%</div>
          <div className="text-sm text-gray-600 mt-1">Avg Utilization</div>
        </div>
      </div>

      {/* Bay Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bays.map((bay) => (
          <div
            key={bay.id}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 ${getStatusColor(bay.status)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{bay.name}</h3>
                <p className="text-sm text-gray-600">{bay.type}</p>
              </div>
              {getStatusIcon(bay.status)}
            </div>

            {bay.status === 'occupied' && (
              <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-1">{bay.vehicleReg}</p>
                <p className="text-xs text-gray-600">{bay.technician}</p>
                {bay.allocatedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Allocated: {bay.allocatedAt.toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Utilization</span>
                <span className="text-sm font-medium">{bay.utilization}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    bay.utilization >= 80 ? 'bg-green-500' :
                    bay.utilization >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${bay.utilization}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                {bay.status === 'vacant' ? 'Allocate Vehicle' : 'View Details'}
              </button>
              <button className="p-2 text-gray-600 hover:bg-white rounded">
                <FiEdit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start space-x-3">
          <FiTrendingUp className="w-6 h-6 text-blue-600 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">AI-Driven Bay Optimization Insights</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Bay 4 shows highest utilization (90%) - Consider adding similar bay type</li>
              <li>• Bay 3 has been vacant for 2+ hours - Reallocate resources</li>
              <li>• Express Bays showing 15% faster turnaround - Optimize allocation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

