import { FiMenu, FiBell, FiSearch, FiUser } from 'react-icons/fi'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          
          {/* Search */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-2 flex-1 max-w-md">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles, job cards..."
              className="bg-transparent border-none outline-none flex-1 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">Workshop Manager</p>
              <p className="text-xs text-gray-500">Dealership Name</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <FiUser className="text-primary-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
