import { useState } from 'react'
import { 
  FiSettings, 
  FiX, 
  FiClock, 
  FiAlertCircle, 
  FiUsers, 
  FiCamera, 
  FiEdit, 
  FiCheckCircle,
  FiXCircle,
  FiPlus,
  FiSave,
  FiTrash2
} from 'react-icons/fi'

interface WorkingHours {
  day: string
  startTime: string
  endTime: string
  isActive: boolean
}

interface AlertThreshold {
  id: string
  alertType: string
  threshold: number
  unit: string
  severity: 'low' | 'medium' | 'high'
  escalationLevels?: {
    level: number
    threshold: number
    role: string
  }[]
}

interface ManpowerAttendance {
  id: string
  name: string
  role: string
  date: string
  status: 'present' | 'absent'
  lastSynced: string
}

interface Camera {
  id: string
  name: string
  ipAddress: string
  workshop: string
  location: string
  healthStatus: 'online' | 'offline' | 'maintenance'
  roiConfiguration: string
  lastUpdate: Date
}

interface VehicleRejection {
  id: string
  regNo: string
  customerName: string
  reason: string
  submittedBy: string
  submittedAt: Date
  status: 'pending' | 'approved' | 'rejected'
  verifiedBy?: string
  verifiedAt?: Date
  images: string[]
  feedback?: string
}

const mockWorkingHours: WorkingHours[] = [
  { day: 'Monday', startTime: '09:00', endTime: '18:00', isActive: true },
  { day: 'Tuesday', startTime: '09:00', endTime: '18:00', isActive: true },
  { day: 'Wednesday', startTime: '09:00', endTime: '18:00', isActive: true },
  { day: 'Thursday', startTime: '09:00', endTime: '18:00', isActive: true },
  { day: 'Friday', startTime: '09:00', endTime: '18:00', isActive: true },
  { day: 'Saturday', startTime: '09:00', endTime: '15:00', isActive: true },
  { day: 'Sunday', startTime: '00:00', endTime: '00:00', isActive: false },
]

const mockRolesForStation = [
  'Service Advisor',
  'Workshop Manager',
  'Floor Supervisor',
  'Washing Incharge',
  'Yard Incharge',
]

const mockAlertThresholds: AlertThreshold[] = [
  {
    id: '1',
    alertType: 'JC Not Opened',
    threshold: 10,
    unit: 'minutes',
    severity: 'high',
    escalationLevels: [
      { level: 1, threshold: 10, role: 'Service Advisor' },
      { level: 2, threshold: 20, role: 'Workshop Manager' },
    ],
  },
  {
    id: '2',
    alertType: 'Washing Delay',
    threshold: 30,
    unit: 'minutes',
    severity: 'medium',
    escalationLevels: [
      { level: 1, threshold: 30, role: 'Washing Incharge' },
    ],
  },
  {
    id: '3',
    alertType: 'Bay Allocation Delay',
    threshold: 15,
    unit: 'minutes',
    severity: 'high',
    escalationLevels: [
      { level: 1, threshold: 15, role: 'Floor Supervisor' },
      { level: 2, threshold: 30, role: 'Workshop Manager' },
    ],
  },
  {
    id: '4',
    alertType: 'Service Completion Delay',
    threshold: 60,
    unit: 'minutes',
    severity: 'medium',
    escalationLevels: [
      { level: 1, threshold: 60, role: 'Service Advisor' },
    ],
  },
  {
    id: '5',
    alertType: 'Vehicle Idle Time',
    threshold: 120,
    unit: 'minutes',
    severity: 'low',
    escalationLevels: [
      { level: 1, threshold: 120, role: 'Yard Incharge' },
    ],
  },
]

const mockManpowerAttendance: ManpowerAttendance[] = [
  { id: '1', name: 'Amit Patel', role: 'Senior Technician', date: '2024-01-15', status: 'present', lastSynced: '2024-01-15 18:10' },
  { id: '2', name: 'Rajesh Kumar', role: 'Technician', date: '2024-01-15', status: 'present', lastSynced: '2024-01-15 18:00' },
  { id: '3', name: 'Priya Sharma', role: 'Senior Technician', date: '2024-01-15', status: 'present', lastSynced: '2024-01-15 17:30' },
  { id: '4', name: 'Sneha Verma', role: 'Technician', date: '2024-01-15', status: 'absent', lastSynced: '2024-01-15 09:00' },
]

