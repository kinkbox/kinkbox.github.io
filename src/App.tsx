import { useCallback, useEffect, useMemo, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { DescriptionDialog } from '@/components/DescriptionDialog'
import { EditListDialog } from '@/components/EditListDialog'
import { GuidedInput } from '@/components/GuidedInput'
import { KinkGrid } from '@/components/KinkGrid'
import { TelemetryBar } from '@/components/TelemetryBar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useRatings } from '@/hooks/useRatings'
import { exportPng } from '@/lib/exportPng'
import {
  kinkListToText,
  loadListFile,
  ParseError,
  parseKinksText,
} from '@/lib/parseKinks'
import { remapRatings, ratingsToHash } from '@/lib/ratingsOrder'
import { computeTelemetry } from '@/lib/telemetry'
import {
  LIST_FILES,
  type KinkList,
  type ListType,
} from '@/lib/types'

export default function App() {
  const [listType, setListType] = useState<ListType>('classic')
  const [list, setList] = useState<KinkList | null>(null)
  const [listText, setListText] = useState('')
  const [listCounts, setListCounts] = useState<Partial<Record<ListType, number>>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [guidedOpen, setGuidedOpen] = useState(false)
  const [descOpen, setDescOpen] = useState(false)
  const [descText, setDescText] = useState('')

  const [filter, setFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all')
  const [onlyRated, setOnlyRated] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const { ratings, setRating, replaceRatings } = useRatings(list)

  const telemetry = useMemo(
    () => (list ? computeTelemetry(list, ratings) : null),
    [list, ratings],
  )

  const hash = useMemo(
    () => (list ? ratingsToHash(list, ratings) : ''),
    [list, ratings],
  )

  const loadType = useCallback(
    async (type: ListType, keepRatings?: typeof ratings) => {
      setLoading(true)
      setError(null)
      try {
        const text = await loadListFile(LIST_FILES[type])
        const parsed = parseKinksText(text)
        setListText(text)
        setList(parsed)
        const total = Object.values(parsed).reduce(
          (n, c) => n + c.kinks.length * c.fields.length,
          0,
        )
        setListCounts((prev) => ({ ...prev, [type]: total }))
        if (keepRatings) {
          replaceRatings(remapRatings(keepRatings, parsed))
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load list')
      } finally {
        setLoading(false)
      }
    },
    [replaceRatings],
  )

  useEffect(() => {
    void loadType('classic')
    // Prefetch counts for other lists
    ;(['detailed', 'plsno'] as ListType[]).forEach((t) => {
      void loadListFile(LIST_FILES[t])
        .then((text) => {
          const parsed = parseKinksText(text)
          const total = Object.values(parsed).reduce(
            (n, c) => n + c.kinks.length * c.fields.length,
            0,
          )
          setListCounts((prev) => ({ ...prev, [t]: total }))
        })
        .catch(() => {})
    })
  }, [loadType])

  const onListTypeChange = async (type: ListType) => {
    setListType(type)
    setFilter('')
    setRatingFilter('all')
    setOnlyRated(false)
    await loadType(type, ratings)
  }

  const onEditAccept = (text: string) => {
    try {
      const parsed = parseKinksText(text)
      const remapped = remapRatings(ratings, parsed)
      setList(parsed)
      setListText(text)
      replaceRatings(remapped)
      setEditOpen(false)
    } catch (e) {
      const msg =
        e instanceof ParseError
          ? e.message
          : 'An error occured trying to parse the text entered, please correct it and try again'
      alert(msg)
    }
  }

  const onExport = () => {
    if (!list) return
    const username = prompt('Please enter your name')
    if (typeof username !== 'string') return
    try {
      exportPng(list, ratings, username)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Export failed')
    }
  }

  const onCopyHash = async () => {
    const value = `#${hash}`
    await navigator.clipboard.writeText(
      `${location.origin}${location.pathname}${value}`,
    )
  }

  const onDescribe = (text: string) => {
    setDescText(text)
    setDescOpen(true)
  }

  const onReset = () => {
    if (!confirm('Clear all ratings for this list?')) return
    replaceRatings({})
  }

  // Global shortcuts when dialogs closed
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editOpen || guidedOpen || descOpen) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[placeholder*="Filter"]')?.focus()
        return
      }
      if (e.key.toLowerCase() === 'e' && !e.metaKey && !e.ctrlKey) {
        if (list) setListText(kinkListToText(list).trim())
        setEditOpen(true)
      }
      if (e.key === ' ' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setGuidedOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editOpen, guidedOpen, descOpen, list])

  return (
    <TooltipProvider>
      <div className="flex min-h-dvh flex-col bg-background">
        <AppHeader
          listType={listType}
          listCounts={listCounts}
          onListTypeChange={onListTypeChange}
          onEdit={() => {
            if (list) setListText(kinkListToText(list).trim())
            setEditOpen(true)
          }}
          onStart={() => setGuidedOpen(true)}
          onExport={onExport}
          onCopyHash={() => void onCopyHash()}
        />

        <div className="flex-1 pt-16 xl:pt-16">
          {/* account for mobile list-type strip */}
          <div className="xl:pt-0 pt-10">
            {list && telemetry ? (
              <TelemetryBar
                listType={listType}
                telemetry={telemetry}
                filter={filter}
                onFilterChange={setFilter}
                ratingFilter={ratingFilter}
                onRatingFilterChange={setRatingFilter}
                onlyRated={onlyRated}
                onOnlyRatedToggle={() => setOnlyRated((v) => !v)}
                collapsed={collapsed}
                onCollapseToggle={() => setCollapsed((v) => !v)}
                onReset={onReset}
              />
            ) : null}

            <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-2 font-mono text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-[#4edea3]" />
                <span>
                  Encrypted cryptographic session • Zero network transmission •
                  Changes compile to URL hash
                </span>
              </div>
              <span className="hidden sm:inline text-[#656573]">
                Rating Keys: 0–5
              </span>
            </div>

            <main className="px-4 pb-24 pt-1">
              {loading ? (
                <p className="text-muted-foreground">Loading list…</p>
              ) : error ? (
                <p className="text-destructive">{error}</p>
              ) : list ? (
                <KinkGrid
                  list={list}
                  ratings={ratings}
                  filter={filter}
                  ratingFilter={ratingFilter}
                  onlyRated={onlyRated}
                  collapsed={collapsed}
                  onRate={setRating}
                  onDescribe={onDescribe}
                />
              ) : null}
            </main>
          </div>
        </div>

        <footer className="fixed bottom-0 z-40 w-full border-t border-border/60 bg-[#0e0e10]/95 px-4 py-2.5 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-muted-foreground">
            <span className="text-[#4edea3]">
              100% Client-side. No accounts, no servers. Ratings live in the URL
              hash.
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                className="hover:text-foreground"
                onClick={() => setGuidedOpen(false)}
              >
                Matrix
              </button>
              <button
                type="button"
                className="hover:text-foreground"
                onClick={() => setGuidedOpen(true)}
              >
                Guided Walkthrough
              </button>
              <button
                type="button"
                className="hover:text-foreground"
                onClick={() => {
                  if (list) setListText(kinkListToText(list).trim())
                  setEditOpen(true)
                }}
              >
                List Editor
              </button>
            </div>
          </div>
        </footer>

        <EditListDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          initialText={listText}
          hash={hash}
          onAccept={onEditAccept}
          onExport={onExport}
        />

        {list ? (
          <GuidedInput
            open={guidedOpen}
            onOpenChange={setGuidedOpen}
            list={list}
            ratings={ratings}
            onRate={setRating}
            onDescribe={onDescribe}
          />
        ) : null}

        <DescriptionDialog
          open={descOpen}
          onOpenChange={setDescOpen}
          text={descText}
        />
      </div>
    </TooltipProvider>
  )
}
