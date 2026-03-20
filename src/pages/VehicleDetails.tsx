import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  FiTruck, 
  FiClock, 
  FiUser, 
  FiCamera, 
  FiFileText, 
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiDownload,
  FiEdit,
  FiX
} from 'react-icons/fi'
import { format } from 'date-fns'
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore'
import { db, SERVICE_STATION_ID, SUB_STATION_ID } from '../lib/firebase'
import { eventImagesApi } from '../lib/api'
import {
  loadWorkshopSeedData,
  parseSeedTimestamp,
  getReportYear,
  resolveReportAssetUrl,
  USE_LOCAL_WORKSHOP_SEED,
} from '../lib/workshopSeed'
import { useWorkshopReport } from '../context/WorkshopReportContext'

interface VehicleTrackingStage {
  id: string
  stage: string
  direction: 'In' | 'Out'
  timestamp: Date
  image?: string
  imageUrl?: string
  location: string
  eventType?: string
  cameraId?: string
  bayId?: string
  directionality?: string
  roiId?: number
  eventId?: string
  actualVrn?: string
}

interface FirestoreEvent {
  id: string
  eventType?: string
  activityType?: string // Some events use activityType instead
  cameraId?: string | number
  bayId?: string | number | null
  roi?: string
  roiId?: number
  timestamp?: { toDate: () => Date } | Date | string
  directionality?: string
  createdAt?: { toDate: () => Date } | Date
  updatedAt?: { toDate: () => Date } | Date
  mappedVrn?: string
  actualVrn?: string
  variations?: string[]
  imageUrl?: string
  image?: string
  event_id?: string
}

interface JobCardDetail {
  jcNumber: string
  openTime: Date
  promisedTime: Date
  estimatedDelivery: Date
  serviceType: string
  serviceAdvisor: string
  model: string
  demandedRepairs: string[]
  status: string
  customerName?: string
  contactNo?: string
  email?: string
  regNum?: string
  jcStatus?: string
  jcOpenDate?: string
}

interface TechnicianDetail {
  id: string
  name: string
  role: string
  assignedBay: string
  contact: string
  currentTasks: string[]
}

interface AssessmentImage {
  id: string
  area: string
  type: 'outer' | 'underbody'
  url: string
  damageDetected: boolean
  severity?: 'minor' | 'moderate' | 'severe'
}

const mapEventTypeToStage = (eventType: string | undefined): { stage: string; location: string } => {
  if (!eventType || typeof eventType !== 'string') {
    return { stage: 'Unknown Event', location: 'Unknown' }
  }
  
  const upper = eventType.toUpperCase()
  
  // Handle specific activity types first (exact matches)
  if (upper === 'JC_OPENED' || upper === 'JC_OPEN') {
    return { stage: 'JC Opened', location: 'Reception' }
  }
  if (upper === 'BAY_IN' || upper === 'BAY_OUT') {
    return { stage: 'Bay Allocation', location: 'Service Bay' }
  }
  if (upper === 'WASH_IN' || upper === 'WASH_OUT') {
    return { stage: 'Washing', location: 'Washing Bay' }
  }
  if (upper === 'SHOP_FLOOR_ENTRY' || upper === 'SHOP_FLOOR_EXIT') {
    return { stage: 'Shop Floor', location: 'Service Floor' }
  }
  if (upper === 'ROAD_TEST_QUEUE_IN' || upper === 'ROAD_TEST_QUEUE_OUT') {
    return { stage: 'Road Test', location: 'Test Track' }
  }
  if (upper === 'GATE_IN' || upper === 'GATE_OUT') {
    return { stage: 'Gate Entry', location: 'Main Gate' }
  }
  
  // Then handle partial matches
  if (upper.includes('JC') || upper.includes('OPENED')) {
    return { stage: 'JC Opened', location: 'Reception' }
  }
  if (upper.includes('WASH')) {
    return { stage: 'Washing', location: 'Washing Bay' }
  }
  if (upper.includes('SHOP') || upper.includes('FLOOR') || upper === 'SHOP_FLOOR') {
    return { stage: 'Shop Floor', location: 'Service Floor' }
  }
  if (upper.includes('BAY')) {
    return { stage: 'Bay Allocation', location: `Bay ${eventType.split('_').pop() || 'N/A'}` }
  }
  if (upper.includes('GATE') || upper.includes('ENTRY') || upper === 'EVENT_IN') {
    return { stage: 'Gate Entry', location: 'Main Gate' }
  }
  if (upper.includes('ROAD') || upper.includes('TEST') || upper === 'ROAD_TEST') {
    return { stage: 'Road Test', location: 'Test Track' }
  }
  if (upper.includes('EXIT') || upper.includes('DELIVERED') || upper === 'FINAL_EXIT') {
    return { stage: 'Final Exit', location: 'Main Gate' }
  }
  return { stage: eventType.replace(/_/g, ' '), location: 'Unknown' }
}

