import { useState } from 'react'
import AssessmentResults from '../components/VehicleAssessment/AssessmentResults'
import AssessmentHistory from '../components/VehicleAssessment/AssessmentHistory'

export default function VehicleAssessment() {
  const [activeTab, setActiveTab] = useState<'results' | 'history'>('results')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">360° Vehicle Assessment</h1>
        <p className="text-gray-600 mt-1">AI-based automatic assessment of outer and underbody vehicle damages</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('results')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'results'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assessment Results
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assessment History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'results' && <AssessmentResults />}
        {activeTab === 'history' && <AssessmentHistory />}
      </div>
    </div>
  )
}

