'use client'

import { useState } from 'react'
import { FiCamera, FiMonitor, FiVolume, FiEdit, FiPlus, FiCheckCircle, FiXCircle } from 'react-icons/fi'

interface Component {
  id: string
  name: string
  type: 'camera' | 'display' | 'buzzer'
  location: string
  status: 'active' | 'inactive' | 'maintenance'
  ipAddress?: string
  lastSeen?: Date
}

const mockComponents: Component[] = [
  {
    id: '1',
    name: 'Camera 1',
    type: 'camera',
    location: 'Main Entry',
    status: 'active',
    ipAddress: '192.168.1.101',
    lastSeen: new Date(),
  },
  {
    id: '2',
    name: 'Display 1',
    type: 'display',
    location: 'Customer Lounge',
    status: 'active',
    ipAddress: '192.168.1.102',
    lastSeen: new Date(),
  },
  {
    id: '3',
    name: 'Buzzer 1',
    type: 'buzzer',
    location: 'Bay 1',
    status: 'inactive',
    ipAddress: '192.168.1.103',
    lastSeen: new Date(Date.now() - 3600000),
  },
]

export default function ComponentManagement() {
  const [components, setComponents] = useState<Component[]>(mockComponents)

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'camera':
        return <FiCamera className="w-5 h-5" />
      case 'display':
        return <FiMonitor className="w-5 h-5" />
      case 'buzzer':
        return <FiVolume className="w-5 h-5" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'inactive':
        return 'bg-gray-100 text-gray-700'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Component Management</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <FiPlus className="w-4 h-4" />
          <span>Add Component</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map((component) => (
          <div
            key={component.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                  {getComponentIcon(component.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{component.name}</h3>
                  <p className="text-sm text-gray-600">{component.location}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(component.status)}`}>
                {component.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{component.type}</span>
              </div>
              {component.ipAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-600">IP Address:</span>
                  <span className="font-medium">{component.ipAddress}</span>
                </div>
              )}
              {component.lastSeen && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Seen:</span>
                  <span className="font-medium">{component.lastSeen.toLocaleTimeString()}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                Configure
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                <FiEdit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