export default function VehicleDetails() {
  const { vehicleReg } = useParams<{ vehicleReg: string }>()
  const navigate = useNavigate()
  const { reportDate } = useWorkshopReport()
  const [activeTab, setActiveTab] = useState<'tracking' | 'jobcard' | 'technician' | 'assessment'>('tracking')
  const [trackingStages, setTrackingStages] = useState<VehicleTrackingStage[]>([])
  const [loading, setLoading] = useState(true)
  const [jobCardId, setJobCardId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ url: string; stage: string; timestamp: Date } | null>(null)
  const [eventImageMap, setEventImageMap] = useState<Record<string, string>>({})
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; eventId: string | null; name: string }>>([])
  const [rawColumns, setRawColumns] = useState<Record<string, unknown>>({})

  const vehicleRegNumber = vehicleReg || 'DL-01-AB-1234'

  // Fetch event images from Fetch Image server (GET /fetchImage?eventId=&vehicle=); each event has its own actualVrn
  const fetchEventImages = async (
    _jobCardId: string,
    eventsWithVrn: Array<{ eventId: string; actualVrn?: string }>
  ) => {
    try {
      console.log('Fetching images for events:', eventsWithVrn)
      const result = await eventImagesApi.getEventImagesForMapping(eventsWithVrn)
      
      if (result.success && result.data) {
        console.log('Received image data:', result.data)
        setEventImageMap(result.data.eventImages || {})
        setGalleryImages(result.data.galleryImages || [])
        
        setTrackingStages(prevStages =>
          prevStages.map(stage => ({
            ...stage,
            imageUrl: (stage.eventId && result.data?.eventImages?.[stage.eventId])
              ? result.data.eventImages[stage.eventId]
              : stage.imageUrl
          }))
        )
      } else {
        console.warn('Failed to fetch event images:', result.error)
      }
    } catch (error) {
      console.error('Error fetching event images:', error)
    }
  }

  // Fetch job card and events
  useEffect(() => {
    if (!vehicleRegNumber) {
      setLoading(false)
      return
    }

    if (USE_LOCAL_WORKSHOP_SEED) {
      if (!reportDate) {
        setLoading(false)
        setTrackingStages([])
        setJobCardId(null)
        return
      }
      loadWorkshopSeedData(reportDate)
        .then((seed) => {
          const year = getReportYear(seed)
          const vehicle = seed.vehicles.find(
            (v) => v.vehicleRegistrationNumber.toUpperCase() === vehicleRegNumber.toUpperCase()
          )
          if (!vehicle) {
            setTrackingStages([])
            setJobCardId(null)
            setGalleryImages([])
            setRawColumns({})
            setLoading(false)
            return
          }

          setJobCardId(vehicle.id)
          const stages: VehicleTrackingStage[] = vehicle.events
            .map((event) => {
              const { stage, location } = mapEventTypeToStage(event.eventType)
              const timestamp =
                parseSeedTimestamp(event.timestampText, year) || new Date()
              return {
                id: event.id,
                stage,
                direction: (event.directionality === 'OUT' ? 'Out' : 'In') as 'In' | 'Out',
                timestamp,
                location,
                eventType: event.eventType,
                cameraId: event.cameraId || undefined,
                directionality: event.directionality,
                eventId: event.event_id,
                actualVrn: event.actualVrn || vehicle.vehicleRegistrationNumber,
                imageUrl: resolveReportAssetUrl(event.imageUrl),
              }
            })
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

          setTrackingStages(stages)
          setRawColumns(vehicle.rawColumns || {})
          setEventImageMap({})
          setGalleryImages(
            stages
              .filter((s) => Boolean(s.imageUrl))
              .map((s) => ({
                url: s.imageUrl || '',
                eventId: s.eventId || null,
                name: s.eventType || s.stage,
              }))
          )
          setLoading(false)
        })
        .catch((error) => {
          console.error('Failed to load local workshop seed for vehicle details:', error)
          setTrackingStages([])
          setJobCardId(null)
          setRawColumns({})
          setLoading(false)
        })
      return
    }

    let unsubscribeEvents: (() => void) | null = null

    const jobCardsRef = collection(
      db,
      'ServiceStation',
      SERVICE_STATION_ID,
      'subStation',
      SUB_STATION_ID,
      'jobCards'
    )
    const q = query(
      jobCardsRef,
      where('vehicleRegistrationNumber', '==', vehicleRegNumber.toUpperCase())
    )

    const unsubscribeJobCards = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setLoading(false)
        setTrackingStages([])
        setJobCardId(null)
        return
      }

      const jobCardDoc = snapshot.docs[0]
      setJobCardId(jobCardDoc.id)

      // Clean up previous events subscription
      if (unsubscribeEvents) {
        unsubscribeEvents()
      }

      // Fetch events subcollection - query without orderBy to avoid index issues
      const eventsRef = collection(
        db,
        'ServiceStation',
        SERVICE_STATION_ID,
        'subStation',
        SUB_STATION_ID,
        'jobCards',
        jobCardDoc.id,
        'events'
      )
      
      // Query without orderBy - we'll sort in memory
      const eventsQuery = query(eventsRef)

      unsubscribeEvents = onSnapshot(
        eventsQuery,
        (eventsSnapshot) => {
          console.log('Events snapshot received:', eventsSnapshot.size, 'events for jobCard:', jobCardDoc.id)
          
          if (eventsSnapshot.empty) {
            console.log('No events found in subcollection')
            setTrackingStages([])
            setLoading(false)
            return
          }
          
          const events: FirestoreEvent[] = eventsSnapshot.docs.map((doc) => {
            const data = doc.data()
            console.log('Event document:', doc.id, 'eventType:', data.eventType, 'data:', data)
            return {
              id: doc.id,
              ...data,
            }
          }) as FirestoreEvent[]

          console.log('Total parsed events:', events.length)

          const stages: VehicleTrackingStage[] = events
            .map((event) => {
              // Use activityType if available, otherwise fallback to eventType
              const eventType = event.activityType || event.eventType || 'UNKNOWN'
              
              const timestamp = event.timestamp
                ? typeof event.timestamp === 'object' && 'toDate' in event.timestamp
                  ? event.timestamp.toDate()
                  : event.timestamp instanceof Date
                  ? event.timestamp
                  : typeof event.timestamp === 'string'
                  ? new Date(event.timestamp)
                  : new Date()
                : event.createdAt
                ? typeof event.createdAt === 'object' && 'toDate' in event.createdAt
                  ? event.createdAt.toDate()
                  : event.createdAt instanceof Date
                  ? event.createdAt
                  : new Date()
                : new Date()

              const { stage, location } = mapEventTypeToStage(eventType)
              const eventTypeUpper = eventType.toUpperCase()
              const direction: 'In' | 'Out' = event.directionality === 'OUT' || eventTypeUpper.includes('EXIT') ? 'Out' : 'In'

              return {
                id: event.id,
                stage,
                direction,
                timestamp,
                location,
                eventType: eventType,
                cameraId: event.cameraId ? String(event.cameraId) : undefined,
                bayId: event.bayId ? String(event.bayId) : undefined,
                directionality: event.directionality,
                roiId: event.roiId,
                eventId: event.event_id,
                actualVrn: event.actualVrn,
                imageUrl: event.imageUrl || event.image || undefined,
              }
            })
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) // Sort by timestamp in memory

          console.log('Final stages after filtering and sorting:', stages.length, stages)
          setTrackingStages(stages)
          setLoading(false)
          
          // Fetch images for events; each event sends its own actualVrn
          const eventsWithVrn = stages
            .filter(s => s.eventId)
            .map(s => ({ eventId: s.eventId!, actualVrn: s.actualVrn }))
          
          if (eventsWithVrn.length > 0 && jobCardDoc.id) {
            fetchEventImages(jobCardDoc.id, eventsWithVrn)
          }
        },
        (error) => {
          console.error('Error fetching events from Firestore:', error)
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            jobCardId: jobCardDoc.id,
          })
          setTrackingStages([])
          setLoading(false)
        }
      )
    })

    return () => {
      unsubscribeJobCards()
      if (unsubscribeEvents) {
        unsubscribeEvents()
      }
    }
  }, [vehicleRegNumber, reportDate])

  const [jobCardDetails, setJobCardDetails] = useState<JobCardDetail>({
    jcNumber: '-',
    openTime: new Date(),
    promisedTime: new Date(),
    estimatedDelivery: new Date(),
    serviceType: '-',
    serviceAdvisor: '-',
    model: '-',
    demandedRepairs: [],
    status: 'Pending',
  })

  // Fetch job card details
  useEffect(() => {
    if (USE_LOCAL_WORKSHOP_SEED) {
      if (!vehicleRegNumber || !reportDate) return
      loadWorkshopSeedData(reportDate)
        .then((seed) => {
          const year = getReportYear(seed)
          const vehicle = seed.vehicles.find(
            (v) => v.vehicleRegistrationNumber.toUpperCase() === vehicleRegNumber.toUpperCase()
          )
          if (!vehicle) return
          const openTime =
            parseSeedTimestamp(vehicle.events[0]?.timestampText, year) || new Date()
          setJobCardDetails({
            jcNumber: vehicle.jobCardNumber,
            openTime,
            promisedTime: openTime,
            estimatedDelivery: openTime,
            serviceType: vehicle.jcDetails?.SRV_TYPE || 'General Service',
            serviceAdvisor: vehicle.jcDetails?.SRV_SDV_NAME || '-',
            model: vehicle.jcDetails?.SRV_MODEL || '-',
            demandedRepairs: [],
            status: vehicle.status === 'BILLED' ? 'Billed' : 'In Progress',
            regNum: vehicle.vehicleRegistrationNumber,
            jcOpenDate: vehicle.events[0]?.timestampText || '',
          })
        })
        .catch(() => {})
      return
    }

    if (!jobCardId) return

    const jobCardRef = doc(
      db,
      'ServiceStation',
      SERVICE_STATION_ID,
      'subStation',
      SUB_STATION_ID,
      'jobCards',
      jobCardId
    )

    const unsubscribe = onSnapshot(jobCardRef, (snapshot) => {
      if (!snapshot.exists()) return

      const data = snapshot.data()
      const jcDetails = data.jcDetails || {}
      const openTime = jcDetails.JC_OPEN_DATE
        ? new Date(jcDetails.JC_OPEN_DATE)
        : data.createdAt?.toDate?.() || data.createdAt || new Date()

      setJobCardDetails({
        jcNumber: jcDetails.JC_NO || jcDetails.JC_NUMBER || snapshot.id,
        openTime,
        promisedTime: jcDetails.PROM_DATE ? new Date(jcDetails.PROM_DATE) : jcDetails.PROMISED_TIME ? new Date(jcDetails.PROMISED_TIME) : new Date(),
        estimatedDelivery: jcDetails.ESTIMATED_DELIVERY ? new Date(jcDetails.ESTIMATED_DELIVERY) : new Date(),
        serviceType: jcDetails.SRV_TYPE || data.serviceType || '-',
        serviceAdvisor: jcDetails.SRV_SDV_NAME || '-',
        model: jcDetails.SRV_MODEL || data.vehicleDetails?.model || '-',
        demandedRepairs: jcDetails.DEMANDED_REPAIRS || [],
        status: data.status === 'OPEN' ? 'In Progress' : data.status === 'BILLED' ? 'Billed' : 'Pending',
        customerName: jcDetails.CUST_NAME,
        contactNo: jcDetails.CONTACT_NO,
        email: jcDetails.EMAIL,
        regNum: jcDetails.REG_NUM || data.vehicleRegistrationNumber,
        jcStatus: jcDetails.JC_STATUS,
        jcOpenDate: jcDetails.JC_OPEN_DATE,
      })
    })

    return () => unsubscribe()
  }, [jobCardId, vehicleRegNumber, reportDate])

  const [technicianDetails, setTechnicianDetails] = useState<TechnicianDetail | null>(null)
  const [assessmentImages, setAssessmentImages] = useState<AssessmentImage[]>([])

  // Fetch technician details if available in job card
  useEffect(() => {
    if (USE_LOCAL_WORKSHOP_SEED) {
      setTechnicianDetails({
        id: 'N/A',
        name: 'Not Assigned',
        role: 'Technician',
        assignedBay: 'N/A',
        contact: 'N/A',
        currentTasks: [],
      })
      return
    }

    if (!jobCardId) {
      setTechnicianDetails(null)
      return
    }

    const jobCardRef = doc(
      db,
      'ServiceStation',
      SERVICE_STATION_ID,
      'subStation',
      SUB_STATION_ID,
      'jobCards',
      jobCardId
    )

    const unsubscribe = onSnapshot(jobCardRef, (snapshot) => {
      if (!snapshot.exists()) {
        setTechnicianDetails(null)
        return
      }

      const data = snapshot.data()
      // If technician data exists in job card, use it; otherwise show placeholder
      if (data.technicianDetails || data.assignedTechnician) {
        const techData = data.technicianDetails || data.assignedTechnician
        setTechnicianDetails({
          id: techData.id || 'N/A',
          name: techData.name || 'Not Assigned',
          role: techData.role || 'N/A',
          assignedBay: techData.assignedBay || data.bayId || 'N/A',
          contact: techData.contact || 'N/A',
          currentTasks: techData.currentTasks || [],
        })
      } else {
        setTechnicianDetails({
          id: 'N/A',
          name: 'Not Assigned',
          role: 'N/A',
          assignedBay: data.bayId || 'N/A',
          contact: 'N/A',
          currentTasks: [],
        })
      }
    })

    return () => unsubscribe()
  }, [jobCardId])

  // Fetch assessment images if available
  useEffect(() => {
    if (USE_LOCAL_WORKSHOP_SEED) {
      if (!vehicleRegNumber || !reportDate) {
        setAssessmentImages([])
        return
      }
      loadWorkshopSeedData(reportDate)
        .then((seed) => {
          const vehicle = seed.vehicles.find(
            (v) => v.vehicleRegistrationNumber.toUpperCase() === vehicleRegNumber.toUpperCase()
          )
          const raw = vehicle?.assessment || []
          setAssessmentImages(
            raw.map((img) => ({
              ...img,
              url: resolveReportAssetUrl(img.url) || img.url,
            }))
          )
        })
        .catch(() => setAssessmentImages([]))
      return
    }

    if (!jobCardId) {
      setAssessmentImages([])
      return
    }

    const assessmentRef = collection(
      db,
      'ServiceStation',
      SERVICE_STATION_ID,
      'subStation',
      SUB_STATION_ID,
      'jobCards',
      jobCardId,
      'assessment'
    )

    const unsubscribe = onSnapshot(assessmentRef, (snapshot) => {
      const images: AssessmentImage[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          area: data.area || 'Unknown',
          type: data.type || 'outer',
          url: data.url || data.imageUrl || '',
          damageDetected: data.damageDetected || false,
          severity: data.severity,
        }
      })
      setAssessmentImages(images)
    })

    return () => unsubscribe()
  }, [jobCardId, vehicleRegNumber, reportDate])

  const tabs = [
    { id: 'tracking', label: 'Vehicle Tracking', icon: FiTruck },
    { id: 'jobcard', label: 'Job Card Details', icon: FiFileText },
    { id: 'technician', label: 'Technician Details', icon: FiUser },
    { id: 'assessment', label: '360° Assessment', icon: FiCamera },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{vehicleRegNumber}</h1>
            <p className="text-gray-600 mt-1">Complete vehicle tracking and service details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <FiDownload className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
            <FiEdit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Vehicle Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
              <FiTruck className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{jobCardDetails.model}</h2>
              <p className="text-sm text-gray-600">Job Card: {jobCardDetails.jcNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Current Status</p>
            <p className="text-lg font-semibold text-blue-600">{jobCardDetails.status}</p>
          </div>
        </div>
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
        {/* Vehicle Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Event Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Event Timeline</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading events...</div>
              ) : trackingStages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No events found for this vehicle</div>
              ) : (
                <div className="space-y-4">
                  {trackingStages.map((stage, index) => {
                    const formattedEventType = stage.eventType?.split('_').join(' ') || stage.stage
                    return (
                      <div key={stage.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                        {/* Top Row: Event Type, Timestamp, Image */}
                        <div className="flex items-center gap-4 mb-3">
                          {/* Event Type */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 truncate">{formattedEventType}</h3>
                          </div>
                          
                          {/* Timestamp */}
                          <div className="text-right whitespace-nowrap">
                            <p className="text-base font-semibold text-gray-700">
                              {format(stage.timestamp, 'dd MMM, HH:mm:ss')}
                            </p>
                          </div>
                          
                          {/* Image */}
                          {stage.imageUrl || (stage.eventId && eventImageMap[stage.eventId]) ? (
                            <button
                              onClick={() => setSelectedImage({ 
                                url: stage.imageUrl || eventImageMap[stage.eventId!] || '', 
                                stage: stage.stage, 
                                timestamp: stage.timestamp 
                              })}
                              className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-300 hover:border-primary-500 transition-colors cursor-pointer group relative"
                            >
                              <img 
                                src={stage.imageUrl || eventImageMap[stage.eventId!] || ''} 
                                alt={stage.stage}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  const target = e.currentTarget
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>'
                                  }
                                }}
                              />
                            </button>
                          ) : (
                            <div className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                              <FiCamera className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Bottom Row: Location, Camera, ROI ID */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Location:</span>
                            <span>{stage.location}</span>
                          </div>
                          {stage.cameraId && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Camera:</span>
                              <span>{stage.cameraId}</span>
                            </div>
                          )}
                          {stage.roiId && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">ROI:</span>
                              <span>{stage.roiId}</span>
                            </div>
                          )}
                          {stage.bayId && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Bay:</span>
                              <span>{stage.bayId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right Side - Gallery Images */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Vehicle Gallery</h2>
              {galleryImages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FiCamera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No images available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {galleryImages.map((img, idx) => {
                    // Find the corresponding stage for this image
                    const stage = trackingStages.find(s => s.eventId === img.eventId)
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (stage) {
                            setSelectedImage({ 
                              url: img.url, 
                              stage: stage.stage, 
                              timestamp: stage.timestamp 
                            })
                          }
                        }}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-primary-300 transition-colors"
                      >
                        <img 
                          src={img.url} 
                          alt={stage?.stage || img.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            const target = e.currentTarget
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>'
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <p className="text-sm font-medium">{stage?.stage || img.name}</p>
                            {stage && (
                              <p className="text-xs text-white/80">{format(stage.timestamp, 'dd MMM, HH:mm')}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Job Card Details Tab */}
        {activeTab === 'jobcard' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Card Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Important Fields */}
              {jobCardDetails.regNum && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Registration Number</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{jobCardDetails.regNum}</p>
                </div>
              )}
              {jobCardDetails.customerName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Name</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{jobCardDetails.customerName}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Job Card Number</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{jobCardDetails.jcNumber}</p>
              </div>
              {jobCardDetails.jcOpenDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">JC Open Date</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{jobCardDetails.jcOpenDate}</p>
                </div>
              )}
              {jobCardDetails.jcStatus && (
                <div>
                  <label className="text-sm font-medium text-gray-500">JC Status</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{jobCardDetails.jcStatus}</p>
                </div>
              )}
              {jobCardDetails.serviceAdvisor && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Service Advisor</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{jobCardDetails.serviceAdvisor}</p>
                </div>
              )}
              {jobCardDetails.model && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Vehicle Model</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{jobCardDetails.model}</p>
                </div>
              )}
              {jobCardDetails.serviceType && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Service Type</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{jobCardDetails.serviceType}</p>
                </div>
              )}
              {jobCardDetails.contactNo && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Number</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{jobCardDetails.contactNo}</p>
                </div>
              )}
              {jobCardDetails.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{jobCardDetails.email}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Promised Delivery Time</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {format(jobCardDetails.promisedTime, 'dd MMM yyyy, HH:mm')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className={`text-lg font-semibold mt-1 ${
                  jobCardDetails.status === 'Billed' ? 'text-green-600' : 
                  jobCardDetails.status === 'In Progress' ? 'text-blue-600' : 
                  'text-orange-600'
                }`}>
                  {jobCardDetails.status}
                </p>
              </div>
            </div>

            {jobCardDetails.demandedRepairs && jobCardDetails.demandedRepairs.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Demanded Repairs</label>
                <ul className="space-y-2">
                  {jobCardDetails.demandedRepairs.map((repair, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-900">{repair}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Object.keys(rawColumns).length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-500 mb-3 block">Source Sheet Columns (Dynamic)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(rawColumns).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-xs font-medium text-gray-500">{key}</label>
                      <p className="text-sm text-gray-900 mt-1 break-words">
                        {value === null || value === undefined || String(value).trim() === '' ? '-' : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Technician Details Tab */}
        {activeTab === 'technician' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Technician Information</h2>
            {technicianDetails ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Technician Name</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{technicianDetails.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Role</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{technicianDetails.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned Bay</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{technicianDetails.assignedBay}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{technicianDetails.contact}</p>
                  </div>
                </div>

                {technicianDetails.currentTasks.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Current Tasks</label>
                    <ul className="space-y-2">
                      {technicianDetails.currentTasks.map((task, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <FiClock className="w-4 h-4 text-orange-600" />
                          <span className="text-gray-900">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No technician information available</p>
              </div>
            )}
          </div>
        )}

        {/* 360° Assessment Tab */}
        {activeTab === 'assessment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">360° Vehicle Assessment</h2>
              
              {assessmentImages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiCamera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No assessment images available for this vehicle</p>
                </div>
              ) : (
                <>
                  {/* Assessment Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Images</p>
                      <p className="text-2xl font-bold text-blue-600">{assessmentImages.length}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600">Damages Detected</p>
                      <p className="text-2xl font-bold text-red-600">
                        {assessmentImages.filter(img => img.damageDetected).length}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Overall Condition</p>
                      <p className="text-2xl font-bold text-green-600">
                        {assessmentImages.filter(img => img.damageDetected).length === 0 ? 'Good' : 'Needs Attention'}
                      </p>
                    </div>
                  </div>

                  {/* Outer Body Images */}
                  {assessmentImages.filter(img => img.type === 'outer').length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-md font-semibold text-gray-900 mb-4">Outer Body Assessment</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {assessmentImages
                          .filter(img => img.type === 'outer')
                          .map((image) => (
                            <div key={image.id} className="space-y-2">
                              <div className="aspect-video bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center relative">
                                {image.url ? (
                                  <img src={image.url} alt={image.area} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                  <FiCamera className="w-8 h-8 text-gray-400" />
                                )}
                                {image.damageDetected && (
                                  <div className="absolute top-2 right-2">
                                    <FiAlertCircle className={`w-5 h-5 ${
                                      image.severity === 'severe' ? 'text-red-600' :
                                      image.severity === 'moderate' ? 'text-orange-600' :
                                      'text-yellow-600'
                                    }`} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-900">{image.area}</p>
                                {image.damageDetected && (
                                  <p className={`text-xs ${
                                    image.severity === 'severe' ? 'text-red-600' :
                                    image.severity === 'moderate' ? 'text-orange-600' :
                                    'text-yellow-600'
                                  }`}>
                                    {image.severity} damage
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Underbody Images */}
                  {assessmentImages.filter(img => img.type === 'underbody').length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold text-gray-900 mb-4">Underbody Assessment</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {assessmentImages
                          .filter(img => img.type === 'underbody')
                          .map((image) => (
                            <div key={image.id} className="space-y-2">
                              <div className="aspect-video bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                                {image.url ? (
                                  <img src={image.url} alt={image.area} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                  <FiCamera className="w-8 h-8 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-900">{image.area}</p>
                                {!image.damageDetected && (
                                  <p className="text-xs text-green-600">No damage</p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Damage Details */}
            {assessmentImages.filter(img => img.damageDetected).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Detected Damages</h2>
                <div className="space-y-4">
                  {assessmentImages
                    .filter(img => img.damageDetected)
                    .map((image) => (
                      <div key={image.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{image.area}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Type: {image.type === 'outer' ? 'Outer Body' : 'Underbody'}
                            </p>
                            {image.severity && (
                              <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                                image.severity === 'severe' ? 'bg-red-100 text-red-700' :
                                image.severity === 'moderate' ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {image.severity} severity
                              </span>
                            )}
                          </div>
                          {image.url && (
                            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                              View Full Image
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Popup Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full text-white transition-colors"
              aria-label="Close"
            >
              <FiX className="w-6 h-6" />
            </button>
            
            {/* Image */}
            <img 
              src={selectedImage.url} 
              alt={selectedImage.stage}
              className="w-full h-auto max-h-[90vh] object-contain"
              onError={(e) => {
                e.currentTarget.src = ''
                e.currentTarget.alt = 'Image failed to load'
              }}
            />
            
            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <p className="text-lg font-semibold">{selectedImage.stage}</p>
              <p className="text-sm text-white/80">{format(selectedImage.timestamp, 'dd MMM yyyy, HH:mm:ss')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

