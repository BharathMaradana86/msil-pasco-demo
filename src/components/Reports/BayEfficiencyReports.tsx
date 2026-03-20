'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { FiDownload } from 'react-icons/fi'

const bayDurationData = [
  { bay: 'Bay 1', avgDuration: 120, utilization: 85 },
  { bay: 'Bay 2', avgDuration: 95, utilization: 72 },
  { bay: 'Bay 3', avgDuration: 110, utilization: 65 },
  { bay: 'Bay 4', avgDuration: 105, utilization: 90 },
]

const efficiencyTrendData = [
  { date: 'Mon', efficiency: 75 },
  { date: 'Tue', efficiency: 78 },
  { date: 'Wed', efficiency: 82 },
  { date: 'Thu', efficiency: 80 },
  { date: 'Fri', efficiency: 85 },
]

export default function BayEfficiencyReports() {
  const avgEfficiency = 78
  const totalBays = 4
  const occupiedBays = 3

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-primary-600">{avgEfficiency}%</div>
          <div className="text-sm text-gray-600 mt-1">Average Bay Efficiency</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{occupiedBays}/{totalBays}</div>
          <div className="text-sm text-gray-600 mt-1">Occupied Bays</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">105 min</div>
          <div className="text-sm text-gray-600 mt-1">Avg Duration in Bay</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">12</div>
          <div className="text-sm text-gray-600 mt-1">Vehicles Today</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bay Duration & Utilization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bay Duration & Utilization</h3>
            <button className="p-2 hover:bg-gray-100 rounded">
              <FiDownload className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bayDurationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bay" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="avgDuration" fill="#3b82f6" name="Avg Duration (min)" />
              <Bar yAxisId="right" dataKey="utilization" fill="#10b981" name="Utilization (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Efficiency Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Efficiency Trend</h3>
            <button className="p-2 hover:bg-gray-100 rounded">
              <FiDownload className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={efficiencyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={2} name="Efficiency (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

