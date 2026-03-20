'use client'

import { useState } from 'react'
import { FiEdit, FiTrash2, FiPlus, FiMessageSquare } from 'react-icons/fi'

interface Template {
  id: string
  name: string
  trigger: string
  channel: 'SMS' | 'WhatsApp' | 'App' | 'All'
  message: string
  status: 'active' | 'inactive'
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Vehicle Entry Notification',
    trigger: 'Main Entry',
    channel: 'WhatsApp',
    message: 'Your vehicle {REG_NO} has entered the workshop. Expected completion: {ESTIMATED_TIME}',
    status: 'active',
  },
  {
    id: '2',
    name: 'Washing Started',
    trigger: 'Washing Entry',
    channel: 'SMS',
    message: 'Your vehicle {REG_NO} is now in the washing bay.',
    status: 'active',
  },
  {
    id: '3',
    name: 'Service Complete',
    trigger: 'JC Billed',
    channel: 'All',
    message: 'Your vehicle {REG_NO} service is complete and ready for delivery.',
    status: 'active',
  },
]

export default function MessageTemplates() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Message Templates</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <FiPlus className="w-4 h-4" />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {templates.map((template) => (
          <div key={template.id} className="p-6 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <FiMessageSquare className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    template.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {template.status}
                  </span>
                </div>
                <div className="ml-8 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Trigger: </span>
                    <span className="text-sm text-gray-600">{template.trigger}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Channel: </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {template.channel}
                    </span>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm text-gray-700">{template.message}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 text-primary-600 hover:bg-primary-50 rounded">
                  <FiEdit className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

