import type { KinkList, RatingsMap } from '@/lib/types'
import { ratingKey, RATING_LEVELS } from '@/lib/types'
import { decodeRatings, encodeRatings } from '@/lib/hash'

/**
 * Flatten in DOM / hash order: category → kink → field
 * (matches original `#InputList .choices` walk order).
 */
export function flattenSlots(
  list: KinkList,
): { key: string; category: string; kink: string; field: string }[] {
  const slots: { key: string; category: string; kink: string; field: string }[] = []
  for (const category of Object.keys(list)) {
    const { fields, kinks } = list[category]
    for (const kink of kinks) {
      for (const field of fields) {
        slots.push({
          key: ratingKey(category, kink.name, field),
          category,
          kink: kink.name,
          field,
        })
      }
    }
  }
  return slots
}

/** Guided-input order: category → field → kink (original getAllKinks). */
export function flattenGuidedSlots(
  list: KinkList,
): { key: string; category: string; kink: string; field: string; showField: boolean; desc?: string }[] {
  const slots: {
    key: string
    category: string
    kink: string
    field: string
    showField: boolean
    desc?: string
  }[] = []
  for (const category of Object.keys(list)) {
    const { fields, kinks } = list[category]
    for (const field of fields) {
      for (const kink of kinks) {
        slots.push({
          key: ratingKey(category, kink.name, field),
          category,
          kink: kink.name,
          field,
          showField: fields.length >= 2,
          desc: kink.desc,
        })
      }
    }
  }
  return slots
}

export function ratingsToHash(list: KinkList, ratings: RatingsMap): string {
  const base = RATING_LEVELS.length
  const values = flattenSlots(list).map((s) => ratings[s.key] ?? 0)
  return encodeRatings(base, values)
}

export function hashToRatings(list: KinkList, hash: string): RatingsMap {
  if (hash.length < 10) return {}
  const base = RATING_LEVELS.length
  const values = decodeRatings(base, hash)
  const slots = flattenSlots(list)
  const next: RatingsMap = {}
  slots.forEach((slot, i) => {
    const v = values[i]
    if (v !== undefined && v > 0) next[slot.key] = v
  })
  return next
}

export function remapRatings(old: RatingsMap, nextList: KinkList): RatingsMap {
  const next: RatingsMap = {}
  for (const slot of flattenSlots(nextList)) {
    if (old[slot.key] !== undefined) next[slot.key] = old[slot.key]
  }
  return next
}
