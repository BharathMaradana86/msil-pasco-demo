import { useState } from 'react'
import MessageTemplates from '../components/CustomerCommunication/MessageTemplates'
import MessageHistory from '../components/CustomerCommunication/MessageHistory'
import CustomerUpdates from '../components/CustomerCommunication/CustomerUpdates'
import { FiMessageSquare, FiSend, FiClock } from 'react-icons/fi'

export default function CustomerCommunication() {
  const [activeTab, setActiveTab] = useState<'templates' | 'history' | 'updates'>('updates')

  const tabs = [
    { id: 'updates', label: 'Customer Updates', icon: FiSend },
    { id: 'templates', label: 'Message Templates', icon: FiMessageSquare },
    { id: 'history', label: 'Message History', icon: FiClock },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer Communication</h1>
        <p className="text-gray-600 mt-1">Manage customer messages via SMS, WhatsApp, and app notifications</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'updates' && <CustomerUpdates />}
        {activeTab === 'templates' && <MessageTemplates />}
        {activeTab === 'history' && <MessageHistory />}
      </div>
    </div>
  )
}

