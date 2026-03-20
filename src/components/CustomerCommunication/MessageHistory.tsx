'use client'

import { useState } from 'react'
import { FiMessageSquare, FiPhone, FiCheckCircle, FiFilter, FiDownload } from 'react-icons/fi'
import { format } from 'date-fns'

interface Message {
  id: string
  vehicleReg: string
  customerName: string
  message: string
  channel: 'SMS' | 'WhatsApp' | 'App'
  status: 'sent' | 'failed'
  timestamp: Date
}

const mockMessages: Message[] = [
  {
    id: '1',
    vehicleReg: 'DL-01-AB-1234',
    customerName: 'Rajesh Kumar',
    message: 'Your vehicle has entered the workshop',
    channel: 'WhatsApp',
    status: 'sent',
    timestamp: new Date(),
  },
  {
    id: '2',
    vehicleReg: 'DL-02-CD-5678',
    customerName: 'Priya Sharma',
    message: 'Your vehicle is now in the washing bay',
    channel: 'SMS',
    status: 'sent',
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    id: '3',
    vehicleReg: 'DL-03-EF-9012',
    customerName: 'Amit Patel',
    message: 'Service complete notification',
    channel: 'App',
    status: 'failed',
    timestamp: new Date(Date.now() - 10 * 60000),
  },
]

export default function MessageHistory() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [filters, setFilters] = useState({
    channel: '',
    status: '',
    date: '',
  })

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Message History</h2>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              <FiFilter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
              <FiDownload className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={filters.channel}
          onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Channels</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
          <option value="app">App</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Status</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      {/* Messages Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {messages.map((message) => (
              <tr key={message.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{message.customerName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{message.vehicleReg}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getChannelIcon(message.channel)}
                    <span className="text-sm">{message.channel}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 max-w-md truncate">{message.message}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    message.status === 'sent'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {message.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(message.timestamp, 'dd-MM-yyyy HH:mm:ss')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

