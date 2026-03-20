import React from 'react'
import { FiTool, FiCheckCircle, FiClock } from 'react-icons/fi'

interface Bay {
  id: string
  name: string
  type: string
  status: 'occupied' | 'vacant' | 'maintenance'
  vehicleReg?: string
  technician?: string
}

const mockBays: Bay[] = [
  { id: '1', name: 'Bay 1', type: '2-Tech Bay', status: 'occupied', vehicleReg: 'DL-01-AB-1234', technician: 'Tech A' },
  { id: '2', name: 'Bay 2', type: 'Express Bay', status: 'occupied', vehicleReg: 'DL-02-CD-5678', technician: 'Tech B' },
  { id: '3', name: 'Bay 3', type: 'Smart Bay', status: 'vacant' },
  { id: '4', name: 'Bay 4', type: '2-Tech Bay', status: 'occupied', vehicleReg: 'DL-03-EF-9012', technician: 'Tech C' },
  { id: '5', name: 'Bay 5', type: 'Express Bay', status: 'vacant' },
  { id: '6', name: 'Bay 6', type: 'Smart Bay', status: 'maintenance' },
]

export default function BayStatusOverview() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'vacant':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied':
        return <FiTool className="w-4 h-4" />
      case 'vacant':
        return <FiCheckCircle className="w-4 h-4" />
      case 'maintenance':
        return <FiClock className="w-4 h-4" />
      default:
        return null
    }
  }

  const occupiedCount = mockBays.filter(b => b.status === 'occupied').length
  const vacantCount = mockBays.filter(b => b.status === 'vacant').length

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Bay Status Overview</h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>{occupiedCount} Occupied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>{vacantCount} Vacant</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {mockBays.map((bay) => (
          <div
            key={bay.id}
            className={`p-4 rounded-lg border ${getStatusColor(bay.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{bay.name}</span>
              {getStatusIcon(bay.status)}
            </div>
            <p className="text-xs opacity-75 mb-2">{bay.type}</p>
            {bay.vehicleReg && (
              <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                <p className="text-xs font-medium">{bay.vehicleReg}</p>
                <p className="text-xs opacity-75">{bay.technician}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
