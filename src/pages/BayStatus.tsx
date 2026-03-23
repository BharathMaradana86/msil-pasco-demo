import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import {
  FiTool,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiUser,
  FiX,
  FiUsers,
  FiGrid,
  FiMaximize2,
  FiMinimize2,
} from 'react-icons/fi'

interface Bay {
  id: string
  name: string
  type: '2-Tech Bay' | 'Express Bay' | 'Smart Bay'
  status: 'occupied' | 'vacant' | 'maintenance'
  vehicleReg?: string
  vehicleId?: string
  customerName?: string
  technicianIds?: string[]
  technicians?: string[]
  utilization: number
  startTime?: Date
  estimatedCompletion?: Date
}

interface Vehicle {
  id: string
  regNo: string
  customerName: string
  model: string
  serviceType: string
  serviceAdvisor?: string
  jobCardId?: string
  status: 'gate-in' | 'washing' | 'ready-for-allocation' | 'in-service' | 'completed'
  currentBayId?: string
}

interface Technician {
  id: string
  name: string
  role: string
  skills: string[]
  currentBayId?: string
  isAvailable: boolean
  currentLoad: number
}

const mockBays: Bay[] = [
  {
    id: '1',
    name: 'Bay 1',
    type: '2-Tech Bay',
    status: 'occupied',
    vehicleReg: 'DL-01-AB-1234',
    vehicleId: 'v1',
    customerName: 'John Doe',
    technicianIds: ['t1', 't2'],
    technicians: ['Amit Patel', 'Rajesh Kumar'],
    utilization: 85,
    startTime: new Date(Date.now() - 60 * 60000),
    estimatedCompletion: new Date(Date.now() + 30 * 60000),
  },
  {
    id: '2',
    name: 'Bay 2',
    type: 'Express Bay',
    status: 'occupied',
    vehicleReg: 'DL-02-CD-5678',
    vehicleId: 'v2',
    customerName: 'Jane Smith',
    technicianIds: ['t3'],
    technicians: ['Priya Sharma'],
    utilization: 72,
    startTime: new Date(Date.now() - 45 * 60000),
    estimatedCompletion: new Date(Date.now() + 15 * 60000),
  },
  {
    id: '3',
    name: 'Bay 3',
    type: 'Smart Bay',
    status: 'vacant',
    utilization: 65,
  },
  {
    id: '4',
    name: 'Bay 4',
    type: '2-Tech Bay',
    status: 'occupied',
    vehicleReg: 'DL-03-EF-9012',
    vehicleId: 'v3',
    customerName: 'Robert Johnson',
    technicianIds: ['t4', 't5'],
    technicians: ['Sneha Verma', 'Vikram Singh'],
    utilization: 90,
    startTime: new Date(Date.now() - 30 * 60000),
    estimatedCompletion: new Date(Date.now() + 60 * 60000),
  },
  {
    id: '5',
    name: 'Bay 5',
    type: 'Express Bay',
    status: 'vacant',
    utilization: 58,
  },
  {
    id: '6',
    name: 'Bay 6',
    type: 'Smart Bay',
    status: 'maintenance',
    utilization: 0,
  },
  {
    id: '7',
    name: 'Bay 7',
    type: '2-Tech Bay',
    status: 'vacant',
    utilization: 45,
  },
  {
    id: '8',
    name: 'Bay 8',
    type: 'Express Bay',
    status: 'occupied',
    vehicleReg: 'DL-04-GH-3456',
    vehicleId: 'v4',
    customerName: 'Sarah Williams',
    technicianIds: ['t6'],
    technicians: ['Anjali Mehta'],
    utilization: 78,
    startTime: new Date(Date.now() - 20 * 60000),
    estimatedCompletion: new Date(Date.now() + 40 * 60000),
  },
]

