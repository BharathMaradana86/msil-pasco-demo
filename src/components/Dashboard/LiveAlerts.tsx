'use client'

import { useState, useEffect } from 'react'
import { FiAlertCircle, FiX, FiClock, FiTruck } from 'react-icons/fi'
import { format } from 'date-fns'

interface Alert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  vehicleReg: string
  timestamp: Date
  stage: string
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'error',
    message: 'Vehicle entered but JC not created',
    vehicleReg: 'DL-01-AB-1234',
    timestamp: new Date(),
    stage: 'Main Entry',
  },
  {
    id: '2',
    type: 'warning',
    message: 'Washing done but allocation pending',
    vehicleReg: 'DL-02-CD-5678',
    timestamp: new Date(Date.now() - 5 * 60000),
    stage: 'Washing Exit',
  },
  {
    id: '3',
    type: 'warning',
    message: 'Allocated but job not started',
    vehicleReg: 'DL-03-EF-9012',
    timestamp: new Date(Date.now() - 10 * 60000),
    stage: 'Bay Allocation',
  },
]

export default function LiveAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Live Alerts</h2>
        <span className="text-sm text-gray-500">{alerts.length} active</span>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiAlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No active alerts</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiAlertCircle className="w-4 h-4" />
                    <span className="font-medium text-sm">{alert.message}</span>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <FiTruck className="w-3 h-3" />
                      <span>{alert.vehicleReg}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiClock className="w-3 h-3" />
                      <span>{format(alert.timestamp, 'HH:mm:ss')}</span>
                    </div>
                  </div>
                  <span className="text-xs mt-1 block opacity-75">{alert.stage}</span>
                </div>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="ml-2 p-1 hover:bg-white hover:bg-opacity-50 rounded"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

