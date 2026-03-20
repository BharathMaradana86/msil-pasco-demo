import { useState, useMemo, useEffect } from 'react'
import { FiTruck, FiClock, FiCheckCircle, FiSearch, FiChevronLeft, FiChevronRight, FiAlertCircle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db, SERVICE_STATION_ID, SUB_STATION_ID } from '../../lib/firebase'
import { format } from 'date-fns'
import {
  loadWorkshopSeedData,
  parseSeedTimestamp,
  getReportYear,
  USE_LOCAL_WORKSHOP_SEED,
} from '../../lib/workshopSeed'
import { useWorkshopReport } from '../../context/WorkshopReportContext'

interface VehicleStatus {
  regNo: string
  advisor: string
  model: string
  serviceType: string
  status: 'pending' | 'in-progress' | 'completed'
  jcOpening: string | Date | null
  washing: string | Date | null
  shopFloor: string | Date | null
  roadTest: string | Date | null
  delivery: string | Date | null
  inTime: string
  jobCardId?: string
}

interface JobCardFromFirestore {
  id: string
  vehicleRegistrationNumber?: string
  lastEvent?: string
  status?: string
  jcDetails?: { SRV_SDV_NAME?: string; SRV_MODEL?: string; SRV_TYPE?: string; JC_OPEN_DATE?: string }
  vehicleDetails?: { model?: string }
  createdAt?: { toDate?: () => Date }
}

interface VehicleTickerProps {
  mode?: 'time' | 'status'
}

const fetchLatestEvent = async (jobCardId: string, eventType: string): Promise<Date | null> => {
  try {
    const eventsRef = collection(
      db,
      'ServiceStation',
      SERVICE_STATION_ID,
      'subStation',
      SUB_STATION_ID,
      'jobCards',
      jobCardId,
      'events'
    )
    
    // Try activityType first (new format)
    try {
      const q = query(
        eventsRef,
        where('activityType', '==', eventType),
        orderBy('createdAt', 'desc'),
        limit(1)
      )
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const event = snapshot.docs[0].data()
        const timestamp = event.timestamp
          ? typeof event.timestamp === 'object' && 'toDate' in event.timestamp
            ? event.timestamp.toDate()
            : event.timestamp instanceof Date
            ? event.timestamp
            : typeof event.timestamp === 'string'
            ? new Date(event.timestamp)
            : null
          : event.createdAt
          ? typeof event.createdAt === 'object' && 'toDate' in event.createdAt
            ? event.createdAt.toDate()
            : event.createdAt instanceof Date
            ? event.createdAt
            : null
          : null
        if (timestamp) return timestamp
      }
    } catch (activityTypeError) {
      // If orderBy fails, try without orderBy
      try {
        const q = query(
          eventsRef,
          where('activityType', '==', eventType),
          limit(1)
        )
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          const event = snapshot.docs[0].data()
          const timestamp = event.timestamp
            ? typeof event.timestamp === 'object' && 'toDate' in event.timestamp
              ? event.timestamp.toDate()
              : event.timestamp instanceof Date
              ? event.timestamp
              : typeof event.timestamp === 'string'
              ? new Date(event.timestamp)
              : null
            : event.createdAt
            ? typeof event.createdAt === 'object' && 'toDate' in event.createdAt
              ? event.createdAt.toDate()
              : event.createdAt instanceof Date
              ? event.createdAt
              : null
            : null
          if (timestamp) return timestamp
        }
      } catch (err) {
        // Fall through to try eventType
      }
    }
    
    // Fallback to eventType (old format)
    try {
      const q = query(
        eventsRef,
        where('eventType', '==', eventType),
        orderBy('createdAt', 'desc'),
        limit(1)
      )
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const event = snapshot.docs[0].data()
        const timestamp = event.timestamp
          ? typeof event.timestamp === 'object' && 'toDate' in event.timestamp
            ? event.timestamp.toDate()
            : event.timestamp instanceof Date
            ? event.timestamp
            : typeof event.timestamp === 'string'
            ? new Date(event.timestamp)
            : null
          : event.createdAt
          ? typeof event.createdAt === 'object' && 'toDate' in event.createdAt
            ? event.createdAt.toDate()
            : event.createdAt instanceof Date
            ? event.createdAt
            : null
          : null
        if (timestamp) return timestamp
      }
    } catch (eventTypeError) {
      // Ignore and return null
    }
  } catch (error) {
    console.error(`Error fetching ${eventType} event:`, error)
  }
  return null
}