const mockCameras: Camera[] = [
  {
    id: '1',
    name: 'Main Gate Camera 1',
    ipAddress: '192.168.1.101',
    workshop: 'Workshop A',
    location: 'Main Entry Gate',
    healthStatus: 'online',
    roiConfiguration: 'Vehicle Detection Zone 1, 2',
    lastUpdate: new Date(Date.now() - 5 * 60000),
  },
  {
    id: '2',
    name: 'Washing Bay Camera 1',
    ipAddress: '192.168.1.102',
    workshop: 'Workshop A',
    location: 'Washing Bay Entry',
    healthStatus: 'online',
    roiConfiguration: 'Vehicle Entry Zone',
    lastUpdate: new Date(Date.now() - 2 * 60000),
  },
  {
    id: '3',
    name: 'Shop Floor Camera 1',
    ipAddress: '192.168.1.103',
    workshop: 'Workshop A',
    location: 'Bay 1-3',
    healthStatus: 'offline',
    roiConfiguration: 'Bay Monitoring Zone',
    lastUpdate: new Date(Date.now() - 120 * 60000),
  },
  {
    id: '4',
    name: 'Main Gate Camera 2',
    ipAddress: '192.168.1.104',
    workshop: 'Workshop B',
    location: 'Main Entry Gate',
    healthStatus: 'maintenance',
    roiConfiguration: 'Vehicle Detection Zone 1',
    lastUpdate: new Date(Date.now() - 240 * 60000),
  },
]

const mockVehicleRejections: VehicleRejection[] = [
  {
    id: '1',
    regNo: 'DL-01-AB-1234',
    customerName: 'John Doe',
    reason: 'Vehicle condition not suitable for service',
    submittedBy: 'Rajesh Kumar',
    submittedAt: new Date(Date.now() - 60 * 60000),
    status: 'pending',
    images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
  },
  {
    id: '2',
    regNo: 'DL-02-CD-5678',
    customerName: 'Jane Smith',
    reason: 'Customer requested cancellation',
    submittedBy: 'Priya Sharma',
    submittedAt: new Date(Date.now() - 30 * 60000),
    status: 'pending',
    images: ['image4.jpg', 'image5.jpg'],
  },
  {
    id: '3',
    regNo: 'DL-03-EF-9012',
    customerName: 'Robert Johnson',
    reason: 'Incomplete documentation',
    submittedBy: 'Amit Patel',
    submittedAt: new Date(Date.now() - 120 * 60000),
    status: 'approved',
    verifiedBy: 'Admin User',
    verifiedAt: new Date(Date.now() - 90 * 60000),
    images: ['image6.jpg'],
  },
]

