'use client'

import { useState } from 'react'
import { FiCamera, FiEdit, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi'
import { format } from 'date-fns'

interface ANPRRecord {
  id: string
  regNo: string
  detectedRegNo: string
  confidence: number
  timestamp: Date
  location: string
  image: string
  status: 'verified' | 'pending' | 'error'
  vehicleType: 'Maruti' | 'Non-Maruti'
}

const mockANPRRecords: ANPRRecord[] = [
  {
    id: '1',
    regNo: 'DL-01-AB-1234',
    detectedRegNo: 'DL-01-AB-1234',
    confidence: 98.5,
    timestamp: new Date(),
    location: 'Main Entry',
    image: '',
    status: 'verified',
    vehicleType: 'Maruti',
  },
  {
    id: '2',
    regNo: 'DL-02-CD-5678',
    detectedRegNo: 'DL-02-CD-5678',
    confidence: 95.2,
    timestamp: new Date(Date.now() - 5 * 60000),
    location: 'Washing Entry',
    image: '',
    status: 'pending',
    vehicleType: 'Maruti',
  },
  {
    id: '3',
    regNo: 'DL-03-EF-9012',
    detectedRegNo: 'DL-03-EF-9012',
    confidence: 87.3,
    timestamp: new Date(Date.now() - 10 * 60000),
    location: 'Floor Entry',
    image: '',
    status: 'error',
    vehicleType: 'Non-Maruti',
  },
]

export default function ANPRManagement() {
  const [records, setRecords] = useState<ANPRRecord[]>(mockANPRRecords)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleEdit = (id: string, currentValue: string) => {
    setEditingId(id)
    setEditValue(currentValue)
  }

  const handleSave = (id: string) => {
    setRecords(records.map(r => 
      r.id === id ? { ...r, regNo: editValue, status: 'verified' as const } : r
    ))
    setEditingId(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <FiXCircle className="w-5 h-5 text-red-600" />
      default:
        return <FiAlertCircle className="w-5 h-5 text-orange-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* ANPR Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-primary-600">98.5%</div>
          <div className="text-sm text-gray-600 mt-1">Accuracy Rate</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{records.filter(r => r.status === 'verified').length}</div>
          <div className="text-sm text-gray-600 mt-1">Verified</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">{records.filter(r => r.status === 'pending').length}</div>
          <div className="text-sm text-gray-600 mt-1">Pending Review</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">{records.filter(r => r.status === 'error').length}</div>
          <div className="text-sm text-gray-600 mt-1">Errors</div>
        </div>
      </div>

      {/* ANPR Records */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">ANPR Detection Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detected Reg No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === record.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        onBlur={() => handleSave(record.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave(record.id)}
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium">{record.regNo}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            record.confidence >= 95 ? 'bg-green-500' : 
                            record.confidence >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${record.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm">{record.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{record.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(record.timestamp, 'dd-MM-yyyy HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      record.vehicleType === 'Maruti' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {record.vehicleType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      <span className="text-sm capitalize">{record.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                        title="View Image"
                      >
                        <FiCamera className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(record.id, record.regNo)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title="Edit Registration"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

