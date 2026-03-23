import { useEffect, useMemo, useState } from 'react'
import {
  FiFileText,
  FiDroplet,
  FiTool,
  FiNavigation,
  FiCheckCircle,
  FiBook,
  FiCalendar,
  FiX,
  FiSearch,
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import KPICard from '../components/Dashboard/KPICard'
import VehicleTicker from '../components/Dashboard/VehicleTicker'
import type { VehicleStatus } from '../components/Dashboard/VehicleTicker'
import { db, SERVICE_STATION_ID, SUB_STATION_ID } from '../lib/firebase'
import { loadWorkshopSeedData, USE_LOCAL_WORKSHOP_SEED } from '../lib/workshopSeed'
import { useWorkshopReport } from '../context/WorkshopReportContext'
import {
  type DashboardMetricKey,
  vehicleMatchesDashboardMetric,
} from '../lib/dashboardMetricFilters'

interface AggregationData {
  byLastEvent?: Record<string, number>
  byStatus?: Record<string, number>
}

const METRIC_TITLES: Record<DashboardMetricKey, string> = {
  gateInButJcNotOpen: 'Gate In but JC not opened',
  washing: 'Washing',
  shopFloor: 'Shop Floor',
  roadTest: 'Road Test',
  jcClosedButNotBilled: 'JC closed but not billed',
  billedButNotDelivered: 'Billed but not delivered',
  delivered: 'Delivered',
}

export default function Dashboard() {
  const navigate = useNavigate()
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

  const [metricModal, setMetricModal] = useState<DashboardMetricKey | null>(null)
  const [modalSearch, setModalSearch] = useState('')
  const [dashboardVehicles, setDashboardVehicles] = useState<VehicleStatus[]>([])

  const openMetricModal = (key: DashboardMetricKey) => {
    setModalSearch('')
    setMetricModal(key)
  }

  const modalVehicles = useMemo(() => {
    if (!metricModal) return []
    return dashboardVehicles.filter((v) => vehicleMatchesDashboardMetric(v, metricModal))
  }, [dashboardVehicles, metricModal])

  const modalFiltered = useMemo(() => {
    const q = modalSearch.trim().toLowerCase()
    if (!q) return modalVehicles
    return modalVehicles.filter(
      (v) =>
        v.serialNo.toLowerCase().includes(q) ||
        v.regNo.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.advisor.toLowerCase().includes(q) ||
        (v.lastEvent || '').toLowerCase().includes(q)
    )
  }, [modalVehicles, modalSearch])

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
            (byEvent.FINAL_EXIT || 0) +
            (byEvent.DELIVERED || 0) +
            (byEvent.GATE_OUT || 0),
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
      setStats({
        gateInButJcNotOpen: (byEvent.GATE_IN || 0) + (byEvent.EVENT_IN || 0),
        washing: byEvent.WASHING || 0,
        shopFloor: (byEvent.SHOP_FLOOR || 0) + (byEvent.BAY_IN || 0) + (byEvent.BAY_OUT || 0),
        roadTest: byEvent.ROAD_TEST || 0,
        jcClosedButNotBilled: byStatus.OPEN || 0,
        billedButNotDelivered: byStatus.BILLED || 0,
        delivered:
          (byEvent.DELIVERED || 0) +
          (byEvent.FINAL_EXIT || 0) +
          (byEvent.GATE_OUT || 0),
      })
    })
    return () => unsub()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Snapshot</h1>
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
          onClick={() => openMetricModal('gateInButJcNotOpen')}
        />
        <KPICard
          title="Washing"
          value={stats.washing}
          icon={FiDroplet}
          trend=""
          color="blue"
          onClick={() => openMetricModal('washing')}
        />
        <KPICard
          title="Shop Floor"
          value={stats.shopFloor}
          icon={FiTool}
          trend=""
          color="purple"
          onClick={() => openMetricModal('shopFloor')}
        />
        <KPICard
          title="Road Test"
          value={stats.roadTest}
          icon={FiNavigation}
          trend=""
          color="indigo"
          onClick={() => openMetricModal('roadTest')}
        />
        <KPICard
          title="JC closed but not billed"
          value={stats.jcClosedButNotBilled}
          icon={FiFileText}
          trend=""
          color="yellow"
          onClick={() => openMetricModal('jcClosedButNotBilled')}
        />
        <KPICard
          title="Billed but not delivered"
          value={stats.billedButNotDelivered}
          icon={FiBook}
          trend=""
          color="orange"
          onClick={() => openMetricModal('billedButNotDelivered')}
        />
        <KPICard
          title="Delivered"
          value={stats.delivered}
          icon={FiCheckCircle}
          trend=""
          color="green"
          onClick={() => openMetricModal('delivered')}
        />
      </div>

      <VehicleTicker mode="status" onVehiclesChange={setDashboardVehicles} />

      {metricModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="metric-modal-title"
          onClick={() => setMetricModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-4xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-4 border-b border-gray-200">
              <div>
                <h2 id="metric-modal-title" className="text-lg font-semibold text-gray-900">
                  {METRIC_TITLES[metricModal]}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {modalFiltered.length} vehicle{modalFiltered.length === 1 ? '' : 's'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMetricModal(null)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <div className="relative max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="search"
                  placeholder="Search serial, registration, model, advisor, last event…"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="overflow-auto flex-1 p-4 pt-2">
              {modalFiltered.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No vehicles in this bucket.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-600">
                      <th className="py-2 pr-3 font-medium w-24">Serial</th>
                      <th className="py-2 pr-3 font-medium">Reg No.</th>
                      <th className="py-2 pr-3 font-medium">Model</th>
                      <th className="py-2 pr-3 font-medium">Advisor</th>
                      <th className="py-2 pr-3 font-medium">Last event</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalFiltered.map((v) => (
                      <tr key={v.jobCardId || v.regNo} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 pr-3 text-xs text-gray-600 truncate max-w-[6rem]" title={v.serialNo}>
                          {v.serialNo}
                        </td>
                        <td className="py-2 pr-3">
                          <button
                            type="button"
                            onClick={() => {
                              setMetricModal(null)
                              navigate(`/vehicle/${v.regNo}`)
                            }}
                            className="font-medium text-primary-600 hover:underline"
                          >
                            {v.regNo}
                          </button>
                        </td>
                        <td className="py-2 pr-3">{v.model}</td>
                        <td className="py-2 pr-3">{v.advisor}</td>
                        <td className="py-2 pr-3 text-gray-700">{v.lastEvent || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
