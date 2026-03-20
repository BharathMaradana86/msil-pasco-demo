'use client'

import { useState } from 'react'
import { FiSettings, FiEdit, FiPlus } from 'react-icons/fi'

interface Master {
  id: string
  name: string
  type: 'vehicle_type' | 'service_type' | 'bay_type' | 'alert_type'
  values: string[]
}

const mockMasters: Master[] = [
  {
    id: '1',
    name: 'Vehicle Types',
    type: 'vehicle_type',
    values: ['Maruti Suzuki', 'Non-Maruti', 'Hybrid', 'Electric Vehicle'],
  },
  {
    id: '2',
    name: 'Service Types',
    type: 'service_type',
    values: ['Periodic Service', 'Repair', 'Express Service', 'Road Test'],
  },
  {
    id: '3',
    name: 'Bay Types',
    type: 'bay_type',
    values: ['2-Tech Bay', 'Express Bay', 'Smart Bay'],
  },
  {
    id: '4',
    name: 'Alert Types',
    type: 'alert_type',
    values: ['JC Not Created', 'Washing Pending', 'Bay Allocation', 'Delivery Delay'],
  },
]

export default function MastersManagement() {
  const [masters, setMasters] = useState<Master[]>(mockMasters)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Masters Management</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <FiPlus className="w-4 h-4" />
          <span>Add Master</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {masters.map((master) => (
          <div
            key={master.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                  <FiSettings className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900">{master.name}</h3>
              </div>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                <FiEdit className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {master.values.map((value, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-700">{value}</span>
                  <button className="text-red-600 hover:text-red-700 text-sm">Remove</button>
                </div>
              ))}
            </div>

            <button className="mt-4 w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-600">
              + Add Value
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

