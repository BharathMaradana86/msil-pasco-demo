import VehicleTrackingLogs from '../components/RealTimeMonitoring/VehicleTrackingLogs'
import VehicleTicker from '../components/Dashboard/VehicleTicker'

export default function RealTimeMonitoring() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Real-Time Monitoring</h1>
        <p className="text-gray-600 mt-1">Live operational oversight and vehicle tracking</p>
      </div>

      {/* Vehicle Ticker - status view (Done / Pending / In Progress) */}
      <VehicleTicker mode="status" />

      {/* Vehicle Tracking Logs */}
      <VehicleTrackingLogs />
    </div>
  )
}