const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    regNo: 'DL-01-AB-1234',
    customerName: 'John Doe',
    model: 'Swift',
    serviceType: 'Periodic Service',
    serviceAdvisor: 'Amit Patel',
    jobCardId: 'JC1001',
    status: 'in-service',
    currentBayId: '1',
  },
  {
    id: 'v2',
    regNo: 'DL-02-CD-5678',
    customerName: 'Jane Smith',
    model: 'Baleno',
    serviceType: 'Repair',
    serviceAdvisor: 'Priya Sharma',
    jobCardId: 'JC1002',
    status: 'in-service',
    currentBayId: '2',
  },
  {
    id: 'v3',
    regNo: 'DL-03-EF-9012',
    customerName: 'Robert Johnson',
    model: 'Dzire',
    serviceType: 'Periodic Service',
    serviceAdvisor: 'Sneha Verma',
    jobCardId: 'JC1003',
    status: 'in-service',
    currentBayId: '4',
  },
  {
    id: 'v4',
    regNo: 'DL-04-GH-3456',
    customerName: 'Sarah Williams',
    model: 'Vitara',
    serviceType: 'Repair',
    serviceAdvisor: 'Anjali Mehta',
    jobCardId: 'JC1004',
    status: 'in-service',
    currentBayId: '8',
  },
  {
    id: 'v5',
    regNo: 'DL-05-IJ-7890',
    customerName: 'Michael Brown',
    model: 'Swift',
    serviceType: 'Periodic Service',
    status: 'ready-for-allocation',
  },
  {
    id: 'v6',
    regNo: 'DL-06-KL-2345',
    customerName: 'Emily Davis',
    model: 'Baleno',
    serviceType: 'Repair',
    status: 'ready-for-allocation',
  },
  {
    id: 'v7',
    regNo: 'DL-07-MN-6789',
    customerName: 'David Wilson',
    model: 'Dzire',
    serviceType: 'Periodic Service',
    status: 'washing',
  },
]

const mockTechnicians: Technician[] = [
  {
    id: 't1',
    name: 'Amit Patel',
    role: 'Senior Technician',
    skills: ['Engine', 'Transmission', 'AC'],
    currentBayId: '1',
    isAvailable: false,
    currentLoad: 1,
  },
  {
    id: 't2',
    name: 'Rajesh Kumar',
    role: 'Technician',
    skills: ['Electrical', 'Brakes'],
    currentBayId: '1',
    isAvailable: false,
    currentLoad: 1,
  },
  {
    id: 't3',
    name: 'Priya Sharma',
    role: 'Senior Technician',
    skills: ['AC', 'Electrical', 'Body'],
    currentBayId: '2',
    isAvailable: false,
    currentLoad: 1,
  },
  {
    id: 't4',
    name: 'Sneha Verma',
    role: 'Technician',
    skills: ['Engine', 'Brakes'],
    currentBayId: '4',
    isAvailable: false,
    currentLoad: 1,
  },
  {
    id: 't5',
    name: 'Vikram Singh',
    role: 'Technician',
    skills: ['Transmission', 'Suspension'],
    currentBayId: '4',
    isAvailable: false,
    currentLoad: 1,
  },
  {
    id: 't6',
    name: 'Anjali Mehta',
    role: 'Senior Technician',
    skills: ['AC', 'Electrical', 'General Service'],
    currentBayId: '8',
    isAvailable: false,
    currentLoad: 1,
  },
  {
    id: 't7',
    name: 'Rahul Gupta',
    role: 'Technician',
    skills: ['Engine', 'Transmission'],
    isAvailable: true,
    currentLoad: 0,
  },
  {
    id: 't8',
    name: 'Kavita Nair',
    role: 'Technician',
    skills: ['Electrical', 'AC', 'Body'],
    isAvailable: true,
    currentLoad: 0,
  },
  {
    id: 't9',
    name: 'Mohit Desai',
    role: 'Senior Technician',
    skills: ['Brakes', 'Suspension', 'General Service'],
    isAvailable: true,
    currentLoad: 0,
  },
]

