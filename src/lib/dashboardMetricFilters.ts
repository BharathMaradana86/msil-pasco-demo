export type DashboardMetricKey =
  | 'gateInButJcNotOpen'
  | 'washing'
  | 'shopFloor'
  | 'roadTest'
  | 'jcClosedButNotBilled'
  | 'billedButNotDelivered'
  | 'delivered'

/** Minimal fields needed to match KPI buckets (same logic as aggregation buckets). */
export interface VehicleMetricFields {
  lastEvent?: string
  jobCardStatus?: string
}

const GATE_IN_EVENTS = new Set(['GATE_IN', 'EVENT_IN'])
const WASH_EVENTS = new Set(['WASHING', 'WASH_IN'])
const SHOP_FLOOR_EVENTS = new Set([
  'SHOP_FLOOR',
  'SHOP_FLOOR_ENTRY',
  'BAY_IN',
  'BAY_OUT',
  'SHOP_FLOOR_EXIT',
])
const ROAD_EVENTS = new Set(['ROAD_TEST', 'ROAD_TEST_QUEUE_IN', 'ROAD_TEST_QUEUE_OUT'])

export function vehicleMatchesDashboardMetric(
  v: VehicleMetricFields,
  key: DashboardMetricKey
): boolean {
  const last = (v.lastEvent || '').trim().toUpperCase()
  const status = (v.jobCardStatus || '').trim().toUpperCase()

  switch (key) {
    case 'gateInButJcNotOpen':
      return GATE_IN_EVENTS.has(last)
    case 'washing':
      return WASH_EVENTS.has(last)
    case 'shopFloor':
      return SHOP_FLOOR_EVENTS.has(last)
    case 'roadTest':
      return ROAD_EVENTS.has(last)
    case 'jcClosedButNotBilled':
      return status === 'OPEN'
    case 'billedButNotDelivered':
      return status === 'BILLED'
    case 'delivered':
      return last === 'FINAL_EXIT' || last === 'DELIVERED' || last === 'GATE_OUT'
    default:
      return false
  }
}
