import { useCallback, useEffect, useRef, useState } from 'react'
import type { KinkList, RatingsMap } from '@/lib/types'
import { hashToRatings, ratingsToHash } from '@/lib/ratingsOrder'

export function useRatings(list: KinkList | null) {
  const [ratings, setRatings] = useState<RatingsMap>({})
  const skipHashWrite = useRef(false)
  const listRef = useRef(list)
  listRef.current = list

  const applyHash = useCallback((hash: string, currentList: KinkList) => {
    skipHashWrite.current = true
    setRatings(hashToRatings(currentList, hash))
  }, [])

  const hydrated = useRef(false)

  // Hydrate from URL once on first successful list load
  useEffect(() => {
    if (!list || hydrated.current) return
    hydrated.current = true
    const hash = location.hash.substring(1)
    if (hash.length >= 10) {
      applyHash(hash, list)
    }
  }, [list, applyHash])

  // Write hash when ratings change
  useEffect(() => {
    if (!list) return
    if (skipHashWrite.current) {
      skipHashWrite.current = false
      return
    }
    const encoded = ratingsToHash(list, ratings)
    const next = '#' + encoded
    if (location.hash !== next) {
      history.replaceState(null, '', next)
    }
  }, [ratings, list])

  // Listen for external hash changes
  useEffect(() => {
    const onHash = () => {
      const current = listRef.current
      if (!current) return
      applyHash(location.hash.substring(1), current)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [applyHash])

  const setRating = useCallback((key: string, levelIndex: number) => {
    setRatings((prev) => {
      const next = { ...prev }
      if (levelIndex <= 0) delete next[key]
      else next[key] = levelIndex
      return next
    })
  }, [])

  const replaceRatings = useCallback((next: RatingsMap) => {
    setRatings(next)
  }, [])

  return { ratings, setRating, replaceRatings }
}
