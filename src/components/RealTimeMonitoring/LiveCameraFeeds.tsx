'use client'

import { useState } from 'react'
import { FiCamera, FiPlay, FiMaximize2 } from 'react-icons/fi'

interface CameraFeed {
  id: string
  name: string
  location: string
  status: 'active' | 'inactive'
  streamUrl?: string
}

const mockCameras: CameraFeed[] = [
  { id: '1', name: 'Camera 1', location: 'Main Entry', status: 'active' },
  { id: '2', name: 'Camera 2', location: 'Washing Entry', status: 'active' },
  { id: '3', name: 'Camera 3', location: 'Washing Exit', status: 'active' },
  { id: '4', name: 'Camera 4', location: 'Floor Entry', status: 'inactive' },
]

export default function LiveCameraFeeds() {
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Live Camera Feeds</h2>
      </div>
      
      <div className="p-6 space-y-4">
        {mockCameras.map((camera) => (
          <div
            key={camera.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedCamera?.id === camera.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedCamera(camera)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  camera.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <FiCamera className={`w-5 h-5 ${
                    camera.status === 'active' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{camera.name}</p>
                  <p className="text-sm text-gray-500">{camera.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${
                  camera.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <button className="p-2 hover:bg-white rounded">
                  <FiMaximize2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCamera && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <FiPlay className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">{selectedCamera.name}</p>
              <p className="text-xs opacity-50 mt-1">{selectedCamera.location}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

