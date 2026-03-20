'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FiDownload, FiAlertCircle } from 'react-icons/fi'

const jcOpeningData = [
  { time: '0-5 min', count: 45 },
  { time: '5-10 min', count: 30 },
  { time: '10-15 min', count: 15 },
  { time: '15+ min', count: 10 },
]

const pendingJCData = [
  { regNo: 'DL-01-AB-1234', entryTime: '09:00', elapsed: '15 min', status: 'Critical' },
  { regNo: 'DL-02-CD-5678', entryTime: '09:30', elapsed: '12 min', status: 'Warning' },
  { regNo: 'DL-03-EF-9012', entryTime: '10:00', elapsed: '8 min', status: 'Normal' },
]

export default function JobCardReports() {
  const avgTimeToOpen = 8.5
  const vehiclesReceived = 100
  const jcsOpened = 95

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-primary-600">{avgTimeToOpen} min</div>
          <div className="text-sm text-gray-600 mt-1">Avg Time to Open JC</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{jcsOpened}</div>
          <div className="text-sm text-gray-600 mt-1">JCs Opened</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">{vehiclesReceived - jcsOpened}</div>
          <div className="text-sm text-gray-600 mt-1">Pending JCs</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{vehiclesReceived}</div>
          <div className="text-sm text-gray-600 mt-1">Vehicles Received</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JC Opening Time Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">JC Opening Time Distribution</h3>
            <button className="p-2 hover:bg-gray-100 rounded">
              <FiDownload className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jcOpeningData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pending JCs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Job Cards</h3>
            <button className="p-2 hover:bg-gray-100 rounded">
              <FiDownload className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {pendingJCData.map((jc, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  jc.status === 'Critical' ? 'bg-red-50 border-red-200' :
                  jc.status === 'Warning' ? 'bg-orange-50 border-orange-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{jc.regNo}</p>
                    <p className="text-sm text-gray-600">Entry: {jc.entryTime} • Elapsed: {jc.elapsed}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    jc.status === 'Critical' ? 'bg-red-100 text-red-700' :
                    jc.status === 'Warning' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {jc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