export default function Administration() {
  const [activeTab, setActiveTab] = useState<'settings' | 'vehicle-rejection'>('settings')
  const [settingsTab, setSettingsTab] = useState<'working-hours' | 'alerts' | 'manpower' | 'cameras'>('working-hours')
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(mockWorkingHours)
  const [alertThresholds, setAlertThresholds] = useState<AlertThreshold[]>(mockAlertThresholds)
  const [manpowerAttendance, setManpowerAttendance] = useState<ManpowerAttendance[]>(mockManpowerAttendance)
  const [cameras] = useState<Camera[]>(mockCameras)
  const [vehicleRejections, setVehicleRejections] = useState<VehicleRejection[]>(mockVehicleRejections)
  const [editingWorkingHours, setEditingWorkingHours] = useState<string | null>(null)
  const [editingThreshold, setEditingThreshold] = useState<string | null>(null)
  const [activeAlertConfig, setActiveAlertConfig] = useState<AlertThreshold | null>(null)
  const [baseThresholdInput, setBaseThresholdInput] = useState('')
  const [selectedRejection, setSelectedRejection] = useState<string | null>(null)
  const [viewingImages, setViewingImages] = useState<string[] | null>(null)
  const [editingFeedback, setEditingFeedback] = useState<VehicleRejection | null>(null)
  const [feedbackText, setFeedbackText] = useState('')

  const handleSaveWorkingHours = (day: string, startTime: string, endTime: string, isActive: boolean) => {
    setWorkingHours(workingHours.map(wh =>
      wh.day === day ? { ...wh, startTime, endTime, isActive } : wh
    ))
    setEditingWorkingHours(null)
  }

  const handleSaveThreshold = (id: string, threshold: number) => {
    setAlertThresholds(alertThresholds.map(at =>
      at.id === id ? { ...at, threshold } : at
    ))
    setEditingThreshold(null)
  }

  const handleAddEscalationLevel = (id: string) => {
    setAlertThresholds(prev =>
      prev.map(at => {
        if (at.id !== id) return at
        const levels = at.escalationLevels || []
        const nextLevel = levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1
        return {
          ...at,
          escalationLevels: [
            ...levels,
            {
              level: nextLevel,
              threshold: at.threshold,
              role: mockRolesForStation[0],
            },
          ],
        }
      })
    )
  }

  const handleUpdateEscalationThreshold = (alertId: string, levelIndex: number, value: number) => {
    setAlertThresholds(prev =>
      prev.map(at => {
        if (at.id !== alertId || !at.escalationLevels) return at
        const updated = [...at.escalationLevels]
        updated[levelIndex] = { ...updated[levelIndex], threshold: value }
        return { ...at, escalationLevels: updated }
      })
    )
  }

  const handleUpdateEscalationRole = (alertId: string, levelIndex: number, role: string) => {
    setAlertThresholds(prev =>
      prev.map(at => {
        if (at.id !== alertId || !at.escalationLevels) return at
        const updated = [...at.escalationLevels]
        updated[levelIndex] = { ...updated[levelIndex], role }
        return { ...at, escalationLevels: updated }
      })
    )
  }

  const handleRemoveEscalationLevel = (alertId: string, levelIndex: number) => {
    setAlertThresholds(prev =>
      prev.map(at => {
        if (at.id !== alertId || !at.escalationLevels) return at
        const updated = at.escalationLevels.filter((_, idx) => idx !== levelIndex)
        return { ...at, escalationLevels: updated }
      })
    )
  }

  const handleRejectVehicle = (id: string, action: 'approve' | 'reject') => {
    setVehicleRejections(vehicleRejections.map(vr =>
      vr.id === id
        ? {
            ...vr,
            status: action === 'approve' ? 'approved' : 'rejected',
            verifiedBy: 'Current User',
            verifiedAt: new Date(),
          }
        : vr
    ))
    setSelectedRejection(null)
  }

  const handleSaveFeedback = () => {
    if (editingFeedback) {
      setVehicleRejections(prev =>
        prev.map(v =>
          v.id === editingFeedback.id ? { ...v, feedback: feedbackText.trim() || undefined } : v
        )
      )
      setEditingFeedback(null)
      setFeedbackText('')
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-700'
      case 'offline':
        return 'bg-red-100 text-red-700'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700'
      case 'absent':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const tabs = [
    { id: 'settings', label: 'Settings' },
    { id: 'vehicle-rejection', label: 'Internal Vehicles' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
        <p className="text-gray-600 mt-1">System settings and vehicle management</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            {/* Settings Sub-Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setSettingsTab('working-hours')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    settingsTab === 'working-hours'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Working Hours
                </button>
                <button
                  onClick={() => setSettingsTab('alerts')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    settingsTab === 'alerts'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Alerts Threshold
                </button>
                <button
                  onClick={() => setSettingsTab('manpower')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    settingsTab === 'manpower'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Manpower Attendance
                </button>
                <button
                  onClick={() => setSettingsTab('cameras')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    settingsTab === 'cameras'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Camera Management
                </button>
              </nav>
            </div>

            {/* Settings Tab Content */}
            <div>
              {/* Working Hours Management Tab */}
              {settingsTab === 'working-hours' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Working Hours Management</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {workingHours.map((wh) => (
                          <tr key={wh.day} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{wh.day}</td>
                            <td className="px-4 py-3 text-gray-600">
                              {editingWorkingHours === wh.day ? (
                                <input
                                  type="time"
                                  defaultValue={wh.startTime}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                  id={`start-${wh.day}`}
                                />
                              ) : (
                                wh.startTime
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {editingWorkingHours === wh.day ? (
                                <input
                                  type="time"
                                  defaultValue={wh.endTime}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                  id={`end-${wh.day}`}
                                />
                              ) : (
                                wh.endTime
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {editingWorkingHours === wh.day ? (
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    defaultChecked={wh.isActive}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    id={`active-${wh.day}`}
                                  />
                                  <span className="text-sm text-gray-600">Active</span>
                                </label>
                              ) : (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  wh.isActive ? 'bg-gray-100 text-gray-700' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {wh.isActive ? 'Active' : 'Inactive'}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {editingWorkingHours === wh.day ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => {
                                      const startInput = document.getElementById(`start-${wh.day}`) as HTMLInputElement
                                      const endInput = document.getElementById(`end-${wh.day}`) as HTMLInputElement
                                      const activeInput = document.getElementById(`active-${wh.day}`) as HTMLInputElement
                                      handleSaveWorkingHours(
                                        wh.day,
                                        startInput?.value || wh.startTime,
                                        endInput?.value || wh.endTime,
                                        activeInput?.checked ?? wh.isActive
                                      )
                                    }}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                    title="Save"
                                  >
                                    <FiSave className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingWorkingHours(null)}
                                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                    title="Cancel"
                                  >
                                    <FiX className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingWorkingHours(wh.day)}
                                  className="p-1.5 text-primary-600 hover:bg-primary-50 rounded"
                                  title="Edit"
                                >
                                  <FiEdit className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Alerts Threshold Configurations Tab */}
              {settingsTab === 'alerts' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Alerts Threshold</h2>
                  <p className="text-xs text-gray-500 mb-4 max-w-3xl">
                    Configure when alerts should trigger and who they should escalate to. Use lower thresholds for
                    critical stages (e.g., JC not opened) and higher thresholds for less critical ones (e.g., idle time).
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alert Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summary</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Configure</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {alertThresholds.map((threshold) => (
                          <tr key={threshold.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{threshold.alertType}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  threshold.severity === 'high'
                                    ? 'bg-gray-200 text-gray-800'
                                    : threshold.severity === 'medium'
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-gray-50 text-gray-600'
                                }`}
                              >
                                {threshold.severity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">
                              <div>
                                <span className="font-medium">
                                  Base: {threshold.threshold} {threshold.unit}
                                </span>
                              </div>
                              <div className="mt-1">
                                {threshold.escalationLevels && threshold.escalationLevels.length > 0 ? (
                                  <span>
                                    {threshold.escalationLevels.length} level(s):{' '}
                                    {threshold.escalationLevels
                                      .map((l) => `L${l.level} → ${l.role}`)
                                      .join(', ')}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">No escalation configured</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  setActiveAlertConfig(threshold)
                                  setBaseThresholdInput(String(threshold.threshold))
                                }}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-xs"
                              >
                                <FiSettings className="w-3 h-3" />
                                <span>Configure</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Manpower Attendance Details Tab */}
              {settingsTab === 'manpower' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Manpower Attendance Details</h2>
                  <p className="text-xs text-gray-500 mb-4">
                    Status is marked as <span className="font-semibold">Present</span> by default. Update to{' '}
                    <span className="font-semibold">Absent</span> when a resource is not available.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Edit</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Synced</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {manpowerAttendance.map((attendance) => (
                          <tr key={attendance.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{attendance.name}</td>
                            <td className="px-4 py-3 text-gray-600">{attendance.role}</td>
                            <td className="px-4 py-3 text-gray-600">{attendance.date}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(attendance.status)}`}>
                                {attendance.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={attendance.status}
                                onChange={(e) => {
                                  const value = e.target.value as 'present' | 'absent'
                                  setManpowerAttendance(prev =>
                                    prev.map(m =>
                                      m.id === attendance.id ? { ...m, status: value } : m
                                    )
                                  )
                                }}
                                className="px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                              >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-xs">{attendance.lastSynced}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Camera Management Tab */}
              {settingsTab === 'cameras' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Camera Management</h2>
                    <button className="flex items-center space-x-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                      <FiPlus className="w-4 h-4" />
                      <span>Add Camera</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Camera Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workshop</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROI Configuration</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Update</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {cameras.map((camera) => (
                          <tr key={camera.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{camera.name}</td>
                            <td className="px-4 py-3 text-gray-600">{camera.ipAddress}</td>
                            <td className="px-4 py-3 text-gray-600">{camera.workshop}</td>
                            <td className="px-4 py-3 text-gray-600">{camera.location}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getHealthStatusColor(camera.healthStatus)}`}>
                                {camera.healthStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{camera.roiConfiguration}</td>
                            <td className="px-4 py-3 text-gray-600">
                              {new Date(camera.lastUpdate).toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                className="p-1.5 text-primary-600 hover:bg-primary-50 rounded"
                                title="Configure"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Internal Vehicles Tab */}
        {activeTab === 'vehicle-rejection' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Internal Vehicles Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedback / Exception</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vehicleRejections.map((rejection) => (
                    <tr key={rejection.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{rejection.regNo}</td>
                      <td className="px-4 py-3 text-gray-600">{rejection.reason}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex items-center justify-between space-x-2">
                          <span className="text-xs text-gray-700 truncate max-w-[180px]">
                            {rejection.feedback || 'No feedback added'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingFeedback(rejection)
                              setFeedbackText(rejection.feedback || '')
                            }}
                            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded"
                            title="Edit feedback / reason"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {rejection.images && rejection.images.length > 0 ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex -space-x-2">
                              {rejection.images.slice(0, 3).map((img, idx) => (
                                <div
                                  key={idx}
                                  className="w-10 h-10 bg-gray-100 border-2 border-white rounded cursor-pointer hover:scale-110 transition-transform"
                                  onClick={() => setViewingImages(rejection.images)}
                                  title={img}
                                >
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FiCamera className="w-5 h-5 text-gray-400" />
                                  </div>
                                </div>
                              ))}
                            </div>
                            {rejection.images.length > 3 && (
                              <span className="text-xs text-gray-500">+{rejection.images.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No images</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{rejection.submittedBy}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(rejection.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {rejection.verifiedBy || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {rejection.status === 'pending' ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleRejectVehicle(rejection.id, 'approve')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Approve"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectVehicle(rejection.id, 'reject')}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Reject"
                            >
                              <FiXCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {rejection.verifiedAt ? new Date(rejection.verifiedAt).toLocaleString() : '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alerts Threshold Configuration Modal */}
        {activeAlertConfig && (() => {
          const current = alertThresholds.find(a => a.id === activeAlertConfig.id)
          if (!current) return null

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Configure Alert - {current.alertType}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                      Tip: Use a shorter threshold and fewer escalation steps for critical alerts (like JC not opened),
                      and slightly higher thresholds with more gradual escalation for less critical alerts (like idle time).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveAlertConfig(null)
                      setBaseThresholdInput('')
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Base configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Base Threshold
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={baseThresholdInput}
                        onChange={(e) => setBaseThresholdInput(e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                      />
                      <span className="text-xs text-gray-600">{current.unit}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        current.severity === 'high'
                          ? 'bg-gray-200 text-gray-800'
                          : current.severity === 'medium'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {current.severity}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Suggestions
                    </label>
                    <p className="text-[11px] text-gray-500">
                      High severity: 10–15 minutes. Medium: 30–60 minutes. Low: 60+ minutes.
                    </p>
                  </div>
                </div>

                {/* Escalation levels */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">Escalation Levels</h4>
                    <button
                      onClick={() => handleAddEscalationLevel(current.id)}
                      className="inline-flex items-center space-x-1 px-2 py-1 text-xs border border-dashed border-gray-300 rounded hover:bg-gray-50"
                    >
                      <FiPlus className="w-3 h-3" />
                      <span>Add Level</span>
                    </button>
                  </div>
                  {(current.escalationLevels || []).length === 0 ? (
                    <p className="text-xs text-gray-400">
                      No escalation configured yet. Add levels to notify different roles if the alert remains unresolved.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {(current.escalationLevels || []).map((level, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded px-2 py-1.5"
                        >
                          <span className="text-xs text-gray-500 font-medium">Level {level.level}</span>
                          <span className="text-[11px] text-gray-500">after</span>
                          <input
                            type="number"
                            value={level.threshold}
                            onChange={(e) =>
                              handleUpdateEscalationThreshold(
                                current.id,
                                idx,
                                parseInt(e.target.value || '0', 10)
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                          />
                          <span className="text-xs text-gray-500">{current.unit}</span>
                          <span className="text-[11px] text-gray-500">escalate to</span>
                          <select
                            value={level.role}
                            onChange={(e) =>
                              handleUpdateEscalationRole(current.id, idx, e.target.value)
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                          >
                            {mockRolesForStation.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleRemoveEscalationLevel(current.id, idx)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Remove level"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer actions */}
                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-[11px] text-gray-500 max-w-sm">
                    Note: Base threshold defines when the first alert is raised. Escalation levels define who is notified
                    if the condition continues beyond that time.
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        const value = parseInt(baseThresholdInput || '0', 10)
                        if (!isNaN(value)) {
                          handleSaveThreshold(current.id, value)
                        }
                        setActiveAlertConfig(null)
                        setBaseThresholdInput('')
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setActiveAlertConfig(null)
                        setBaseThresholdInput('')
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Image Viewer Modal */}
        {viewingImages && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Vehicle Images</h3>
                <button
                  onClick={() => setViewingImages(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {viewingImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-video bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-300 transition-colors"
                  >
                    <div className="text-center">
                      <FiCamera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">{img}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Internal Vehicle Feedback Modal */}
        {editingFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Feedback / Exception Reason</h3>
                <button
                  onClick={() => {
                    setEditingFeedback(null)
                    setFeedbackText('')
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 mb-4">
                <p className="text-sm text-gray-700">
                  Vehicle: <span className="font-medium">{editingFeedback.regNo}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Add a brief note explaining why this internal vehicle is an exception (e.g., demo car, test drive,
                  workshop use, etc.).
                </p>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter feedback / exception reason..."
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    setEditingFeedback(null)
                    setFeedbackText('')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFeedback}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
