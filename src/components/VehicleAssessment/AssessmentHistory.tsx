'use client'

import { useState } from 'react'
import { FiCamera, FiFilter, FiDownload } from 'react-icons/fi'
import { format } from 'date-fns'

interface HistoryRecord {
  id: string
  vehicleReg: string
  timestamp: Date
  damagesCount: number
  overallCondition: string
  status: 'completed' | 'failed'
}

const mockHistory: HistoryRecord[] = [
  {
    id: '1',
    vehicleReg: 'DL-01-AB-1234',
    timestamp: new Date(),
    damagesCount: 2,
    overallCondition: 'good',
    status: 'completed',
  },
  {
    id: '2',
    vehicleReg: 'DL-02-CD-5678',
    timestamp: new Date(Date.now() - 24 * 3600000),
    damagesCount: 0,
    overallCondition: 'excellent',
    status: 'completed',
  },
  {
    id: '3',
    vehicleReg: 'DL-03-EF-9012',
    timestamp: new Date(Date.now() - 48 * 3600000),
    damagesCount: 1,
    overallCondition: 'fair',
    status: 'completed',
  },
]

export default function AssessmentHistory() {
  const [history, setHistory] = useState<HistoryRecord[]>(mockHistory)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Assessment History</h2>
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Damages</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <FiCamera className="w-4 h-4 text-primary-600" />
                    <span className="font-medium">{record.vehicleReg}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {format(record.timestamp, 'dd-MM-yyyy HH:mm:ss')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {record.damagesCount} detected
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium capitalize">
                    {record.overallCondition}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    record.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded text-sm font-medium">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

