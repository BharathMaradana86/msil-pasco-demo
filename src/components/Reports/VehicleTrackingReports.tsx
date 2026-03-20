'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FiDownload, FiClock } from 'react-icons/fi'

const stageTimeData = [
  { stage: 'JC Open', avgTime: 8, vehicles: 100 },
  { stage: 'Shop Floor', avgTime: 45, vehicles: 95 },
  { stage: 'Washing', avgTime: 15, vehicles: 90 },
  { stage: 'Road Test', avgTime: 20, vehicles: 85 },
]

const delayedVehicles = [
  { regNo: 'DL-01-AB-1234', stage: 'Shop Floor', delay: '30 min', promisedTime: '12:00' },
  { regNo: 'DL-02-CD-5678', stage: 'Washing', delay: '15 min', promisedTime: '13:00' },
  { regNo: 'DL-03-EF-9012', stage: 'Road Test', delay: '20 min', promisedTime: '14:00' },
]

export default function VehicleTrackingReports() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-primary-600">22 min</div>
          <div className="text-sm text-gray-600 mt-1">Avg Time per Stage</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">88</div>
          <div className="text-sm text-gray-600 mt-1">On-Time Deliveries</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">12</div>
          <div className="text-sm text-gray-600 mt-1">Delayed Vehicles</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">88%</div>
          <div className="text-sm text-gray-600 mt-1">On-Time Rate</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Spent per Stage */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Time Spent per Stage</h3>
            <button className="p-2 hover:bg-gray-100 rounded">
              <FiDownload className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="avgTime" fill="#3b82f6" name="Avg Time (min)" />
              <Bar yAxisId="right" dataKey="vehicles" fill="#10b981" name="Vehicles" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Delayed Vehicles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Delayed Vehicles</h3>
            <button className="p-2 hover:bg-gray-100 rounded">
              <FiDownload className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {delayedVehicles.map((vehicle, index) => (
              <div
                key={index}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{vehicle.regNo}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>Stage: {vehicle.stage}</span>
                      <span>Promised: {vehicle.promisedTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-4 h-4 text-red-600" />
                    <span className="text-red-600 font-medium">{vehicle.delay}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

