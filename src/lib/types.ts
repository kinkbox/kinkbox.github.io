export const RATING_LEVELS = [
  'Not Entered',
  'Favorite',
  'Like',
  'Indifferent',
  'Maybe',
  'Limit',
] as const

export type RatingLevel = (typeof RATING_LEVELS)[number]

/** Stitch design rating chroma */
export const RATING_COLORS: Record<RatingLevel, string> = {
  'Not Entered': '#3b3b48',
  Favorite: '#f43f5e',
  Like: '#10b981',
  Indifferent: '#06b6d4',
  Maybe: '#f59e0b',
  Limit: '#ef4444',
}

export const RATING_GLOW: Record<RatingLevel, string> = {
  'Not Entered': 'transparent',
  Favorite: 'rgba(244, 63, 94, 0.4)',
  Like: 'rgba(16, 185, 129, 0.4)',
  Indifferent: 'rgba(6, 182, 212, 0.35)',
  Maybe: 'rgba(245, 158, 11, 0.4)',
  Limit: 'rgba(239, 68, 68, 0.4)',
}

export const RATING_SHORT: Record<RatingLevel, string> = {
  'Not Entered': 'UNRATED',
  Favorite: 'FAV',
  Like: 'LIKE',
  Indifferent: 'MEH',
  Maybe: 'MAYBE',
  Limit: 'LIMIT',
}

export const RATING_CLASS: Record<RatingLevel, string> = {
  'Not Entered': 'notEntered',
  Favorite: 'favorite',
  Like: 'like',
  Indifferent: 'indifferent',
  Maybe: 'maybe',
  Limit: 'limit',
}

export type KinkItem = {
  name: string
  desc?: string
}

export type Category = {
  fields: string[]
  kinks: KinkItem[]
}

export type KinkList = Record<string, Category>

/** Ratings keyed by `category|kink|field` → level index 0–5 */
export type RatingsMap = Record<string, number>

export function ratingKey(category: string, kink: string, field: string): string {
  return `${category}|${kink}|${field}`
}

export type ListType = 'classic' | 'detailed' | 'plsno'

export const LIST_LABELS: Record<ListType, string> = {
  classic: 'Classic',
  detailed: 'Detailed',
  plsno: "Please Don't",
}

export const LIST_FILES: Record<ListType, string> = {
  classic: '/classic.txt',
  detailed: '/detailed.txt',
  plsno: '/plsno.txt',
}
