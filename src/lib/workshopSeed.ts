export interface SeedEvent {
  id: string
  eventType: string
  stageLabel: string
  timestampText: string | null
  timestampYear?: number
  cameraId?: string | null
  directionality?: 'IN' | 'OUT'
  imageUrl?: string
  event_id?: string
  actualVrn?: string
}

export interface SeedVehicle {
  id: string
  jobCardNumber: string
  vehicleRegistrationNumber: string
  lastEvent: string
  status: 'OPEN' | 'BILLED' | 'PENDING'
  jcDetails?: Record<string, string>
  rawColumns?: Record<string, unknown>
  events: SeedEvent[]
  assessment?: Array<{
    id: string
    area: string
    type: 'outer' | 'underbody'
    url: string
    damageDetected: boolean
    severity?: 'minor' | 'moderate' | 'severe'
  }>
}

export interface WorkshopSeedData {
  /** YYYY-MM-DD */
  reportDate?: string
  date?: string
  sourceFile?: string
  sheet?: string
  headers?: string[]
  generatedAt?: string
  vehicles: SeedVehicle[]
}

const STAGE_TO_DATE_PREFIX: Record<string, string> = {
  JAN: 'Jan',
  FEB: 'Feb',
  MAR: 'Mar',
  APR: 'Apr',
  MAY: 'May',
  JUN: 'Jun',
  JUL: 'Jul',
  AUG: 'Aug',
  SEP: 'Sep',
  OCT: 'Oct',
  NOV: 'Nov',
  DEC: 'Dec',
}

/** When false, UI uses Firestore instead of workshop report API. */
export const USE_LOCAL_WORKSHOP_SEED =
  (import.meta.env.VITE_USE_LOCAL_WORKSHOP_SEED as string | undefined) !== 'false'

/**
 * Backend base URL for workshop reports.
 * Leave unset or empty in dev to use same-origin `/api/...` (Vite proxy → server :5000).
 */
/**
 * Empty string = same origin (Vite dev: proxy `/api` → backend).
 * Set `VITE_WORKSHOP_API_URL=http://localhost:5000` if frontend is served without proxy.
 */
export function getWorkshopApiBase(): string {
  // return "https://encouraging-instrumental-mae-pie.trycloudflare.com"4
  return "http://localhost:5001"
  const v = import.meta.env.VITE_WORKSHOP_API_URL as string | undefined
  if (v === '' || v === undefined) return ''
  return String(v).replace(/\/$/, '')
}

/** Optional fixed report day; if empty, latest from GET /api/reports is used. */
export function getConfiguredReportDate(): string | null {
  const d = (import.meta.env.VITE_WORKSHOP_REPORT_DATE as string | undefined)?.trim()
  return d || null
}

/** Resolve image/event URLs stored as `/api/reports/...` to full URL when API is on another host. */
export function resolveReportAssetUrl(pathOrUrl: string | undefined | null): string | undefined {
  if (!pathOrUrl) return undefined
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const base = getWorkshopApiBase()
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return base ? `${base}${path}` : path
}

export function getReportYear(seed: WorkshopSeedData): number {
  const fromDate = seed.reportDate || seed.date
  if (fromDate && /^\d{4}/.test(fromDate)) {
    const y = parseInt(fromDate.slice(0, 4), 10)
    if (!Number.isNaN(y)) return y
  }
  const first = seed.vehicles[0]?.events[0]?.timestampYear
  if (typeof first === 'number' && !Number.isNaN(first)) return first
  return new Date().getFullYear()
}

const seedCache = new Map<string, WorkshopSeedData>()

export async function listWorkshopReportDates(): Promise<string[]> {
  const base = getWorkshopApiBase()
  const url = `${base}/api/reports`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to list reports: ${res.status}`)
  const data = (await res.json()) as { dates?: string[] }
  return data.dates || []
}

/**
 * Loads seed for a report day. Pass null/undefined to use VITE_WORKSHOP_REPORT_DATE or latest available.
 */
export async function loadWorkshopSeedData(
  reportDate?: string | null
): Promise<WorkshopSeedData> {
  let date = reportDate ?? getConfiguredReportDate()
  const base = getWorkshopApiBase()

  if (!date) {
    const dates = await listWorkshopReportDates()
    date = dates[0] || null
  }

  if (!date) {
    throw new Error(
      'No workshop report found. Run server extract script and ensure server/data/reports/YYYY-MM-DD/seed.json exists.'
    )
  }

  if (seedCache.has(date)) {
    return seedCache.get(date)!
  }

  const path = `/api/reports/${encodeURIComponent(date)}`
  const url = base ? `${base}${path}` : path
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to load workshop report ${date}: ${res.status}`)
  }
  const data = (await res.json()) as WorkshopSeedData
  seedCache.set(date, data)
  return data
}

/** Clear cache after re-importing a new Excel for the same day. */
export function clearWorkshopSeedCache(): void {
  seedCache.clear()
}

export function parseSeedTimestamp(
  value: string | null | undefined,
  year?: number
): Date | null {
  if (!value) return null
  const y = year ?? new Date().getFullYear()
  const match = value.match(/^(\d{1,2})-([A-Za-z]{3})\s+(\d{2}:\d{2}:\d{2})$/)
  if (!match) return null
  const day = match[1].padStart(2, '0')
  const mon = STAGE_TO_DATE_PREFIX[match[2].toUpperCase()] || match[2]
  const time = match[3]
  const dt = new Date(`${mon} ${day} ${y} ${time}`)
  return Number.isNaN(dt.getTime()) ? null : dt
}
