'use client'

import { useState } from 'react'
import { FiSend, FiMessageSquare, FiPhone, FiCheckCircle } from 'react-icons/fi'

interface Update {
  id: string
  vehicleReg: string
  customerName: string
  message: string
  channel: 'SMS' | 'WhatsApp' | 'App'
  status: 'sent' | 'pending' | 'failed'
  timestamp: Date
  stage: string
}

const mockUpdates: Update[] = [
  {
    id: '1',
    vehicleReg: 'DL-01-AB-1234',
    customerName: 'Rajesh Kumar',
    message: 'Your vehicle has entered the workshop. Expected completion: 12:00 PM',
    channel: 'WhatsApp',
    status: 'sent',
    timestamp: new Date(),
    stage: 'Main Entry',
  },
  {
    id: '2',
    vehicleReg: 'DL-02-CD-5678',
    customerName: 'Priya Sharma',
    message: 'Your vehicle is now in the washing bay',
    channel: 'SMS',
    status: 'sent',
    timestamp: new Date(Date.now() - 5 * 60000),
    stage: 'Washing',
  },
  {
    id: '3',
    vehicleReg: 'DL-03-EF-9012',
    customerName: 'Amit Patel',
    message: 'Your vehicle service is complete and ready for delivery',
    channel: 'App',
    status: 'pending',
    timestamp: new Date(Date.now() - 10 * 60000),
    stage: 'Completed',
  },
]

export default function CustomerUpdates() {
  const [updates, setUpdates] = useState<Update[]>(mockUpdates)

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'WhatsApp':
        return <FiMessageSquare className="w-4 h-4 text-green-600" />
      case 'SMS':
        return <FiPhone className="w-4 h-4 text-blue-600" />
      case 'App':
        return <FiCheckCircle className="w-4 h-4 text-purple-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-primary-600">{updates.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Messages</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {updates.filter(u => u.status === 'sent').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Sent</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {updates.filter(u => u.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {updates.filter(u => u.status === 'failed').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Failed</div>
        </div>
      </div>

      {/* Updates List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Customer Updates</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {updates.map((update) => (
            <div key={update.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      {getChannelIcon(update.channel)}
                      <span className="font-medium text-gray-900">{update.customerName}</span>
                    </div>
                    <span className="text-sm text-gray-600">{update.vehicleReg}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(update.status)}`}>
                      {update.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{update.message}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Stage: {update.stage}</span>
                    <span>Channel: {update.channel}</span>
                    <span>{update.timestamp.toLocaleString()}</span>
                  </div>
                </div>
                {update.status === 'pending' && (
                  <button className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                    Send Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

