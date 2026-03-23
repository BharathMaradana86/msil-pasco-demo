import { useState, useMemo, useEffect } from 'react'
import { FiTruck, FiClock, FiCheckCircle, FiSearch, FiChevronLeft, FiChevronRight, FiAlertCircle, FiFilter } from 'react-icons/fi'
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

export interface VehicleStatus {
  serialNo: string
  regNo: string
  advisor: string
  model: string
  serviceType: string
  status: 'pending' | 'in-progress' | 'completed'
  gateIn: string | Date | null
  jcOpening: string | Date | null
  washingIn: string | Date | null
  shopFloorIn: string | Date | null
  bayIn: string | Date | null
  roadTestOut: string | Date | null
  billing: string | Date | null
  gateOut: string | Date | null
  inTime: string
  jobCardId?: string
  lastEvent?: string
  jobCardStatus?: string
}

interface JobCardFromFirestore {
  id: string
  vehicleRegistrationNumber?: string
  lastEvent?: string
  status?: string
  jcDetails?: {
    SRV_SDV_NAME?: string
    SRV_MODEL?: string
    SRV_TYPE?: string
    JC_OPEN_DATE?: string
    SRV_JC_NO?: string
    JOB_CARD_NO?: string
  }
  vehicleDetails?: { model?: string }
  createdAt?: { toDate?: () => Date }
}

interface VehicleTickerProps {
  mode?: 'time' | 'status'
  onVehiclesChange?: (vehicles: VehicleStatus[]) => void
}

type FilterKey = 'serialNo' | 'regNo' | 'advisor' | 'model' | 'serviceType' | 'status'

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

async function fetchLatestFirst(jobCardId: string, types: string[]): Promise<Date | null> {
  for (const t of types) {
    const d = await fetchLatestEvent(jobCardId, t).catch(() => null)
    if (d) return d
  }
  return null
}

async function mapJobCardToVehicleStatus(jc: JobCardFromFirestore): Promise<VehicleStatus> {
  const statusMap = { PENDING: 'pending' as const, OPEN: 'in-progress' as const, BILLED: 'completed' as const }
  const ts = jc.createdAt?.toDate?.() || jc.jcDetails?.JC_OPEN_DATE
  const inTime = ts ? (ts instanceof Date ? ts.toTimeString().slice(0, 5) : ts.slice(-5)) : '-'

  const jobCardId = jc.id
  const serialNo = jc.jcDetails?.SRV_JC_NO ?? jc.jcDetails?.JOB_CARD_NO ?? jc.id.slice(0, 8)

  const [gateIn, jcOpening, washingIn, shopFloorIn, bayIn, roadTestOut, billingTs, gateOutTs] =
    await Promise.all([
      fetchLatestFirst(jobCardId, ['GATE_IN', 'EVENT_IN']),
      fetchLatestEvent(jobCardId, 'JC_OPENED').catch(() => null),
      fetchLatestFirst(jobCardId, ['WASH_IN', 'WASHING']),
      fetchLatestFirst(jobCardId, ['SHOP_FLOOR_ENTRY', 'SHOP_FLOOR']),
      fetchLatestEvent(jobCardId, 'BAY_IN').catch(() => null),
      fetchLatestFirst(jobCardId, ['ROAD_TEST_QUEUE_OUT', 'ROAD_TEST']),
      fetchLatestFirst(jobCardId, ['BILLING', 'INVOICE_GENERATED', 'INVOICE', 'JC_BILLED']),
      fetchLatestFirst(jobCardId, ['GATE_OUT', 'FINAL_EXIT', 'DELIVERED']),
    ])

  const billing =
    billingTs || (jc.status === 'BILLED' ? ('Billed' as const) : null)

  return {
    serialNo,
    regNo: jc.vehicleRegistrationNumber || jc.id || '-',
    advisor: jc.jcDetails?.SRV_SDV_NAME || '-',
    model: jc.jcDetails?.SRV_MODEL || jc.vehicleDetails?.model || '-',
    serviceType: jc.jcDetails?.SRV_TYPE || '-',
    status: statusMap[jc.status as keyof typeof statusMap] || 'pending',
    gateIn,
    jcOpening,
    washingIn,
    shopFloorIn,
    bayIn,
    roadTestOut,
    billing,
    gateOut: gateOutTs,
    inTime,
    jobCardId,
    lastEvent: jc.lastEvent,
    jobCardStatus: jc.status,
  }
}

