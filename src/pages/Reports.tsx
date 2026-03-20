import { useState } from 'react'
import { FiCalendar, FiDownload } from 'react-icons/fi'
import { format } from 'date-fns'

interface WorkshopKPI {
  date: string
  totalLabours: number
  parts: number
  vas: number
  jcOpenedCount: number
  closedToday: number
  sameDayDelivered: number
  workshopEfficiency: number
  repairExceed: number
  bayAnalysis: number
}

interface StageWiseData {
  stage: string
  count: number
  avgTime: string
  minTime: string
  maxTime: string
  onTime: number
  delayed: number
}

interface EntryToJCOpening {
  regNo: string
  customerName: string
  entryTime: Date
  jcOpeningTime: Date
  timeDifference: string
  serviceAdvisor: string
  status: string
}

interface ServiceAdvisorReport {
  advisorName: string
  totalVehicles: number
  jcOpened: number
  completed: number
  inProgress: number
  avgCompletionTime: string
  efficiency: number
}

interface VehicleSummary {
  regNo: string
  customerName: string
  model: string
  entryTime: Date
  jcOpening: Date
  washingStart: Date
  shopFloorEntry: Date
  bayAllocation: Date
  roadTest: Date
  finalWashing: Date
  delivery: Date
  totalTime: string
  status: string
}

const mockKPIs: WorkshopKPI[] = [
  {
    date: '2024-01-15',
    totalLabours: 25,
    parts: 150,
    vas: 45,
    jcOpenedCount: 30,
    closedToday: 28,
    sameDayDelivered: 22,
    workshopEfficiency: 85,
    repairExceed: 3,
    bayAnalysis: 78,
  },
]

const mockStageWise: StageWiseData[] = [
  {
    stage: 'JC Opening',
    count: 30,
    avgTime: '15 min',
    minTime: '5 min',
    maxTime: '30 min',
    onTime: 28,
    delayed: 2,
  },
  {
    stage: 'Washing',
    count: 30,
    avgTime: '20 min',
    minTime: '10 min',
    maxTime: '45 min',
    onTime: 27,
    delayed: 3,
  },
  {
    stage: 'Shop Floor / Bay',
    count: 30,
    avgTime: '2.5 hrs',
    minTime: '1 hr',
    maxTime: '4 hrs',
    onTime: 25,
    delayed: 5,
  },
  {
    stage: 'Road Test',
    count: 28,
    avgTime: '25 min',
    minTime: '15 min',
    maxTime: '40 min',
    onTime: 26,
    delayed: 2,
  },
  {
    stage: 'Final Washing',
    count: 28,
    avgTime: '18 min',
    minTime: '10 min',
    maxTime: '30 min',
    onTime: 27,
    delayed: 1,
  },
]

const mockEntryToJC: EntryToJCOpening[] = [
  {
    regNo: 'DL-01-AB-1234',
    customerName: 'John Doe',
    entryTime: new Date('2024-01-15T08:00:00'),
    jcOpeningTime: new Date('2024-01-15T08:15:00'),
    timeDifference: '15 min',
    serviceAdvisor: 'Rajesh Kumar',
    status: 'On Time',
  },
  {
    regNo: 'DL-02-CD-5678',
    customerName: 'Jane Smith',
    entryTime: new Date('2024-01-15T09:00:00'),
    jcOpeningTime: new Date('2024-01-15T09:35:00'),
    timeDifference: '35 min',
    serviceAdvisor: 'Priya Sharma',
    status: 'Delayed',
  },
  {
    regNo: 'DL-03-EF-9012',
    customerName: 'Robert Johnson',
    entryTime: new Date('2024-01-15T10:00:00'),
    jcOpeningTime: new Date('2024-01-15T10:20:00'),
    timeDifference: '20 min',
    serviceAdvisor: 'Amit Patel',
    status: 'On Time',
  },
]

const mockServiceAdvisorReports: ServiceAdvisorReport[] = [
  {
    advisorName: 'Rajesh Kumar',
    totalVehicles: 12,
    jcOpened: 12,
    completed: 10,
    inProgress: 2,
    avgCompletionTime: '4.5 hrs',
    efficiency: 92,
  },
  {
    advisorName: 'Priya Sharma',
    totalVehicles: 10,
    jcOpened: 10,
    completed: 9,
    inProgress: 1,
    avgCompletionTime: '4.2 hrs',
    efficiency: 88,
  },
  {
    advisorName: 'Amit Patel',
    totalVehicles: 8,
    jcOpened: 8,
    completed: 7,
    inProgress: 1,
    avgCompletionTime: '4.8 hrs',
    efficiency: 85,
  },
]

