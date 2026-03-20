'use client'

import { useState } from 'react'
import { FiCamera, FiAlertCircle, FiCheckCircle, FiDownload } from 'react-icons/fi'

interface Damage {
  id: string
  area: string
  type: string
  severity: 'minor' | 'moderate' | 'severe'
  image?: string
  confidence: number
}

interface Assessment {
  id: string
  vehicleReg: string
  timestamp: Date
  status: 'completed' | 'processing' | 'failed'
  damages: Damage[]
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor'
}

const mockAssessments: Assessment[] = [
  {
    id: '1',
    vehicleReg: 'DL-01-AB-1234',
    timestamp: new Date(),
    status: 'completed',
    overallCondition: 'good',
    damages: [
      {
        id: '1',
        area: 'Front Bumper',
        type: 'Scratch',
        severity: 'minor',
        confidence: 95.5,
      },
      {
        id: '2',
        area: 'Rear Door',
        type: 'Dent',
        severity: 'moderate',
        confidence: 88.2,
      },
    ],
  },
  {
    id: '2',
    vehicleReg: 'DL-02-CD-5678',
    timestamp: new Date(Date.now() - 10 * 60000),
    status: 'processing',
    overallCondition: 'excellent',
    damages: [],
  },
]

export default function AssessmentResults() {
  const [assessments, setAssessments] = useState<Assessment[]>(mockAssessments)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return 'bg-green-100 text-green-700'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700'
      case 'severe':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'text-green-600'
      case 'good':
        return 'text-blue-600'
      case 'fair':
        return 'text-yellow-600'
      case 'poor':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-primary-600">{assessments.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Assessments</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {assessments.filter(a => a.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">
            {assessments.filter(a => a.status === 'processing').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Processing</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {assessments.reduce((sum, a) => sum + a.damages.length, 0)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Damages Detected</div>
        </div>
      </div>

      {/* Assessments */}
      <div className="space-y-4">
        {assessments.map((assessment) => (
          <div
            key={assessment.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <FiCamera className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-gray-900">{assessment.vehicleReg}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    assessment.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : assessment.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {assessment.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {assessment.timestamp.toLocaleString()}
                </p>
              </div>
              {assessment.status === 'completed' && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Overall Condition</p>
                  <p className={`text-lg font-bold ${getConditionColor(assessment.overallCondition)}`}>
                    {assessment.overallCondition.toUpperCase()}
                  </p>
                </div>
              )}
            </div>

            {assessment.status === 'completed' && assessment.damages.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="font-medium text-gray-900">Detected Damages:</h4>
                {assessment.damages.map((damage) => (
                  <div
                    key={damage.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{damage.area}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Type: {damage.type} • Confidence: {damage.confidence}%
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-medium ${getSeverityColor(damage.severity)}`}>
                        {damage.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {assessment.status === 'processing' && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  <span className="text-sm text-yellow-800">Processing assessment...</span>
                </div>
              </div>
            )}

            {assessment.status === 'completed' && (
              <div className="mt-4 flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                  <FiDownload className="w-4 h-4" />
                  <span>Download Report</span>
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  View Images
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

