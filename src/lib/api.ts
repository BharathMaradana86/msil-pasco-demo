// API integration structure for MSIL Automated Workshop System

const API_BASE_URL = 'http://183.83.44.154:5000'
const FIREBASE_FUNCTIONS_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'http://localhost:5001'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Vehicle Tracking API
export const vehicleTrackingApi = {
  getVehicleStages: async (): Promise<ApiResponse<any[]>> => {
    // Mock implementation - replace with actual API call
    return { success: true, data: [] }
  },
  
  getANPRRecords: async (): Promise<ApiResponse<any[]>> => {
    return { success: true, data: [] }
  },
  
  updateRegistrationNumber: async (id: string, regNo: string): Promise<ApiResponse<any>> => {
    return { success: true, data: { id, regNo } }
  },
}

// Dashboard API
export const dashboardApi = {
  getKPIs: async (): Promise<ApiResponse<any>> => {
    return { success: true, data: {} }
  },
  
  getVehicleStatus: async (): Promise<ApiResponse<any[]>> => {
    return { success: true, data: [] }
  },
  
  getAlerts: async (): Promise<ApiResponse<any[]>> => {
    return { success: true, data: [] }
  },
}

// Customer Communication API
export const customerCommunicationApi = {
  sendMessage: async (vehicleReg: string, channel: string, message: string): Promise<ApiResponse<any>> => {
    return { success: true, data: {} }
  },
  
  getMessageHistory: async (): Promise<ApiResponse<any[]>> => {
    return { success: true, data: [] }
  },
  
  getTemplates: async (): Promise<ApiResponse<any[]>> => {
    return { success: true, data: [] }
  },
}

// Reports API
export const reportsApi = {
  getMainEntryReports: async (dateRange: { start: Date; end: Date }): Promise<ApiResponse<any>> => {
    return { success: true, data: {} }
  },
  
  getJobCardReports: async (): Promise<ApiResponse<any>> => {
    return { success: true, data: {} }
  },
  
  getBayEfficiencyReports: async (): Promise<ApiResponse<any>> => {
    return { success: true, data: {} }
  },
  
  getVehicleTrackingReports: async (): Promise<ApiResponse<any>> => {
    return { success: true, data: {} }
  },
}

// Administration API
export const administrationApi = {
  getUsers: async (): Promise<ApiResponse<any[]>> => {
    return { success: true, data: [] }
  },
  
  getComponents: async (): Promise<ApiResponse<any[]>> => {
    return { success: true, data: [] }
  },
  
  getMasters: async (): Promise<ApiResponse<any[]>> => {
    return { success: true, data: [] }
  },
  
  getWorkflows: async (): Promise<ApiResponse<any[]>> => {
    return { success: true, data: [] }
  },
}

// Vehicle Assessment API
export const vehicleAssessmentApi = {
  getAssessments: async (): Promise<ApiResponse<any[]>> => {
    return { success: true, data: [] }
  },
  
  getAssessmentHistory: async (): Promise<ApiResponse<any[]>> => {
    return { success: true, data: [] }
  },
}

// Fetch Image server – Express server on port 5005: GET /fetchImage/:event_id
const FETCH_IMAGE_SERVER_URL =
  (import.meta.env.VITE_FETCH_IMAGE_SERVER_URL as string) || 'http://localhost:5005'

// Event Images API – uses Fetch Image server by default (GET /fetchImage/:event_id per event)
const EVENT_IMAGES_BASE_URL =
  (import.meta.env.VITE_EVENT_IMAGES_API_URL as string) ||
  (import.meta.env.VITE_API_BASE_URL as string) ||
  'http://localhost:5001/msil-rvt/us-central1'

export interface FetchImageResponse {
  eventId: string
  vehicle?: string | null
  images: Array<{ url: string; name: string }>
}

/** Single event with optional vehicle number (actualVrn) for image lookup */
export interface EventWithVrn {
  eventId: string
  actualVrn?: string
}

export const eventImagesApi = {
  /** GET /fetchImage?eventId=&vehicle= – returns { eventId, vehicle, images: [{ url, name }] } */
  getEventImage: async (
    eventId: string,
    vehicle?: string
  ): Promise<ApiResponse<FetchImageResponse>> => {
    try {
      const base = FETCH_IMAGE_SERVER_URL.replace(/\/$/, '')
      const params = new URLSearchParams()
      params.set('eventId', eventId)
      if (vehicle) params.set('vehicle', vehicle)
      const url = `${base}/fetchImage?${params.toString()}`
      const response = await fetch(url)
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`fetchImage: ${response.status} ${text}`)
      }
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('getEventImage error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },

  /** Fetch images for multiple events; each event can have its own actualVrn. */
  getEventImagesForMapping: async (
    events: EventWithVrn[]
  ): Promise<ApiResponse<{ eventImages: Record<string, string>; galleryImages: Array<{ url: string; eventId: string | null; name: string }> }>> => {
    const eventImages: Record<string, string> = {}
    const galleryImages: Array<{ url: string; eventId: string | null; name: string }> = []
    try {
      const results = await Promise.all(
        events.map((e) => eventImagesApi.getEventImage(e.eventId, e.actualVrn))
      )
      for (let i = 0; i < events.length; i++) {
        const res = results[i]
        const eid = events[i].eventId
        if (res.success && res.data?.images?.length) {
          const firstUrl = res.data.images[0].url
          eventImages[eid] = firstUrl
          res.data.images.forEach((img) => {
            galleryImages.push({ url: img.url, eventId: eid, name: img.name })
          })
        }
      }
      return { success: true, data: { eventImages, galleryImages } }
    } catch (error) {
      console.error('getEventImagesForMapping error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },

  /** Legacy: POST getEventImages (Firebase/other backend). Use getEventImagesForMapping when using Fetch Image server. */
  getEventImages: async (
    serviceStationId: string,
    subStationId: string,
    jobCardId: string,
    eventIds: string[]
  ): Promise<ApiResponse<{ eventImages: Record<string, string>; galleryImages: Array<{ url: string; eventId: string | null; name: string }> }>> => {
    try {
      const url = `${EVENT_IMAGES_BASE_URL.replace(/\/$/, '')}/getEventImages`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceStationId,
          subStationId,
          jobCardId,
          eventIds,
        }),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Event images: ${response.status} ${errorText}`)
      }
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching event images:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
}