export default function VehicleTicker({ mode = 'status', onVehiclesChange }: VehicleTickerProps) {
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
          const findFirst = (types: string[]) => {
            for (const t of types) {
              const d = findTime(t)
              if (d) return d
            }
            return null
          }
          const gateIn = findTime('GATE_IN') || findTime('EVENT_IN')
          const billingDate = findFirst(['BILLING', 'INVOICE_GENERATED', 'INVOICE', 'JC_BILLED'])
          const billing = billingDate || (v.status === 'BILLED' ? ('Billed' as const) : null)
          return {
            serialNo: v.jobCardNumber || v.id.slice(0, 8),
            regNo: v.vehicleRegistrationNumber,
            advisor: v.jcDetails?.SRV_SDV_NAME || '-',
            model: v.jcDetails?.SRV_MODEL || '-',
            serviceType: v.jcDetails?.SRV_TYPE || 'General Service',
            status: v.status === 'BILLED' ? 'completed' : v.status === 'OPEN' ? 'in-progress' : 'pending',
            gateIn,
            jcOpening: findTime('JC_OPENED') || gateIn,
            washingIn: findTime('WASH_IN'),
            shopFloorIn: findTime('SHOP_FLOOR_ENTRY'),
            bayIn: findTime('BAY_IN'),
            roadTestOut: findFirst(['ROAD_TEST_QUEUE_OUT', 'ROAD_TEST']),
            billing,
            gateOut: findFirst(['GATE_OUT', 'FINAL_EXIT', 'GATE_EXIT', 'DELIVERED']),
            inTime: gateIn ? format(gateIn, 'HH:mm') : '-',
            jobCardId: v.id,
            lastEvent: v.lastEvent,
            jobCardStatus: v.status,
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
  const [openFilterKey, setOpenFilterKey] = useState<FilterKey | null>(null)
  const [columnFilters, setColumnFilters] = useState<Record<FilterKey, string>>({
    serialNo: 'all',
    regNo: 'all',
    advisor: 'all',
    model: 'all',
    serviceType: 'all',
    status: 'all',
  })
  const navigate = useNavigate()

  const itemsPerPage = 5

  const isStageComplete = (value: string | Date | null): boolean => {
    if (value == null || value === '-' || value === 'Pending') return false
    if (typeof value === 'string' && value.toLowerCase() === 'pending') return false
    return true
  }

  /** Compact cell: ✓ or Pending; full date/time and label on hover */
  const renderStageHoverCell = (stageLabel: string, value: string | Date | null) => {
    const done = isStageComplete(value)
    const titleFallback = done
      ? value instanceof Date
        ? `${stageLabel}: ${format(value, 'dd MMM yyyy, HH:mm:ss')}`
        : `${stageLabel}: ${String(value)}`
      : `${stageLabel}: Pending (no event recorded)`

    return (
      <span
        className="group relative inline-flex min-h-[1.25rem] cursor-help items-center justify-start"
        title={titleFallback}
      >
        {done ? (
          <FiCheckCircle className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
        ) : (
          <span className="text-xs font-medium text-orange-600">Pending</span>
        )}
        <span
          role="tooltip"
          className="pointer-events-none absolute left-0 top-full z-[100] mt-1 hidden w-max max-w-[min(260px,85vw)] rounded-md border border-gray-700 bg-gray-900 px-2.5 py-2 text-left text-xs text-white shadow-lg group-hover:block"
        >
          {done ? (
            <span className="block space-y-1">
              <span className="block font-semibold text-white">{stageLabel}</span>
              {value instanceof Date ? (
                <>
                  <span className="block text-gray-200">{format(value, 'EEEE, dd MMM yyyy')}</span>
                  <span className="block font-mono tabular-nums text-white">{format(value, 'HH:mm:ss')}</span>
                </>
              ) : (
                <span className="block text-gray-200">{String(value)}</span>
              )}
            </span>
          ) : (
            <span className="block space-y-1">
              <span className="block font-semibold text-white">{stageLabel}</span>
              <span className="block text-orange-200">Pending — no event recorded yet</span>
            </span>
          )}
        </span>
      </span>
    )
  }

  const filterOptions = useMemo<Record<FilterKey, string[]>>(
    () => ({
      serialNo: Array.from(new Set(vehicles.map((v) => v.serialNo).filter(Boolean))).sort(),
      regNo: Array.from(new Set(vehicles.map((v) => v.regNo).filter(Boolean))).sort(),
      advisor: Array.from(new Set(vehicles.map((v) => v.advisor).filter(Boolean))).sort(),
      model: Array.from(new Set(vehicles.map((v) => v.model).filter(Boolean))).sort(),
      serviceType: Array.from(new Set(vehicles.map((v) => v.serviceType).filter(Boolean))).sort(),
      status: ['pending', 'in-progress', 'completed'],
    }),
    [vehicles]
  )

  const filteredVehicles = useMemo(() => {
    let filtered = vehicles

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (v) =>
          v.serialNo.toLowerCase().includes(query) ||
          v.regNo.toLowerCase().includes(query) ||
          v.advisor.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.serviceType.toLowerCase().includes(query)
      )
    }

    ;(Object.keys(columnFilters) as FilterKey[]).forEach((key) => {
      const selected = columnFilters[key]
      if (selected !== 'all') {
        filtered = filtered.filter((v) => String(v[key]) === selected)
      }
    })

    return filtered
  }, [vehicles, searchQuery, columnFilters])

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const applyColumnFilter = (key: FilterKey, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
    setOpenFilterKey(null)
  }

  const renderHeaderWithFilter = (label: string, key?: FilterKey, thClassName?: string) => (
    <th className={thClassName ?? 'text-left py-3 px-4 font-semibold text-gray-700'}>
      <div className="relative inline-flex items-center gap-1">
        <span>{label}</span>
        {key && (
          <>
            <button
              type="button"
              onClick={() => setOpenFilterKey((curr) => (curr === key ? null : key))}
              className={`inline-flex h-4 w-4 items-center justify-center rounded hover:bg-gray-200 ${
                columnFilters[key] !== 'all' ? 'text-primary-600' : 'text-gray-400'
              }`}
              title={`Filter ${label}`}
            >
              <FiFilter className="h-3 w-3" />
            </button>
            {openFilterKey === key && (
              <div className="absolute top-full left-0 mt-1 z-[120] min-w-[140px] rounded-md border border-gray-200 bg-white shadow-lg p-1">
                <button
                  type="button"
                  onClick={() => applyColumnFilter(key, 'all')}
                  className="w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-50"
                >
                  All
                </button>
                {filterOptions[key].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => applyColumnFilter(key, value)}
                    className="w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-50"
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </th>
  )

  useEffect(() => {
    onVehiclesChange?.(vehicles)
  }, [vehicles, onVehiclesChange])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Vehicle Tracking Ticker</h2>
        <div className="relative shrink-0">
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

      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {renderHeaderWithFilter(
                'Serial',
                'serialNo',
                'text-left py-3 px-1 font-semibold text-gray-700 w-14 max-w-[4rem] min-w-[3rem]'
              )}
              {renderHeaderWithFilter('Reg No.', 'regNo')}
              {renderHeaderWithFilter('Advisor', 'advisor')}
              {renderHeaderWithFilter('Model', 'model')}
              {renderHeaderWithFilter('Service Type', 'serviceType')}
              {renderHeaderWithFilter('Gate In')}
              {renderHeaderWithFilter('JC Opening')}
              {renderHeaderWithFilter('Washing In')}
              {renderHeaderWithFilter('Shop Floor In')}
              {renderHeaderWithFilter('Bay In')}
              {renderHeaderWithFilter('Road Test Out')}
              {renderHeaderWithFilter('Billing')}
              {renderHeaderWithFilter('Gate Out')}
              {mode === 'status' && (
                renderHeaderWithFilter('Status', 'status')
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={mode === 'status' ? 14 : 13} className="py-8 text-center text-gray-500">
                  Loading vehicles...
                </td>
              </tr>
            ) : paginatedVehicles.length === 0 ? (
              <tr>
                <td
                  colSpan={mode === 'status' ? 14 : 13}
                  className="py-8 text-center text-gray-500"
                >
                  No vehicles found
                </td>
              </tr>
            ) : (
              paginatedVehicles.map((vehicle, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-1 w-14 max-w-[4rem] text-xs text-gray-600 truncate" title={vehicle.serialNo}>
                    {vehicle.serialNo}
                  </td>
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
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('Gate In', vehicle.gateIn)}
                      </td>
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('JC Opening', vehicle.jcOpening)}
                      </td>
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('Washing In', vehicle.washingIn)}
                      </td>
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('Shop Floor In', vehicle.shopFloorIn)}
                      </td>
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('Bay In', vehicle.bayIn)}
                      </td>
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('Road Test Out', vehicle.roadTestOut)}
                      </td>
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('Billing', vehicle.billing)}
                      </td>
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('Gate Out', vehicle.gateOut)}
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
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('Gate In', vehicle.gateIn)}
                      </td>
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('JC Opening', vehicle.jcOpening)}
                      </td>
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('Washing In', vehicle.washingIn)}
                      </td>
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('Shop Floor In', vehicle.shopFloorIn)}
                      </td>
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('Bay In', vehicle.bayIn)}
                      </td>
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('Road Test Out', vehicle.roadTestOut)}
                      </td>
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('Billing', vehicle.billing)}
                      </td>
                      <td className="relative overflow-visible py-3 px-4 align-middle">
                        {renderStageHoverCell('Gate Out', vehicle.gateOut)}
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