async function mapJobCardToVehicleStatus(jc: JobCardFromFirestore): Promise<VehicleStatus> {
  const statusMap = { PENDING: 'pending' as const, OPEN: 'in-progress' as const, BILLED: 'completed' as const }
  const ts = jc.createdAt?.toDate?.() || jc.jcDetails?.JC_OPEN_DATE
  const inTime = ts ? (ts instanceof Date ? ts.toTimeString().slice(0, 5) : ts.slice(-5)) : '-'
  
  const jobCardId = jc.id
  
  // Fetch latest events for each stage
  const [jcOpening, washing, shopFloor, roadTest, finalExit, delivered] = await Promise.all([
    fetchLatestEvent(jobCardId, 'JC_OPENED').catch(() => null),
    fetchLatestEvent(jobCardId, 'WASH_IN').catch(() => null) || fetchLatestEvent(jobCardId, 'WASHING').catch(() => null),
    fetchLatestEvent(jobCardId, 'SHOP_FLOOR_ENTRY').catch(() => null) || fetchLatestEvent(jobCardId, 'SHOP_FLOOR').catch(() => null),
    fetchLatestEvent(jobCardId, 'ROAD_TEST_QUEUE_IN').catch(() => null) || fetchLatestEvent(jobCardId, 'ROAD_TEST').catch(() => null),
    fetchLatestEvent(jobCardId, 'FINAL_EXIT').catch(() => null),
    fetchLatestEvent(jobCardId, 'DELIVERED').catch(() => null),
  ])
  
  const delivery = finalExit || delivered

  return {
    regNo: jc.vehicleRegistrationNumber || jc.id || '-',
    advisor: jc.jcDetails?.SRV_SDV_NAME || '-',
    model: jc.jcDetails?.SRV_MODEL || jc.vehicleDetails?.model || '-',
    serviceType: jc.jcDetails?.SRV_TYPE || '-',
    status: statusMap[jc.status as keyof typeof statusMap] || 'pending',
    jcOpening,
    washing,
    shopFloor,
    roadTest,
    delivery: delivery || (jc.status === 'BILLED' ? 'Billed' : null),
    inTime,
    jobCardId,
  }
}

