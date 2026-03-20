import { useState } from 'react'
import VehicleStages from '../components/VehicleTracking/VehicleStages'
import ANPRManagement from '../components/VehicleTracking/ANPRManagement'
import BayManagement from '../components/VehicleTracking/BayManagement'
import ExceptionHandling from '../components/VehicleTracking/ExceptionHandling'

export default function VehicleTracking() {
  const [activeTab, setActiveTab] = useState<'stages' | 'anpr' | 'bay' | 'exceptions'>('stages')

  const tabs = [
    { id: 'stages', label: 'Vehicle Stages' },
    { id: 'anpr', label: 'ANPR Management' },
    { id: 'bay', label: 'Bay Management' },
    { id: 'exceptions', label: 'Exception Handling' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vehicle Tracking System</h1>
        <p className="text-gray-600 mt-1">Track vehicles through workshop stages with camera-based ANPR</p>
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
        {activeTab === 'stages' && <VehicleStages />}
        {activeTab === 'anpr' && <ANPRManagement />}
        {activeTab === 'bay' && <BayManagement />}
        {activeTab === 'exceptions' && <ExceptionHandling />}
      </div>
    </div>
  )
}

