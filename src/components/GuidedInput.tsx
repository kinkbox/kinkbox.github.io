import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Heart,
  Meh,
  Sparkles,
  ThumbsUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { flattenGuidedSlots } from '@/lib/ratingsOrder'
import {
  RATING_COLORS,
  RATING_LEVELS,
  type KinkList,
  type RatingsMap,
  type RatingLevel,
} from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: KinkList
  ratings: RatingsMap
  onRate: (key: string, level: number) => void
  onDescribe: (text: string) => void
}

const ICONS = [CircleHelp, Heart, ThumbsUp, Meh, Sparkles, Ban]

const BLURBS: Record<RatingLevel, string> = {
  'Not Entered': 'Skip / undecided for now',
  Favorite: 'Must-have / highest enthusiasm',
  Like: 'Open to this / enjoy it',
  Indifferent: 'Fine either way / partner-led',
  Maybe: 'Curious — needs discussion',
  Limit: 'Hard boundary — do not engage',
}

export function GuidedInput({
  open,
  onOpenChange,
  list,
  ratings,
  onRate,
  onDescribe,
}: Props) {
  const slots = useMemo(() => flattenGuidedSlots(list), [list])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (open) setIndex(0)
  }, [open])

  const current = slots.length ? slots[index % slots.length] : null
  const prev = slots.length
    ? slots[(index - 1 + slots.length) % slots.length]
    : null
  const next = slots.length ? slots[(index + 1) % slots.length] : null

  const showPrev = useCallback(() => {
    setIndex((i) => (slots.length + i - 1) % Math.max(slots.length, 1))
  }, [slots.length])

  const showNext = useCallback(() => {
    setIndex((i) => (i + 1) % Math.max(slots.length, 1))
  }, [slots.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) return
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        showPrev()
        e.preventDefault()
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        if (e.key === ' ') e.preventDefault()
        showNext()
        return
      }
      if (e.key === 'Escape') {
        onOpenChange(false)
        return
      }
      if (e.key >= '0' && e.key <= '5') {
        const slot = slots[index % slots.length]
        if (!slot) return
        onRate(slot.key, Number(e.key))
        showNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, slots, onRate, showPrev, showNext, onOpenChange])

  if (!current) return null

  const progress = ((index + 1) / slots.length) * 100
  const currentLevel = ratings[current.key] ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[95dvh] w-full max-w-2xl gap-0 overflow-y-auto border-[#2e2e3a] bg-transparent p-0 shadow-none sm:max-w-2xl"
      >
        <DialogTitle className="sr-only">Guided input</DialogTitle>

        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-[#1c1b1d] px-3 py-1">
            <span className="size-2 animate-pulse rounded-full bg-[#4edea3]" />
            <span className="font-mono text-[10px] tracking-wider uppercase">
              Guided Flow
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              Encrypted Session
            </span>
          </div>
          <span className="rounded bg-[#201f21] px-1.5 py-0.5 font-mono text-[10px] text-[#4edea3]">
            {((index / Math.max(slots.length, 1)) * 100).toFixed(1)}% Complete
          </span>
        </div>

        {prev ? (
          <div className="relative z-0 mx-auto mb-[-1.75rem] flex h-10 w-[96%] items-center justify-between rounded-t-xl bg-[#201f21] px-4 opacity-80 scale-[0.98]">
            <div className="flex items-center gap-1.5 truncate">
              <Check className="size-3.5 text-[#ffb2b7]" />
              <span className="font-mono text-[10px] text-muted-foreground uppercase">
                Item {index === 0 ? slots.length : index}:
              </span>
              <span className="truncate text-[12px]">{prev.kink}</span>
            </div>
          </div>
        ) : null}

        <div className="relative z-20 overflow-hidden rounded-xl bg-[#1c1b1d] shadow-2xl">
          <div className="h-1.5 w-full bg-[#0e0e10]">
            <div
              className="h-full bg-gradient-to-r from-[#ff516a] via-[#4edea3] to-[#4cd7f6] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#2a2a2c] px-2.5 py-1 font-mono text-[11px]">
                {index + 1} / {slots.length}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {current.category}
                {current.showField ? ` • ${current.field}` : ''}
              </span>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="bg-[#201f21]"
              onClick={() => onOpenChange(false)}
            >
              ✕
            </Button>
          </div>

          <div className="flex flex-col gap-3 px-4 pb-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-[#353437] px-2 py-0.5 font-mono text-[10px] text-[#4cd7f6]">
                {current.category}
              </span>
              {current.desc ? (
                <button
                  type="button"
                  className="rounded-full bg-[#353437] px-2 py-0.5 font-mono text-[10px] text-muted-foreground hover:text-foreground"
                  onClick={() => onDescribe(current.desc!)}
                >
                  View description
                </button>
              ) : null}
              <span
                className={cn(
                  'ml-auto flex items-center gap-1.5 font-mono text-[10px]',
                  currentLevel > 0 ? 'text-[#4edea3]' : 'text-[#ffb2b7]',
                )}
              >
                <span
                  className="size-2 rounded-full"
                  style={{
                    backgroundColor:
                      currentLevel > 0
                        ? RATING_COLORS[RATING_LEVELS[currentLevel]]
                        : '#ff516a',
                  }}
                />
                {currentLevel > 0
                  ? RATING_LEVELS[currentLevel]
                  : 'Awaiting Rating'}
              </span>
            </div>

            <div>
              <h3 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                {current.kink}
              </h3>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                #ITEM-{String(index + 1).padStart(3, '0')}
              </p>
            </div>

            {current.desc ? (
              <p className="rounded-lg border border-[#2e2e3a] bg-[#0e0e10]/60 p-3 text-[13px] leading-relaxed text-muted-foreground">
                {current.desc}
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {RATING_LEVELS.map((level, i) => {
                const Icon = ICONS[i]
                const selected = currentLevel === i
                const color = RATING_COLORS[level]
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      onRate(current.key, i)
                      showNext()
                    }}
                    className={cn(
                      'flex flex-col gap-1 rounded-lg border border-[#2e2e3a] bg-[#121216] p-3 text-left transition-colors hover:bg-[#22222b]',
                      selected && 'ring-1',
                    )}
                    style={
                      selected
                        ? { borderColor: color, boxShadow: `0 0 0 1px ${color}` }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="size-4" style={{ color }} />
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {i}
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold">{level}</span>
                    <span className="font-mono text-[10px] leading-snug text-[#656573]">
                      {BLURBS[level]}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-1 flex items-center justify-between gap-2 border-t border-[#2e2e3a] pt-3">
              <Button
                type="button"
                variant="secondary"
                className="gap-1 bg-[#201f21] font-mono text-[11px]"
                onClick={showPrev}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <div className="hidden items-center gap-2 font-mono text-[10px] text-[#656573] sm:flex">
                <span>Space Skip</span>
                <span>Esc Exit</span>
              </div>
              <Button
                type="button"
                className="gap-1 font-heading text-xs font-semibold"
                onClick={showNext}
              >
                Next Item
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {next ? (
          <div className="relative z-0 mx-auto mt-[-0.25rem] flex h-10 w-[92%] items-center justify-between rounded-b-xl bg-[#1c1b1d]/70 px-4 opacity-50 scale-95">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-mono text-[10px] text-muted-foreground uppercase">
                Up Next:
              </span>
              <span className="truncate text-[12px]">{next.kink}</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
