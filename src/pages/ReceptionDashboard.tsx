import { useState } from 'react'
import { FiUser, FiClock, FiTruck, FiUserPlus, FiEdit, FiCheck, FiX, FiAward } from 'react-icons/fi'
import { format } from 'date-fns'

type VehicleIssue = 'Engine' | 'Transmission' | 'Electrical' | 'AC' | 'Brakes' | 'Suspension' | 'Body' | 'General Service'
type SkillSet = VehicleIssue

interface Vehicle {
  id: string
  regNo: string
  customerName: string
  inTime: Date
  appointment: boolean
  issue: VehicleIssue
  serviceAdvisor?: string
  serviceAdvisorId?: string
  tempVehicle?: boolean
  tempRegNo?: string
  jcOpened: boolean
}

interface ServiceAdvisor {
  id: string
  name: string
  currentLoad: number
  skillSets: SkillSet[]
}

const mockServiceAdvisors: ServiceAdvisor[] = [
  { id: '1', name: 'Rajesh Kumar', currentLoad: 3, skillSets: ['Engine', 'Transmission', 'AC'] },
  { id: '2', name: 'Priya Sharma', currentLoad: 2, skillSets: ['Electrical', 'AC', 'Body'] },
  { id: '3', name: 'Amit Patel', currentLoad: 4, skillSets: ['Brakes', 'Suspension', 'General Service'] },
  { id: '4', name: 'Sneha Verma', currentLoad: 1, skillSets: ['Engine', 'Electrical', 'Brakes'] },
  { id: '5', name: 'Vikram Singh', currentLoad: 2, skillSets: ['Transmission', 'Suspension', 'Body'] },
  { id: '6', name: 'Anjali Mehta', currentLoad: 3, skillSets: ['AC', 'Electrical', 'General Service'] },
]

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    regNo: 'DL-01-AB-1234',
    customerName: 'John Doe',
    inTime: new Date(Date.now() - 120 * 60000),
    appointment: true,
    issue: 'Engine',
    serviceAdvisor: 'Rajesh Kumar',
    serviceAdvisorId: '1',
    jcOpened: true,
  },
  {
    id: '2',
    regNo: 'DL-02-CD-5678',
    customerName: 'Jane Smith',
    inTime: new Date(Date.now() - 90 * 60000),
    appointment: false,
    issue: 'Electrical',
    serviceAdvisor: 'Priya Sharma',
    serviceAdvisorId: '2',
    jcOpened: true,
  },
  {
    id: '3',
    regNo: 'DL-03-EF-9012',
    customerName: 'Robert Johnson',
    inTime: new Date(Date.now() - 75 * 60000),
    appointment: true,
    issue: 'Brakes',
    jcOpened: false,
  },
  {
    id: '4',
    regNo: 'DL-04-GH-3456',
    customerName: 'Sarah Williams',
    inTime: new Date(Date.now() - 60 * 60000),
    appointment: false,
    issue: 'AC',
    jcOpened: false,
  },
  {
    id: '5',
    regNo: 'DL-05-IJ-7890',
    customerName: 'Michael Brown',
    inTime: new Date(Date.now() - 45 * 60000),
    appointment: true,
    issue: 'Transmission',
    jcOpened: false,
  },
  {
    id: '6',
    regNo: 'DL-06-KL-2345',
    customerName: 'Emily Davis',
    inTime: new Date(Date.now() - 30 * 60000),
    appointment: false,
    issue: 'Suspension',
    jcOpened: false,
  },
  {
    id: '7',
    regNo: 'DL-07-MN-6789',
    customerName: 'David Wilson',
    inTime: new Date(Date.now() - 25 * 60000),
    appointment: true,
    issue: 'Body',
    serviceAdvisor: 'Amit Patel',
    serviceAdvisorId: '3',
    jcOpened: true,
  },
  {
    id: '8',
    regNo: 'DL-08-OP-0123',
    customerName: 'Lisa Anderson',
    inTime: new Date(Date.now() - 20 * 60000),
    appointment: false,
    issue: 'General Service',
    jcOpened: false,
  },
  {
    id: '9',
    regNo: 'DL-09-QR-4567',
    customerName: 'James Taylor',
    inTime: new Date(Date.now() - 15 * 60000),
    appointment: true,
    issue: 'Engine',
    serviceAdvisor: 'Sneha Verma',
    serviceAdvisorId: '4',
    jcOpened: true,
  },
  {
    id: '10',
    regNo: 'DL-10-ST-8901',
    customerName: 'Maria Garcia',
    inTime: new Date(Date.now() - 10 * 60000),
    appointment: false,
    issue: 'Electrical',
    jcOpened: false,
  },
  {
    id: '11',
    regNo: 'DL-11-UV-2345',
    customerName: 'William Martinez',
    inTime: new Date(Date.now() - 8 * 60000),
    appointment: true,
    issue: 'AC',
    serviceAdvisor: 'Anjali Mehta',
    serviceAdvisorId: '6',
    jcOpened: true,
  },
  {
    id: '12',
    regNo: 'DL-12-WX-6789',
    customerName: 'Jennifer Lee',
    inTime: new Date(Date.now() - 5 * 60000),
    appointment: false,
    issue: 'Brakes',
    jcOpened: false,
  },
  {
    id: '13',
    regNo: 'DL-13-YZ-0123',
    customerName: 'Christopher White',
    inTime: new Date(Date.now() - 3 * 60000),
    appointment: true,
    issue: 'Transmission',
    serviceAdvisor: 'Vikram Singh',
    serviceAdvisorId: '5',
    jcOpened: true,
  },
  {
    id: '14',
    regNo: 'DL-14-AA-4567',
    customerName: 'Amanda Harris',
    inTime: new Date(Date.now() - 2 * 60000),
    appointment: false,
    issue: 'Suspension',
    jcOpened: false,
  },
  {
    id: '15',
    regNo: 'DL-15-BB-8901',
    customerName: 'Daniel Clark',
    inTime: new Date(Date.now() - 1 * 60000),
    appointment: true,
    issue: 'Body',
    jcOpened: false,
  },
]

