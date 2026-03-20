'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const vehicleStages = [
  { stage: 'Job Card Open', count: 5 },
  { stage: 'Washing Started', count: 3 },
  { stage: 'Washing Completed', count: 4 },
  { stage: 'Repair Started', count: 6 },
  { stage: 'Completed Repair', count: 2 },
  { stage: 'JC Billed', count: 2 },
  { stage: 'Delivered', count: 1 },
]

export default function VehicleStatusCard() {
  const [data, setData] = useState(vehicleStages)

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setData(vehicleStages.map(stage => ({
        ...stage,
        count: stage.count + Math.floor(Math.random() * 3) - 1
      })))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Status by Stage</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="stage" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