const mockVehicleSummary: VehicleSummary[] = [
  {
    regNo: 'DL-01-AB-1234',
    customerName: 'John Doe',
    model: 'Swift',
    entryTime: new Date('2024-01-15T08:00:00'),
    jcOpening: new Date('2024-01-15T08:15:00'),
    washingStart: new Date('2024-01-15T08:30:00'),
    shopFloorEntry: new Date('2024-01-15T08:45:00'),
    bayAllocation: new Date('2024-01-15T09:00:00'),
    roadTest: new Date('2024-01-15T12:00:00'),
    finalWashing: new Date('2024-01-15T12:20:00'),
    delivery: new Date('2024-01-15T12:30:00'),
    totalTime: '4.5 hrs',
    status: 'Delivered',
  },
  {
    regNo: 'DL-02-CD-5678',
    customerName: 'Jane Smith',
    model: 'Baleno',
    entryTime: new Date('2024-01-15T09:00:00'),
    jcOpening: new Date('2024-01-15T09:35:00'),
    washingStart: new Date('2024-01-15T09:50:00'),
    shopFloorEntry: new Date('2024-01-15T10:05:00'),
    bayAllocation: new Date('2024-01-15T10:20:00'),
    roadTest: new Date('2024-01-15T13:30:00'),
    finalWashing: new Date('2024-01-15T13:50:00'),
    delivery: new Date('2024-01-15T14:00:00'),
    totalTime: '5.0 hrs',
    status: 'Delivered',
  },
]

