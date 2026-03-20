import { useState } from 'react'
import { FiTruck, FiCamera, FiEdit, FiCheckCircle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

interface VehicleStage {
  id: string
  regNo: string
  stage: string
  direction: 'In' | 'Out'
  timestamp: Date
  images: string[]
  status: 'pending' | 'completed'
}

const stages = [
  'Main Entry',
  'Washing Entry',
  'Washing Exit',
  'Floor Entry',
  'Floor Exit',
  'Bay',
  'Final Washing',
  'Exit',
]

const mockVehicles: VehicleStage[] = [
  {
    id: '1',
    regNo: 'DL-01-AB-1234',
    stage: 'Main Entry',
    direction: 'In',
    timestamp: new Date(),
    images: [],
    status: 'completed',
  },
  {
    id: '2',
    regNo: 'DL-02-CD-5678',
    stage: 'Washing Entry',
    direction: 'In',
    timestamp: new Date(Date.now() - 10 * 60000),
    images: [],
    status: 'completed',
  },
]

export default function VehicleStages() {
  const [vehicles, setVehicles] = useState<VehicleStage[]>(mockVehicles)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleStage | null>(null)
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Stage Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {stages.map((stage) => {
          const count = vehicles.filter(v => v.stage === stage).length
          return (
            <div
              key={stage}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center"
            >
              <div className="text-2xl font-bold text-primary-600">{count}</div>
              <div className="text-xs text-gray-600 mt-1">{stage}</div>
            </div>
          )
        })}
      </div>

      {/* Vehicle List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Vehicle Tracking Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <FiTruck className="w-4 h-4 text-primary-600" />
                      <button
                        onClick={() => navigate(`/vehicle/${vehicle.regNo}`)}
                        className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        {vehicle.regNo}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{vehicle.stage}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      vehicle.direction === 'In' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {vehicle.direction}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(vehicle.timestamp, 'dd-MM-yyyy HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vehicle.status === 'completed' ? (
                      <span className="flex items-center space-x-1 text-green-600">
                        <FiCheckCircle className="w-4 h-4" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="text-orange-600">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                        title="View Images"
                      >
                        <FiCamera className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title="Edit"
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

