import { Link, useLocation } from 'react-router-dom'
import {
  FiHome,
  FiTruck,
  FiMonitor,
  FiSettings,
  FiBarChart2,
  FiMessageSquare,
  FiCamera,
  FiX,
  FiGrid,
  FiUser,
} from 'react-icons/fi'
import clsx from 'clsx'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: FiHome },
  { href: '/reception', label: 'Reception Dashboard', icon: FiUser },
  { href: '/real-time-monitoring', label: 'Real-Time Monitoring', icon: FiMonitor },
  { href: '/bay-status', label: 'Bay Status', icon: FiGrid },
  { href: '/reports', label: 'Reports', icon: FiBarChart2 },
  // { href: '/customer-communication', label: 'Customer Communication', icon: FiMessageSquare },
  { href: '/vehicle-assessment', label: '360° Vehicle Assessment', icon: FiCamera },
  { href: '/administration', label: 'Administration', icon: FiSettings },
]

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {!isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FiTruck className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">MSIL PASCO</span>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href || location.pathname?.startsWith(item.href + '/')
                
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={clsx(
                        'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p className="font-medium">Automated Workshop System</p>
              <p>Version 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