export default function Reports() {
  const [dateFrom, setDateFrom] = useState('')
  const [timeFrom, setTimeFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [timeTo, setTimeTo] = useState('')
  const [activeTab, setActiveTab] = useState<'kpi' | 'stage-wise' | 'entry-to-jc' | 'service-advisors' | 'vehicle-summary' | 'comprehensive'>('kpi')

  const clearTimeFilter = () => {
    setDateFrom('')
    setTimeFrom('')
    setDateTo('')
    setTimeTo('')
  }

  const TimeFilter = ({ onClear }: { onClear: () => void }) => (
    <div className="flex items-center space-x-2 bg-gray-50 border border-gray-300 rounded-lg p-2">
      <FiCalendar className="w-4 h-4 text-gray-500" />
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <label className="text-xs text-gray-600">From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 focus:border-transparent"
          />
          <input
            type="time"
            value={timeFrom}
            onChange={(e) => setTimeFrom(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-1">
          <label className="text-xs text-gray-600">To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 focus:border-transparent"
          />
          <input
            type="time"
            value={timeTo}
            onChange={(e) => setTimeTo(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        {(dateFrom || timeFrom || dateTo || timeTo) && (
          <button
            onClick={onClear}
            className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )

  const tabs = [
    { id: 'kpi', label: 'Workshop KPI' },
    { id: 'stage-wise', label: 'Stage Wise Analysis' },
    { id: 'entry-to-jc', label: 'Entry to JC Opening' },
    { id: 'service-advisors', label: 'Service Advisors' },
    { id: 'vehicle-summary', label: 'Vehicle Summary' },
    { id: 'comprehensive', label: 'Comprehensive Report' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive reports and KPIs for workshop operations</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <FiDownload className="w-4 h-4" />
          <span>Export All Reports</span>
        </button>
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
        {/* Workshop KPI Tab */}
        {activeTab === 'kpi' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Workshop KPI</h2>
              <TimeFilter onClear={clearTimeFilter} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockKPIs[0] && (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Total Labours</p>
                    <p className="text-lg font-bold text-gray-900">{mockKPIs[0].totalLabours}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">VAS</p>
                    <p className="text-lg font-bold text-gray-900">{mockKPIs[0].vas}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">JC Opened Count</p>
                    <p className="text-lg font-bold text-gray-900">{mockKPIs[0].jcOpenedCount}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Closed Today</p>
                    <p className="text-lg font-bold text-gray-900">{mockKPIs[0].closedToday}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Same Day Delivered</p>
                    <p className="text-lg font-bold text-gray-900">{mockKPIs[0].sameDayDelivered}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Workshop Efficiency</p>
                    <p className="text-lg font-bold text-gray-900">{mockKPIs[0].workshopEfficiency}%</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Repair Exceed</p>
                    <p className="text-lg font-bold text-gray-900">{mockKPIs[0].repairExceed}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Bay Analysis</p>
                    <p className="text-lg font-bold text-gray-900">{mockKPIs[0].bayAnalysis}%</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Stage Wise Analysis Tab */}
        {activeTab === 'stage-wise' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Stage Wise Analysis</h2>
              <TimeFilter onClear={clearTimeFilter} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">On Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delayed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockStageWise.map((stage, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{stage.stage}</td>
                      <td className="px-4 py-3 text-gray-600">{stage.count}</td>
                      <td className="px-4 py-3 text-gray-600">{stage.avgTime}</td>
                      <td className="px-4 py-3 text-gray-600">{stage.minTime}</td>
                      <td className="px-4 py-3 text-gray-600">{stage.maxTime}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {stage.onTime}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {stage.delayed}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Entry to JC Opening Report Tab */}
        {activeTab === 'entry-to-jc' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Entry to JC Opening Report</h2>
              <TimeFilter onClear={clearTimeFilter} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">JC Opening Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Difference</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Advisor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockEntryToJC.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{entry.regNo}</td>
                      <td className="px-4 py-3 text-gray-600">{entry.customerName}</td>
                      <td className="px-4 py-3 text-gray-600">{format(entry.entryTime, 'dd-MM-yyyy HH:mm:ss')}</td>
                      <td className="px-4 py-3 text-gray-600">{format(entry.jcOpeningTime, 'dd-MM-yyyy HH:mm:ss')}</td>
                      <td className="px-4 py-3 text-gray-600">{entry.timeDifference}</td>
                      <td className="px-4 py-3 text-gray-600">{entry.serviceAdvisor}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          entry.status === 'On Time' 
                            ? 'bg-gray-100 text-gray-700' 
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Service Advisors Report Tab */}
        {activeTab === 'service-advisors' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Service Advisors Report</h2>
              <TimeFilter onClear={clearTimeFilter} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Advisor Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Vehicles</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">JC Opened</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">In Progress</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Completion Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockServiceAdvisorReports.map((report, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{report.advisorName}</td>
                      <td className="px-4 py-3 text-gray-600">{report.totalVehicles}</td>
                      <td className="px-4 py-3 text-gray-600">{report.jcOpened}</td>
                      <td className="px-4 py-3 text-gray-600">{report.completed}</td>
                      <td className="px-4 py-3 text-gray-600">{report.inProgress}</td>
                      <td className="px-4 py-3 text-gray-600">{report.avgCompletionTime}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{report.efficiency}%</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${report.efficiency}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vehicle Summary Report Tab */}
        {activeTab === 'vehicle-summary' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Vehicle Summary Report</h2>
              <TimeFilter onClear={clearTimeFilter} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1200px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Reg No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Customer Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Model</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Entry Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">JC Opening</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Washing Start</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Shop Floor Entry</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Bay Allocation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Road Test</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Final Washing</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Delivery</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Total Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockVehicleSummary.map((vehicle, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{vehicle.regNo}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{vehicle.customerName}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{vehicle.model}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.entryTime, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.jcOpening, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.washingStart, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.shopFloorEntry, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.bayAllocation, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.roadTest, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.finalWashing, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.delivery, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{vehicle.totalTime}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {vehicle.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Comprehensive Report Tab */}
        {activeTab === 'comprehensive' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Comprehensive Report (All Fields)</h2>
              <TimeFilter onClear={clearTimeFilter} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[2000px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Reg No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Customer Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Model</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Service Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Service Advisor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Entry Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">JC Opening</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Washing Start</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Washing End</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Shop Floor Entry</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Bay Allocation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Technician</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Service Start</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Service End</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Road Test</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Final Washing</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Billing</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Delivery</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Total Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Parts Used</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">VAS</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockVehicleSummary.map((vehicle, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{vehicle.regNo}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{vehicle.customerName}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{vehicle.model}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">Periodic Service</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">Rajesh Kumar</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.entryTime, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.jcOpening, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.washingStart, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.washingStart, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.shopFloorEntry, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.bayAllocation, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">Amit Patel</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.bayAllocation, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.roadTest, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.roadTest, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.finalWashing, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.finalWashing, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(vehicle.delivery, 'dd-MM-yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{vehicle.totalTime}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">5</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">2</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">₹15,000</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