export default function ReceptionDashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles)
  const [serviceAdvisors] = useState<ServiceAdvisor[]>(mockServiceAdvisors)
  const [activeTab, setActiveTab] = useState<'assigned' | 'unassigned'>('unassigned')
  const [assigningVehicleId, setAssigningVehicleId] = useState<string | null>(null)
  const [tempVehicleModal, setTempVehicleModal] = useState<{ vehicleId: string; regNo: string } | null>(null)
  const [tempRegInput, setTempRegInput] = useState('')

  // JC-based grouping
  const vehiclesWithSA = vehicles.filter(v => v.jcOpened)
  const vehiclesWithoutSA = vehicles.filter(v => !v.jcOpened)

  const getMatchingServiceAdvisors = (vehicleIssue: VehicleIssue) => {
    return serviceAdvisors
      .map(sa => {
        const assignedVehicles = vehicles.filter(v => v.serviceAdvisorId === sa.id)
        return {
          ...sa,
          currentLoad: assignedVehicles.length,
          isMatch: sa.skillSets.includes(vehicleIssue),
        }
      })
      .sort((a, b) => {
        if (a.isMatch && !b.isMatch) return -1
        if (!a.isMatch && b.isMatch) return 1
        return a.currentLoad - b.currentLoad
      })
  }

  const handleAssignSA = (vehicleId: string, saId: string, saName: string) => {
    setVehicles(vehicles.map(v =>
      v.id === vehicleId
        ? {
            ...v,
            serviceAdvisor: saName,
            serviceAdvisorId: saId,
            tempVehicle: false,
            tempRegNo: undefined,
            jcOpened: true,
          }
        : v
    ))
    setAssigningVehicleId(null)
  }

  const handleSetTempVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    if (vehicle) {
      setTempVehicleModal({ vehicleId, regNo: vehicle.tempRegNo || vehicle.regNo })
      setTempRegInput(vehicle.tempRegNo || '')
    }
  }

  const handleSaveTempVehicle = () => {
    if (tempVehicleModal && tempRegInput.trim()) {
      setVehicles(vehicles.map(v =>
        v.id === tempVehicleModal.vehicleId
          ? { ...v, tempVehicle: true, tempRegNo: tempRegInput.trim(), regNo: tempRegInput.trim() }
          : v
      ))
      setTempVehicleModal(null)
      setTempRegInput('')
    }
  }

  const handleRemoveTempVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    if (vehicle) {
      setVehicles(vehicles.map(v =>
        v.id === vehicleId
          ? { ...v, tempVehicle: false, tempRegNo: undefined, regNo: vehicle.tempRegNo || vehicle.regNo }
          : v
      ))
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reception Dashboard</h1>
        <p className="text-gray-600 mt-1">Service Advisor allocation and vehicle management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-primary-600">{vehicles.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Vehicles</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{vehiclesWithSA.length}</div>
          <div className="text-sm text-gray-600 mt-1">SA Assigned</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">{vehiclesWithoutSA.length}</div>
          <div className="text-sm text-gray-600 mt-1">Pending Assignment</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {vehiclesWithSA.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">JC Opened</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('unassigned')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'unassigned'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Un Allocated ({vehiclesWithoutSA.length})
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assigned'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            In Service ({vehiclesWithSA.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Unallocated Vehicles Tab */}
        {activeTab === 'unassigned' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">In Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Advisor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">JC Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Re-Assign Service Advisor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temporary Vehicle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vehiclesWithoutSA.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <FiClock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{format(vehicle.inTime, 'HH:mm:ss')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <FiTruck className="w-4 h-4 text-primary-600" />
                          <span className={`font-medium ${vehicle.tempVehicle ? 'text-orange-600' : ''}`}>
                            {vehicle.regNo}
                          </span>
                          {vehicle.tempVehicle && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                              Temp
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{vehicle.customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vehicle.serviceAdvisor ? (
                          <div className="flex items-center space-x-2">
                            <FiUser className="w-4 h-4 text-primary-600" />
                            <span className="text-sm font-medium">{vehicle.serviceAdvisor}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Auto assignment pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vehicle.jcOpened ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            JC Opened
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            JC Not Opened
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vehicle.appointment ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            Walk-in
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setAssigningVehicleId(vehicle.id)}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                        >
                          <FiUserPlus className="w-4 h-4" />
                          <span>Re-Assign SA</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vehicle.tempVehicle ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-orange-600 font-medium">Temp: {vehicle.tempRegNo}</span>
                            <button
                              onClick={() => handleRemoveTempVehicle(vehicle.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Remove Temporary Vehicle"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSetTempVehicle(vehicle.id)}
                            className="px-3 py-1.5 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 text-sm"
                          >
                            Set Temp Vehicle
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {vehiclesWithoutSA.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  All vehicles have Service Advisor assigned
                </div>
              )}
            </div>
          </div>
        )}

        {/* In Service (JC Opened) Vehicles Tab */}
        {activeTab === 'assigned' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">In Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Advisor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">JC Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Re-Assign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vehiclesWithSA.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <FiClock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{format(vehicle.inTime, 'HH:mm:ss')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <FiTruck className="w-4 h-4 text-primary-600" />
                          <span className="font-medium">{vehicle.regNo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{vehicle.customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {vehicle.issue}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vehicle.appointment ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            Walk-in
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <FiUser className="w-4 h-4 text-primary-600" />
                          <span className="text-sm font-medium">{vehicle.serviceAdvisor}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          JC Opened
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setAssigningVehicleId(vehicle.id)}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                        >
                          <FiUserPlus className="w-4 h-4" />
                          <span>Re-Assign SA</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {vehiclesWithSA.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No JC opened vehicles in service
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Temporary Vehicle Modal */}
      {tempVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Temporary Vehicle Number</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temporary Registration Number
                </label>
                <input
                  type="text"
                  value={tempRegInput}
                  onChange={(e) => setTempRegInput(e.target.value)}
                  placeholder="Enter temporary vehicle number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTempVehicle()}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">This will replace the current registration number</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveTempVehicle}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setTempVehicleModal(null)
                    setTempRegInput('')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Advisor Assignment Modal */}
      {assigningVehicleId && (() => {
        const vehicle = vehicles.find(v => v.id === assigningVehicleId)
        if (!vehicle) return null
        const matchingSAs = getMatchingServiceAdvisors(vehicle.issue)
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assign Service Advisor</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Vehicle: {vehicle.regNo} | Issue: <span className="font-medium">{vehicle.issue}</span>
                  </p>
                </div>
                <button
                  onClick={() => setAssigningVehicleId(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-700 mb-3">
                  Service Advisors are sorted by skill match and current workload:
                </p>
                {matchingSAs.map((sa) => (
                  <div
                    key={sa.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      sa.isMatch
                        ? 'border-green-300 bg-green-50 hover:bg-green-100'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleAssignSA(vehicle.id, sa.id, sa.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          sa.isMatch ? 'bg-green-200' : 'bg-gray-200'
                        }`}>
                          <FiUser className={`w-6 h-6 ${sa.isMatch ? 'text-green-700' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-gray-900">{sa.name}</p>
                            {sa.isMatch && (
                              <span className="px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs font-medium flex items-center space-x-1">
                                <FiAward className="w-3 h-3" />
                                <span>Skill Match</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-600">
                              Current Load: <span className="font-medium">{sa.currentLoad} vehicles</span>
                            </span>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-600">Skills:</span>
                              <div className="flex flex-wrap gap-1">
                                {sa.skillSets.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-1.5 py-0.5 rounded text-xs ${
                                      skill === vehicle.issue
                                        ? 'bg-green-200 text-green-800 font-medium'
                                        : 'bg-gray-200 text-gray-700'
                                    }`}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAssignSA(vehicle.id, sa.id, sa.name)
                        }}
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setAssigningVehicleId(null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
