'use client'

import { useState } from 'react'
import { FiAlertCircle, FiEdit, FiCheckCircle, FiXCircle } from 'react-icons/fi'

interface Exception {
  id: string
  type: 'no_plate' | 'vernacular_plate' | 'damaged_plate' | 'non_maruti' | 'status_mismatch' | 'non_vehicle'
  description: string
  vehicleReg?: string
  detectedValue?: string
  location: string
  timestamp: Date
  status: 'pending' | 'resolved' | 'ignored'
  resolution?: string
}

const mockExceptions: Exception[] = [
  {
    id: '1',
    type: 'no_plate',
    description: 'New vehicle without number plate detected',
    location: 'Main Entry',
    timestamp: new Date(),
    status: 'pending',
  },
  {
    id: '2',
    type: 'vernacular_plate',
    description: 'Vernacular number plate detected - Low confidence',
    vehicleReg: 'DL-02-XXXX-5678',
    detectedValue: 'DL-02-XXXX-5678',
    location: 'Washing Entry',
    timestamp: new Date(Date.now() - 10 * 60000),
    status: 'pending',
  },
  {
    id: '3',
    type: 'non_maruti',
    description: 'Non-Maruti Suzuki vehicle detected in 3S setup',
    vehicleReg: 'DL-03-HY-9012',
    location: 'Main Entry',
    timestamp: new Date(Date.now() - 20 * 60000),
    status: 'resolved',
    resolution: 'Allowed entry - Customer vehicle',
  },
  {
    id: '4',
    type: 'status_mismatch',
    description: 'Vehicle position does not match Job Card status',
    vehicleReg: 'DL-04-AB-3456',
    location: 'Bay 2',
    timestamp: new Date(Date.now() - 30 * 60000),
    status: 'pending',
  },
]

export default function ExceptionHandling() {
  const [exceptions, setExceptions] = useState<Exception[]>(mockExceptions)

  const getExceptionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      no_plate: 'No Number Plate',
      vernacular_plate: 'Vernacular Plate',
      damaged_plate: 'Damaged Plate',
      non_maruti: 'Non-Maruti Vehicle',
      status_mismatch: 'Status Mismatch',
      non_vehicle: 'Non-Vehicle Object',
    }
    return labels[type] || type
  }

  const getExceptionColor = (type: string) => {
    const colors: Record<string, string> = {
      no_plate: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      vernacular_plate: 'bg-orange-50 border-orange-200 text-orange-800',
      damaged_plate: 'bg-red-50 border-red-200 text-red-800',
      non_maruti: 'bg-blue-50 border-blue-200 text-blue-800',
      status_mismatch: 'bg-purple-50 border-purple-200 text-purple-800',
      non_vehicle: 'bg-gray-50 border-gray-200 text-gray-800',
    }
    return colors[type] || 'bg-gray-50 border-gray-200'
  }

  const handleResolve = (id: string, resolution: string) => {
    setExceptions(exceptions.map(e =>
      e.id === id ? { ...e, status: 'resolved' as const, resolution } : e
    ))
  }

  const handleIgnore = (id: string) => {
    setExceptions(exceptions.map(e =>
      e.id === id ? { ...e, status: 'ignored' as const } : e
    ))
  }

  return (
    <div className="space-y-6">
      {/* Exception Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">
            {exceptions.filter(e => e.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {exceptions.filter(e => e.status === 'resolved').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Resolved</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-600">
            {exceptions.filter(e => e.status === 'ignored').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Ignored</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-primary-600">{exceptions.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Exceptions</div>
        </div>
      </div>

      {/* Exception List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Exception Handling</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {exceptions.map((exception) => (
            <div
              key={exception.id}
              className={`p-6 ${getExceptionColor(exception.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiAlertCircle className="w-5 h-5" />
                    <span className="font-semibold">{getExceptionTypeLabel(exception.type)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      exception.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      exception.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {exception.status}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{exception.description}</p>
                  <div className="flex items-center space-x-4 text-xs opacity-75">
                    {exception.vehicleReg && (
                      <span>Vehicle: {exception.vehicleReg}</span>
                    )}
                    {exception.detectedValue && (
                      <span>Detected: {exception.detectedValue}</span>
                    )}
                    <span>Location: {exception.location}</span>
                    <span>{exception.timestamp.toLocaleString()}</span>
                  </div>
                  {exception.resolution && (
                    <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-sm">
                      <strong>Resolution:</strong> {exception.resolution}
                    </div>
                  )}
                </div>
                {exception.status === 'pending' && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        const resolution = prompt('Enter resolution:')
                        if (resolution) handleResolve(exception.id, resolution)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center space-x-1"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      <span>Resolve</span>
                    </button>
                    <button
                      onClick={() => handleIgnore(exception.id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium flex items-center space-x-1"
                    >
                      <FiXCircle className="w-4 h-4" />
                      <span>Ignore</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

