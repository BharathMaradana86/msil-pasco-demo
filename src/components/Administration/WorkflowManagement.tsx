'use client'

import { useState } from 'react'
import { FiSettings, FiEdit, FiPlus, FiCheckCircle } from 'react-icons/fi'

interface Workflow {
  id: string
  name: string
  description: string
  trigger: string
  actions: string[]
  status: 'active' | 'inactive'
}

const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'JC Creation Alert',
    description: 'Alert when vehicle enters but JC not created within 10 minutes',
    trigger: 'Vehicle Entry + No JC after 10 mins',
    actions: ['Send WhatsApp to GM', 'Send WhatsApp to WM', 'Show In-App Alert'],
    status: 'active',
  },
  {
    id: '2',
    name: 'EV Safety Warning',
    description: 'Warning when EV enters service bay',
    trigger: 'EV detected at Bay Entry',
    actions: ['Display Warning on Bay Screen', 'Sound Buzzer', 'Send Alert to Technician'],
    status: 'active',
  },
  {
    id: '3',
    name: 'Washing Allocation Alert',
    description: 'Alert when washing done but bay not allocated',
    trigger: 'Washing Exit + No Bay Allocation',
    actions: ['Notify Floor Supervisor', 'Show In-App Alert'],
    status: 'active',
  },
]

export default function WorkflowManagement() {
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Workflow Management</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <FiPlus className="w-4 h-4" />
          <span>Create Workflow</span>
        </button>
      </div>

      <div className="space-y-4">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                    <FiSettings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                  </div>
                </div>
                <div className="ml-12 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Trigger: </span>
                    <span className="text-sm text-gray-600">{workflow.trigger}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Actions: </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {workflow.actions.map((action, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  workflow.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {workflow.status}
                </span>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                  <FiEdit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