export default function VehicleTicker({ mode = 'status' }: VehicleTickerProps) {
  const { reportDate } = useWorkshopReport()
  const [jobCards, setJobCards] = useState<JobCardFromFirestore[]>([])
  const [vehicles, setVehicles] = useState<VehicleStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!USE_LOCAL_WORKSHOP_SEED) return
    if (!reportDate) {
      setJobCards([])
      setVehicles([])
      setLoading(false)
      return
    }
    setLoading(true)
    loadWorkshopSeedData(reportDate)
      .then((seed) => {
        const year = getReportYear(seed)
        const mappedVehicles: VehicleStatus[] = seed.vehicles.map((v) => {
          const findTime = (eventType: string) => {
            const event = [...v.events].reverse().find((e) => e.eventType === eventType)
            return parseSeedTimestamp(event?.timestampText, year)
          }
          const gateIn = findTime('GATE_IN')
          return {
            regNo: v.vehicleRegistrationNumber,
            advisor: v.jcDetails?.SRV_SDV_NAME || '-',
            model: v.jcDetails?.SRV_MODEL || '-',
            serviceType: v.jcDetails?.SRV_TYPE || 'General Service',
            status: v.status === 'BILLED' ? 'completed' : v.status === 'OPEN' ? 'in-progress' : 'pending',
            jcOpening: findTime('JC_OPENED') || gateIn,
            washing: findTime('WASH_IN'),
            shopFloor: findTime('SHOP_FLOOR_ENTRY'),
            roadTest: findTime('ROAD_TEST') || null,
            delivery:
              findTime('FINAL_EXIT') ||
              findTime('GATE_EXIT') ||
              (v.status === 'BILLED' ? 'Billed' : null),
            inTime: gateIn ? format(gateIn, 'HH:mm') : '-',
            jobCardId: v.id,
          }
        })
        setJobCards([])
        setVehicles(mappedVehicles)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading workshop seed for ticker:', error)
        setLoading(false)
      })
  }, [reportDate])

  useEffect(() => {
    if (USE_LOCAL_WORKSHOP_SEED) return

    const jobCardsRef = collection(
      db,
      'ServiceStation',
      SERVICE_STATION_ID,
      'subStation',
      SUB_STATION_ID,
      'jobCards'
    )
    const q = query(
      jobCardsRef,
      where('status', 'in', ['PENDING', 'OPEN', 'BILLED'])
    )
    const unsub = onSnapshot(q, (snap) => {
      const items: JobCardFromFirestore[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as JobCardFromFirestore[]

      const itemsWithLastEvent = items.filter((item) => item.lastEvent && item.lastEvent.trim() !== '')
      setJobCards(itemsWithLastEvent)

      Promise.all(itemsWithLastEvent.map(mapJobCardToVehicleStatus))
        .then((mappedVehicles) => {
          setVehicles(mappedVehicles)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error mapping vehicles:', error)
          setLoading(false)
        })
    })
    return () => unsub()
  }, [])
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const itemsPerPage = 5

  const formatEventTime = (value: string | Date | null): string => {
    if (!value) return '-'
    if (value === 'Pending' || value === 'Billed') return value
    if (typeof value === 'string' && value !== '-') return value
    if (value instanceof Date) {
      return format(value, 'HH:mm')
    }
    return '-'
  }

  const renderStageIcon = (value: string | Date | null) => {
    if (!value || value === '-' || value === 'Pending' || (typeof value === 'string' && value.toLowerCase() === 'pending')) {
      return (
        <span className="inline-flex items-center space-x-1 text-orange-600">
          <FiAlertCircle className="w-3 h-3" />
          <span className="text-xs">Pending</span>
        </span>
      )
    }
    const timeStr = formatEventTime(value)
    return (
      <span className="inline-flex items-center space-x-1 text-green-600">
        <FiCheckCircle className="w-3 h-3" />
        <span className="text-xs">{timeStr}</span>
      </span>
    )
  }

  const filteredVehicles = useMemo(() => {
    let filtered = vehicles

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (v) =>
          v.regNo.toLowerCase().includes(query) ||
          v.advisor.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.serviceType.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [vehicles, searchQuery])

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Vehicle Tracking Ticker</h2>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Reg No.</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Advisor</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Model</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Service Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">JC Opening</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Washing</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Shop Floor</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Road Test</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Delivery</th>
              {mode === 'status' && (
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={mode === 'status' ? 10 : 9} className="py-8 text-center text-gray-500">
                  Loading vehicles...
                </td>
              </tr>
            ) : paginatedVehicles.length === 0 ? (
              <tr>
                <td
                  colSpan={mode === 'status' ? 10 : 9}
                  className="py-8 text-center text-gray-500"
                >
                  No vehicles found
                </td>
              </tr>
            ) : (
              paginatedVehicles.map((vehicle, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4">{vehicle.advisor}</td>
                  <td className="py-3 px-4">{vehicle.model}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {vehicle.serviceType}
                    </span>
                  </td>
                  {mode === 'status' ? (
                    <>
                      <td className="py-3 px-4">
                        {renderStageIcon(vehicle.jcOpening)}
                      </td>
                      <td className="py-3 px-4">{renderStageIcon(vehicle.washing)}</td>
                      <td className="py-3 px-4">{renderStageIcon(vehicle.shopFloor)}</td>
                      <td className="py-3 px-4">{renderStageIcon(vehicle.roadTest)}</td>
                      <td className="py-3 px-4">
                        {renderStageIcon(vehicle.delivery)}
                      </td>
                      <td className="py-3 px-4">
                        {vehicle.status === 'completed' && (
                          <span className="inline-flex items-center space-x-1 text-green-600 font-medium">
                            <FiCheckCircle className="w-3 h-3" />
                            <span>Completed</span>
                          </span>
                        )}
                        {vehicle.status === 'in-progress' && (
                          <span className="inline-flex items-center space-x-1 text-blue-600 font-medium">
                            <FiClock className="w-3 h-3" />
                            <span>In Progress</span>
                          </span>
                        )}
                        {vehicle.status === 'pending' && (
                          <span className="inline-flex items-center space-x-1 text-orange-600 font-medium">
                            <FiAlertCircle className="w-3 h-3" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4">
                        {vehicle.jcOpening && vehicle.jcOpening instanceof Date ? (
                          <span className="flex items-center space-x-1">
                            <FiClock className="w-3 h-3 text-green-600" />
                            <span>{format(vehicle.jcOpening, 'HH:mm')}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {vehicle.washing && vehicle.washing instanceof Date ? format(vehicle.washing, 'HH:mm') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {vehicle.shopFloor && vehicle.shopFloor instanceof Date ? format(vehicle.shopFloor, 'HH:mm') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {vehicle.roadTest && vehicle.roadTest instanceof Date ? format(vehicle.roadTest, 'HH:mm') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {vehicle.delivery && vehicle.delivery instanceof Date ? (
                          <span className="flex items-center space-x-1 text-green-600">
                            <FiCheckCircle className="w-4 h-4" />
                            <span>{format(vehicle.delivery, 'HH:mm')}</span>
                          </span>
                        ) : vehicle.delivery === 'Pending' || !vehicle.delivery ? (
                          <span className="text-orange-600 font-medium">Pending</span>
                        ) : typeof vehicle.delivery === 'string' ? (
                          <span className="text-green-600">{vehicle.delivery}</span>
                        ) : (
                          <span className="text-green-600">
                            {format(vehicle.delivery, 'HH:mm')}
                          </span>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredVehicles.length)}</span> of{' '}
            <span className="font-medium">{filteredVehicles.length}</span> vehicles
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {/* Show first page */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    1
                  </button>
                  {currentPage > 4 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                </>
              )}
              
              {/* Show pages around current */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 7) return true; // Show all if 7 or fewer pages
                  return (
                    page === currentPage ||
                    page === currentPage - 1 ||
                    page === currentPage + 1 ||
                    (currentPage <= 3 && page <= 5) ||
                    (currentPage >= totalPages - 2 && page >= totalPages - 4)
                  );
                })
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              
              {/* Show last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

