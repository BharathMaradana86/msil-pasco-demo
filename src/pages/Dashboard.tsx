import { useEffect, useState } from 'react'
import {
  FiFileText,
  FiDroplet,
  FiTool,
  FiNavigation,
  FiCheckCircle,
  FiBook,
  FiCalendar,
} from 'react-icons/fi'
import { doc, onSnapshot } from 'firebase/firestore'
import KPICard from '../components/Dashboard/KPICard'
import VehicleTicker from '../components/Dashboard/VehicleTicker'
import { db, SERVICE_STATION_ID, SUB_STATION_ID } from '../lib/firebase'
import { loadWorkshopSeedData, USE_LOCAL_WORKSHOP_SEED } from '../lib/workshopSeed'
import { useWorkshopReport } from '../context/WorkshopReportContext'

interface AggregationData {
  byLastEvent?: Record<string, number>
  byStatus?: Record<string, number>
}

export default function Dashboard() {
  const {
    reportDate,
    setReportDate,
    availableDates,
    datesLoading,
    datesError,
    refreshDates,
  } = useWorkshopReport()

  const [stats, setStats] = useState({
    gateInButJcNotOpen: 0,
    washing: 0,
    shopFloor: 0,
    roadTest: 0,
    jcClosedButNotBilled: 0,
    billedButNotDelivered: 0,
    delivered: 0,
  })

  useEffect(() => {
    if (!USE_LOCAL_WORKSHOP_SEED) return
    if (!reportDate) return
    loadWorkshopSeedData(reportDate)
      .then((seed) => {
        const byEvent: Record<string, number> = {}
        const byStatus: Record<string, number> = {}
        seed.vehicles.forEach((v) => {
          byStatus[v.status] = (byStatus[v.status] || 0) + 1
          byEvent[v.lastEvent] = (byEvent[v.lastEvent] || 0) + 1
        })
        setStats({
          gateInButJcNotOpen: (byEvent.GATE_IN || 0) + (byEvent.EVENT_IN || 0),
          washing: byEvent.WASHING || byEvent.WASH_IN || 0,
          shopFloor:
            (byEvent.SHOP_FLOOR || 0) +
            (byEvent.BAY_IN || 0) +
            (byEvent.BAY_OUT || 0) +
            (byEvent.SHOP_FLOOR_ENTRY || 0),
          roadTest: byEvent.ROAD_TEST || 0,
          jcClosedButNotBilled: byStatus.OPEN || 0,
          billedButNotDelivered: byStatus.BILLED || 0,
          delivered:
            (byEvent.FINAL_EXIT || 0) , // Handle cases where vehicle was marked delivered but then returned
        })
      })
      .catch((error) => {
        console.error('Failed to load local workshop seed for dashboard:', error)
      })
  }, [reportDate])

  useEffect(() => {
    if (USE_LOCAL_WORKSHOP_SEED) return

    const dateStr = new Date().toISOString().split('T')[0]
    const aggRef = doc(
      db,
      'ServiceStation',
      SERVICE_STATION_ID,
      'subStation',
      SUB_STATION_ID,
      'aggregations',
      dateStr
    )
    const unsub = onSnapshot(aggRef, (snap) => {
      const data = snap.data() as AggregationData | undefined
      const byEvent = data?.byLastEvent || {}
      const byStatus = data?.byStatus || {}
console.log('Aggregation update:', { byEvent, byStatus,data })
      setStats({
        gateInButJcNotOpen: (byEvent.GATE_IN || 0) + (byEvent.EVENT_IN || 0),
        washing: byEvent.WASHING || 0,
        shopFloor: (byEvent.SHOP_FLOOR || 0) + (byEvent.BAY_IN || 0) + (byEvent.BAY_OUT || 0),
        roadTest: byEvent.ROAD_TEST || 0,
        jcClosedButNotBilled: byStatus.OPEN || 0,
        billedButNotDelivered: byStatus.BILLED || 0,
        delivered: (byEvent.DELIVERED || 0),
      })

    })
    return () => unsub()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Central Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time workshop operations overview</p>
        </div>
        {USE_LOCAL_WORKSHOP_SEED && (
          <div className="flex flex-col gap-1 sm:items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FiCalendar className="w-4 h-4 text-primary-600" />
              Report date
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={reportDate ?? ''}
                onChange={(e) => setReportDate(e.target.value || null)}
                disabled={datesLoading || availableDates.length === 0}
                className="min-w-[11rem] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                {availableDates.length === 0 && !datesLoading ? (
                  <option value="">No reports</option>
                ) : (
                  availableDates.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))
                )}
              </select>
              <button
                type="button"
                onClick={() => void refreshDates()}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Refresh list
              </button>
            </div>
            {datesError && (
              <p className="text-xs text-red-600 max-w-xs text-right">{datesError}</p>
            )}
            {datesLoading && (
              <p className="text-xs text-gray-500">Loading available dates…</p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <KPICard
          title="Gate In but JC not opened"
          value={stats.gateInButJcNotOpen}
          icon={FiFileText}
          trend=""
          color="orange"
        />
        <KPICard
          title="Washing"
          value={stats.washing}
          icon={FiDroplet}
          trend=""
          color="blue"
        />
        <KPICard
          title="Shop Floor"
          value={stats.shopFloor}
          icon={FiTool}
          trend=""
          color="purple"
        />
        <KPICard
          title="Road Test"
          value={stats.roadTest}
          icon={FiNavigation}
          trend=""
          color="indigo"
        />
        <KPICard
          title="JC closed but not billed"
          value={stats.jcClosedButNotBilled}
          icon={FiFileText}
          trend=""
          color="yellow"
        />
        <KPICard
          title="Billed but not delivered"
          value={stats.billedButNotDelivered}
          icon={FiBook}
          trend=""
          color="orange"
        />
        <KPICard
          title="Delivered"
          value={stats.delivered}
          icon={FiCheckCircle}
          trend=""
          color="green"
        />
      </div>

      <VehicleTicker mode="time" />
    </div>
  )
}
