import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  listWorkshopReportDates,
  getConfiguredReportDate,
  USE_LOCAL_WORKSHOP_SEED,
} from '../lib/workshopSeed'

const STORAGE_KEY = 'msil-workshop-report-date'

export interface WorkshopReportContextValue {
  /** Selected report day YYYY-MM-DD; null while loading or if no reports */
  reportDate: string | null
  setReportDate: (date: string | null) => void
  availableDates: string[]
  datesLoading: boolean
  datesError: string | null
  refreshDates: () => Promise<void>
}

const WorkshopReportContext = createContext<WorkshopReportContextValue | null>(null)

export function WorkshopReportProvider({ children }: { children: ReactNode }) {
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [datesLoading, setDatesLoading] = useState(true)
  const [datesError, setDatesError] = useState<string | null>(null)
  const [reportDate, setReportDateState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  })

  const refreshDates = useCallback(async () => {
    if (!USE_LOCAL_WORKSHOP_SEED) {
      setAvailableDates([])
      setDatesLoading(false)
      setDatesError(null)
      return
    }
    setDatesLoading(true)
    setDatesError(null)
    try {
      const dates = await listWorkshopReportDates()
      setAvailableDates(dates)
    } catch (e) {
      setDatesError(e instanceof Error ? e.message : 'Failed to load report dates')
      setAvailableDates([])
    } finally {
      setDatesLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshDates()
  }, [refreshDates])

  // Pick a valid reportDate once we know available dates
  useEffect(() => {
    if (!USE_LOCAL_WORKSHOP_SEED) return
    if (datesLoading) return
    if (availableDates.length === 0) {
      setReportDateState(null)
      return
    }

    setReportDateState((current) => {
      if (current && availableDates.includes(current)) return current
      const env = getConfiguredReportDate()
      if (env && availableDates.includes(env)) return env
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY)
        if (stored && availableDates.includes(stored)) return stored
      } catch {
        /* ignore */
      }
      return availableDates[0]
    })
  }, [datesLoading, availableDates])

  const setReportDate = useCallback((d: string | null) => {
    setReportDateState(d)
    try {
      if (d) sessionStorage.setItem(STORAGE_KEY, d)
      else sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<WorkshopReportContextValue>(
    () => ({
      reportDate,
      setReportDate,
      availableDates,
      datesLoading,
      datesError,
      refreshDates,
    }),
    [reportDate, setReportDate, availableDates, datesLoading, datesError, refreshDates]
  )

  return (
    <WorkshopReportContext.Provider value={value}>{children}</WorkshopReportContext.Provider>
  )
}

export function useWorkshopReport(): WorkshopReportContextValue {
  const ctx = useContext(WorkshopReportContext)
  if (!ctx) {
    throw new Error('useWorkshopReport must be used within WorkshopReportProvider')
  }
  return ctx
}

/** Safe when provider might be absent (returns null). */
export function useWorkshopReportOptional(): WorkshopReportContextValue | null {
  return useContext(WorkshopReportContext)
}
