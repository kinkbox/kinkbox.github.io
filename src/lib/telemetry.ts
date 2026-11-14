import type { KinkList, RatingsMap } from '@/lib/types'
import { flattenSlots } from '@/lib/ratingsOrder'

export type Telemetry = {
  total: number
  rated: number
  percent: number
  byLevel: number[]
}

export function computeTelemetry(list: KinkList, ratings: RatingsMap): Telemetry {
  const slots = flattenSlots(list)
  const byLevel = [0, 0, 0, 0, 0, 0]
  let rated = 0
  for (const slot of slots) {
    const v = ratings[slot.key] ?? 0
    byLevel[v] = (byLevel[v] ?? 0) + 1
    if (v > 0) rated++
  }
  const total = slots.length
  return {
    total,
    rated,
    percent: total ? Math.round((rated / total) * 1000) / 10 : 0,
    byLevel,
  }
}

export function categoryRatedCount(
  list: KinkList,
  ratings: RatingsMap,
  category: string,
): { rated: number; total: number } {
  const cat = list[category]
  if (!cat) return { rated: 0, total: 0 }
  let total = 0
  let rated = 0
  for (const kink of cat.kinks) {
    for (const field of cat.fields) {
      total++
      const key = `${category}|${kink.name}|${field}`
      if ((ratings[key] ?? 0) > 0) rated++
    }
  }
  return { rated, total }
}
