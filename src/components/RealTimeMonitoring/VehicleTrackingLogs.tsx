'use client'

import { useState } from 'react'
import { FiTruck, FiCamera, FiEdit, FiFilter, FiDownload } from 'react-icons/fi'
import { format } from 'date-fns'

interface TrackingLog {
  id: string
  facility: string
  section: string
  regNo: string
  images: string[]
  timestamp: Date
  direction: 'In' | 'Out'
  status: 'verified' | 'pending'
}

const mockLogs: TrackingLog[] = [
  {
    id: '1',
    facility: 'Main Workshop',
    section: 'Main Entry',
    regNo: 'DL-01-AB-1234',
    images: [],
    timestamp: new Date(),
    direction: 'In',
    status: 'verified',
  },
  {
    id: '2',
    facility: 'Main Workshop',
    section: 'Washing Entry',
    regNo: 'DL-02-CD-5678',
    images: [],
    timestamp: new Date(Date.now() - 5 * 60000),
    direction: 'In',
    status: 'verified',
  },
  {
    id: '3',
    facility: 'Main Workshop',
    section: 'Bay 2',
    regNo: 'DL-03-EF-9012',
    images: [],
    timestamp: new Date(Date.now() - 10 * 60000),
    direction: 'In',
    status: 'pending',
  },
]

export default function VehicleTrackingLogs() {
  const [logs, setLogs] = useState<TrackingLog[]>(mockLogs)
  const [filters, setFilters] = useState({
    facility: '',
    section: '',
    direction: '',
    date: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleEdit = (id: string, currentValue: string) => {
    setEditingId(id)
    setEditValue(currentValue)
  }

  const handleSave = (id: string) => {
    setLogs(logs.map(log =>
      log.id === id ? { ...log, regNo: editValue, status: 'verified' as const } : log
    ))
    setEditingId(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Vehicle Tracking Logs</h2>
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
      <div className="p-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={filters.facility}
          onChange={(e) => setFilters({ ...filters, facility: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Facilities</option>
          <option value="main">Main Workshop</option>
        </select>
        <select
          value={filters.section}
          onChange={(e) => setFilters({ ...filters, section: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Sections</option>
          <option value="main-entry">Main Entry</option>
          <option value="washing">Washing</option>
          <option value="bay">Bay</option>
        </select>
        <select
          value={filters.direction}
          onChange={(e) => setFilters({ ...filters, direction: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Directions</option>
          <option value="in">In</option>
          <option value="out">Out</option>
        </select>
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facility</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direction</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.facility}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.section}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === log.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      onBlur={() => handleSave(log.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave(log.id)}
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FiTruck className="w-4 h-4 text-primary-600" />
                      <span className="font-medium">{log.regNo}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(log.timestamp, 'dd-MM-yyyy HH:mm:ss')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.direction === 'In'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {log.direction}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.status === 'verified'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                      title="View Images"
                    >
                      <FiCamera className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(log.id, log.regNo)}
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
  )
}