function SortableAllocationBayCard({
  bay,
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
  onRemoveVehicle,
  onRemoveTechnician,
  onOpenAllocationModal,
  getBayAllocationDetails,
}: {
  bay: Bay
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => ReactNode
  getStatusLabel: (status: string) => string
  onRemoveVehicle: (bayId: string) => void
  onRemoveTechnician: (bayId: string, techId: string) => void
  onOpenAllocationModal: (bay: Bay) => void
  getBayAllocationDetails: (bay: Bay) => {
    technician: string
    advisor: string
    service: string
    jobCard: string
    inTime: string
  }
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: bay.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.88 : 1,
    zIndex: isDragging ? 20 : undefined,
  }
  const allocationDetails = getBayAllocationDetails(bay)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-lg border-2 p-4 ${getStatusColor(bay.status)} transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing touch-none select-none`}
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <FiGrid className="w-3.5 h-3.5 shrink-0 opacity-50" aria-hidden />
          <div className="min-w-0">
            <h3 className="text-base font-semibold truncate">{bay.name}</h3>
            <p className="text-xs mt-0.5 opacity-75 truncate">{bay.type}</p>
          </div>
        </div>
        <div className="ml-1 shrink-0">{getStatusIcon(bay.status)}</div>
      </div>

      <div className="mb-2">
        <span className="text-xs font-medium opacity-75">{getStatusLabel(bay.status)}</span>
      </div>

      {bay.status === 'occupied' && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20 space-y-2">
          <div className="text-xs grid grid-cols-[auto_1fr_auto] gap-x-2 gap-y-1">
            <div>Vehicle:</div>
            <div className="font-semibold truncate">{bay.vehicleReg || '-'}</div>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onRemoveVehicle(bay.id)}
              className="p-1 hover:bg-red-200 rounded opacity-75 hover:opacity-100 shrink-0 row-span-2 self-start"
              title="Remove Vehicle"
            >
              <FiX className="w-3 h-3" />
            </button>

            <div>Technician:</div>
            <div className="font-semibold truncate">{allocationDetails.technician}</div>

            <div>Advisor:</div>
            <div className="font-semibold truncate col-span-2">{allocationDetails.advisor}</div>

            <div>Customer:</div>
            <div className="font-semibold truncate col-span-2">{bay.customerName || '-'}</div>

            <div>Service:</div>
            <div className="font-semibold truncate col-span-2">{allocationDetails.service}</div>

            <div>Job Card:</div>
            <div className="font-semibold truncate col-span-2">{allocationDetails.jobCard}</div>

            <div>In Time:</div>
            <div className="font-semibold text-[11px] truncate col-span-2">{allocationDetails.inTime}</div>
          </div>

          {bay.technicians && bay.technicians.length > 0 && (
            <div className="mt-2 space-y-1">
              {bay.technicians.map((tech, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs gap-1">
                  <span className="truncate">{tech}</span>
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onRemoveTechnician(bay.id, bay.technicianIds?.[idx] || '')}
                    className="p-0.5 hover:bg-red-200 rounded opacity-50 hover:opacity-100 shrink-0"
                    title="Remove Technician"
                  >
                    <FiX className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {bay.status === 'vacant' && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20 space-y-2">
          <p className="text-xs font-medium text-green-700">Bay Vacant</p>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onOpenAllocationModal(bay)}
            className="w-full px-2 py-1 text-xs bg-white bg-opacity-50 hover:bg-opacity-75 rounded border border-current border-opacity-30 flex items-center justify-center space-x-1"
          >
            <FiTruck className="w-3 h-3" />
            <span>Assign Vehicle</span>
          </button>
        </div>
      )}

      {bay.status === 'maintenance' && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <p className="text-xs opacity-75">Under Maintenance</p>
        </div>
      )}

      {bay.status === 'occupied' && (
        <div className="mt-3">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onOpenAllocationModal(bay)}
            className="w-full px-2 py-1 text-xs bg-white bg-opacity-50 hover:bg-opacity-75 rounded border border-current border-opacity-30 flex items-center justify-center space-x-1"
          >
            <FiUser className="w-3 h-3" />
            <span>{bay.technicians && bay.technicians.length > 0 ? 'Edit Technicians' : 'Assign Technician'}</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default function BayStatus() {
  const allocationRef = useRef<HTMLDivElement | null>(null)
  const [bays, setBays] = useState<Bay[]>(mockBays)
  const [vehicles] = useState<Vehicle[]>(mockVehicles)
  const [technicians] = useState<Technician[]>(mockTechnicians)
  const [selectedBay, setSelectedBay] = useState<Bay | null>(null)
  const [allocationModal, setAllocationModal] = useState<'assign-technician' | null>(null)
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'metrics' | 'allocation'>('allocation')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const availableVehicles = vehicles.filter(v => v.status === 'ready-for-allocation')
  const availableTechnicians = technicians.filter(t => t.isAvailable)
  
  // Metrics calculations
  const totalBays = bays.length
  const occupiedBays = bays.filter(b => b.status === 'occupied').length
  const vacantBays = bays.filter(b => b.status === 'vacant').length
  const maintenanceBays = bays.filter(b => b.status === 'maintenance').length
  const avgUtilization = Math.round(bays.reduce((sum, bay) => sum + bay.utilization, 0) / bays.length)
  const totalVehiclesInBays = occupiedBays
  const totalTechniciansAssigned = bays.reduce((sum, bay) => sum + (bay.technicianIds?.length || 0), 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-50 border-red-300 text-red-900'
      case 'vacant':
        return 'bg-green-50 border-green-300 text-green-900'
      case 'maintenance':
        return 'bg-yellow-50 border-yellow-300 text-yellow-900'
      default:
        return 'bg-gray-50 border-gray-300 text-gray-900'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied':
        return <FiTool className="w-5 h-5 text-red-600" />
      case 'vacant':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />
      case 'maintenance':
        return <FiClock className="w-5 h-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'Occupied'
      case 'vacant':
        return 'Vacant'
      case 'maintenance':
        return 'Maintenance'
      default:
        return status
    }
  }

  const handleAssignTechnicians = () => {
    if (selectedBay && selectedTechnicians.length > 0) {
      const techNames = selectedTechnicians.map(id => {
        const tech = technicians.find(t => t.id === id)
        return tech?.name || ''
      }).filter(Boolean)

      setBays(bays.map(bay =>
        bay.id === selectedBay.id
          ? {
              ...bay,
              technicianIds: selectedTechnicians,
              technicians: techNames,
            }
          : bay
      ))
      setAllocationModal(null)
      setSelectedBay(null)
      setSelectedTechnicians([])
    }
  }

  const handleRemoveVehicle = (bayId: string) => {
    setBays(bays.map(bay =>
      bay.id === bayId
        ? {
            ...bay,
            status: 'vacant',
            vehicleReg: undefined,
            vehicleId: undefined,
            customerName: undefined,
            technicianIds: undefined,
            technicians: undefined,
            startTime: undefined,
            estimatedCompletion: undefined,
          }
        : bay
    ))
  }

  const handleRemoveTechnician = (bayId: string, techId: string) => {
    setBays(bays.map(bay =>
      bay.id === bayId
        ? {
            ...bay,
            technicianIds: bay.technicianIds?.filter(id => id !== techId),
            technicians: bay.technicians?.filter((_, idx) => bay.technicianIds?.[idx] !== techId),
          }
        : bay
    ))
  }

  const openAllocationModal = (bay: Bay, type: 'assign-technician') => {
    setSelectedBay(bay)
    setAllocationModal(type)
    if (bay.technicianIds) {
      setSelectedTechnicians([...bay.technicianIds])
    }
  }

  const handleAllocationDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setBays((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id)
      const newIndex = prev.findIndex((b) => b.id === over.id)
      if (oldIndex < 0 || newIndex < 0) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && allocationRef.current) {
        await allocationRef.current.requestFullscreen()
      } else if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Failed to toggle fullscreen', error)
    }
  }

  const getMaxTechniciansForBay = (bayType: string) => {
    if (bayType === '2-Tech Bay') return 2
    if (bayType === 'Express Bay') return 1
    if (bayType === 'Smart Bay') return 1
    return 1
  }

  const getBayAllocationDetails = (bay: Bay) => {
    const vehicle = vehicles.find((v) => v.id === bay.vehicleId)
    const technician = bay.technicians?.join(', ') || '-'
    const advisor = vehicle?.serviceAdvisor || '-'
    const service = vehicle?.serviceType || '-'
    const jobCard = vehicle?.jobCardId || (bay.vehicleId ? `JC-${bay.vehicleId.toUpperCase()}` : '-')
    const inTime = bay.startTime ? format(bay.startTime, 'dd MMM hh:mm a') : '-'
    return { technician, advisor, service, jobCard, inTime }
  }

  return (
    <div className="space-y-6 bg-white">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Central Bay Monitoring</h1>
          <p className="text-gray-600 mt-1">
            Oversee bay availability, assignments, and performance in one unified view.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'metrics'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bay Analytics
          </button>
          <button
            onClick={() => setActiveTab('allocation')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'allocation'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bay Allocation
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Bays</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{totalBays}</p>
                  </div>
                  <FiTool className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Occupied</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{occupiedBays}</p>
                  </div>
                  <FiTool className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{vacantBays}</p>
                  </div>
                  <FiCheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Maintenance</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{maintenanceBays}</p>
                  </div>
                  <FiClock className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Utilization</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{avgUtilization}%</p>
                  </div>
                  <FiTool className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Vehicles in Bays</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{totalVehiclesInBays}</p>
                  </div>
                  <FiTruck className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Assigned Technicians</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">{totalTechniciansAssigned}</p>
                  </div>
                  <FiUsers className="w-8 h-8 text-indigo-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Available Technicians</p>
                    <p className="text-2xl font-bold text-teal-600 mt-1">{availableTechnicians.length}</p>
                  </div>
                  <FiUsers className="w-8 h-8 text-teal-400" />
                </div>
              </div>
            </div>

            {/* Bay Utilization merged into analytics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bay Utilization Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {bays.map((bay) => {
                  const getUtilizationColor = (util: number) => {
                    if (util >= 80) return 'bg-green-200 text-green-900 border-green-300'
                    if (util >= 60) return 'bg-green-100 text-green-800 border-green-200'
                    if (util >= 40) return 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    if (util >= 20) return 'bg-slate-50 text-slate-700 border-slate-200'
                    return 'bg-white text-gray-600 border-gray-200'
                  }

                  return (
                    <div
                      key={bay.id}
                      className={`p-4 rounded-lg border transition-all hover:shadow-sm cursor-pointer ${getUtilizationColor(bay.utilization)}`}
                    >
                      <div className="text-center">
                        <p className="text-sm font-semibold mb-1">{bay.name}</p>
                        <p className="text-xs opacity-90 mb-2">{bay.type}</p>
                        <p className="text-2xl font-bold">{bay.utilization}%</p>
                        <p className="text-xs mt-1 opacity-75">
                          {bay.status === 'occupied' ? 'In Use' : bay.status === 'vacant' ? 'Available' : 'Maintenance'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
                  <span>High (80-100%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                  <span>Good (60-79%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-emerald-50 border border-emerald-200 rounded"></div>
                  <span>Moderate (40-59%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-slate-50 border border-slate-200 rounded"></div>
                  <span>Low (20-39%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                  <span>Very Low (0-19%)</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Allocation Tab */}
        {activeTab === 'allocation' && (
          <div ref={allocationRef} className="space-y-6">
            {/* All Bays Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Draggable bay cards */}
              <div className="lg:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Bay Management</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Drag cards to reorder bays. Save layout when you are done.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      // Placeholder: persist order to backend when available
                      console.info('Bay layout order saved', bays.map((b) => b.id))
                    }}
                    className="w-fit px-2.5 py-1.5 rounded-md border border-primary-600 text-primary-700 hover:bg-primary-600 hover:text-white transition-all duration-200 font-semibold cursor-pointer inline-flex justify-center items-center text-sm gap-1.5 shrink-0"
                  >
                    Save Layout
                    <FiCheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleFullscreen()}
                    className="w-fit px-2.5 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold inline-flex justify-center items-center text-sm gap-1.5 shrink-0"
                    title={isFullscreen ? 'Exit full screen allocation view' : 'Open full screen allocation view'}
                  >
                    {isFullscreen ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
                    <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
                  </button>
                </div>
                <DndContext collisionDetection={closestCenter} onDragEnd={handleAllocationDragEnd}>
                  <SortableContext items={bays.map((b) => b.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {bays.map((bay) => (
                        <SortableAllocationBayCard
                          key={bay.id}
                          bay={bay}
                          getStatusColor={getStatusColor}
                          getStatusIcon={getStatusIcon}
                          getStatusLabel={getStatusLabel}
                          onRemoveVehicle={handleRemoveVehicle}
                          onRemoveTechnician={handleRemoveTechnician}
                          onOpenAllocationModal={(b) => openAllocationModal(b, 'assign-technician')}
                          getBayAllocationDetails={getBayAllocationDetails}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {/* Right Sidebar - Available Vehicles */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-md font-semibold text-gray-900 mb-1">Allocation Pending</h3>
                <p className="text-xs text-gray-500 mb-3">Vehicles ready to assign to a bay</p>
                {availableVehicles.length > 0 ? (
                  <div className="space-y-2 max-h-[420px] overflow-y-auto">
                    {availableVehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <p className="font-medium text-gray-900">{vehicle.regNo}</p>
                        <p className="text-sm text-gray-600">{vehicle.customerName}</p>
                        <p className="text-xs text-gray-500">
                          {vehicle.model} - {vehicle.serviceType}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No vehicles ready for allocation</p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Allocation Modals */}
      {allocationModal && selectedBay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Technicians to {selectedBay.name}
              </h3>
              <button
                onClick={() => {
                  setAllocationModal(null)
                  setSelectedBay(null)
                  setSelectedTechnicians([])
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            {/* Assign Technician Modal */}
            {allocationModal === 'assign-technician' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Bay Type: <span className="font-medium">{selectedBay.type}</span> - 
                    Maximum {getMaxTechniciansForBay(selectedBay.type)} technician(s) allowed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Technicians ({selectedTechnicians.length}/{getMaxTechniciansForBay(selectedBay.type)})
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {technicians.map((tech) => {
                      const isSelected = selectedTechnicians.includes(tech.id)
                      const isDisabled = !isSelected && selectedTechnicians.length >= getMaxTechniciansForBay(selectedBay.type)
                      
                      return (
                        <button
                          key={tech.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTechnicians(selectedTechnicians.filter(id => id !== tech.id))
                            } else if (!isDisabled) {
                              setSelectedTechnicians([...selectedTechnicians, tech.id])
                            }
                          }}
                          disabled={isDisabled}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50'
                              : isDisabled
                              ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{tech.name}</p>
                              <p className="text-sm text-gray-600">{tech.role}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {tech.skills.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 bg-white text-xs rounded border"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              {tech.currentBayId ? (
                                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                                  Bay {bays.find(b => b.id === tech.currentBayId)?.name}
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                  Available
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-4 border-t">
                  <button
                    onClick={handleAssignTechnicians}
                    disabled={selectedTechnicians.length === 0}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Assign Technicians
                  </button>
                  <button
                    onClick={() => {
                      setAllocationModal(null)
                      setSelectedBay(null)
                      setSelectedTechnicians([])
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
