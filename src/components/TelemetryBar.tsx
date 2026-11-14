import { ChevronsDownUp, ChevronsUpDown, Filter, RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  LIST_LABELS,
  RATING_COLORS,
  RATING_LEVELS,
  RATING_SHORT,
  type ListType,
  type RatingLevel,
} from '@/lib/types'
import type { Telemetry } from '@/lib/telemetry'
import { cn } from '@/lib/utils'

type Props = {
  listType: ListType
  telemetry: Telemetry
  filter: string
  onFilterChange: (v: string) => void
  ratingFilter: number | 'all'
  onRatingFilterChange: (v: number | 'all') => void
  onlyRated: boolean
  onOnlyRatedToggle: () => void
  collapsed: boolean
  onCollapseToggle: () => void
  onReset: () => void
}

export function TelemetryBar({
  listType,
  telemetry,
  filter,
  onFilterChange,
  ratingFilter,
  onRatingFilterChange,
  onlyRated,
  onOnlyRatedToggle,
  collapsed,
  onCollapseToggle,
  onReset,
}: Props) {
  const { total, rated, percent, byLevel } = telemetry

  return (
    <section className="sticky top-16 z-30 w-full border-b border-border/40 bg-[#0e0e10]/95 px-4 py-2 backdrop-blur-md xl:top-16">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2">
        <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-base font-semibold tracking-tight">
                {LIST_LABELS[listType]} Matrix
              </span>
              <span className="rounded bg-[#201f21] px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                {total} total
              </span>
            </div>
            <div className="relative min-w-[220px] flex-1 sm:w-80 sm:flex-none">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-[#aa888a]" />
              <Input
                value={filter}
                onChange={(e) => onFilterChange(e.target.value)}
                placeholder="Filter items… [Cmd+K]"
                className="h-8 border-0 bg-[#1c1b1d] pl-8 text-[12px] placeholder:text-[#656573] focus-visible:bg-[#201f21] focus-visible:ring-1 focus-visible:ring-[#06b6d4]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 gap-1 bg-[#1c1b1d] font-mono text-[11px] text-muted-foreground hover:bg-[#201f21] hover:text-foreground"
              onClick={onCollapseToggle}
            >
              {collapsed ? <ChevronsUpDown className="size-4" /> : <ChevronsDownUp className="size-4" />}
              {collapsed ? 'Expand' : 'Collapse'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className={cn(
                'h-8 gap-1 bg-[#1c1b1d] font-mono text-[11px] text-muted-foreground hover:bg-[#201f21] hover:text-foreground',
                onlyRated && 'bg-[#201f21] text-foreground',
              )}
              onClick={onOnlyRatedToggle}
            >
              <Filter className="size-4" />
              {onlyRated ? 'Show All' : 'Only Rated'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 gap-1 bg-[#1c1b1d] font-mono text-[11px] text-[#aa888a] hover:bg-destructive/20 hover:text-destructive"
              onClick={onReset}
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2 pt-1 md:flex-row md:items-center">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between gap-4 font-mono text-[10px] text-muted-foreground">
              <span>COMPLETION TELEMETRY</span>
              <span className="text-[11px] text-foreground">
                {rated} / {total} ({percent}%)
              </span>
            </div>
            <Progress
              value={percent}
              className="h-1.5 w-48 bg-[#201f21] sm:w-60 **:data-[slot=progress-indicator]:bg-[#4edea3]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
            <Chip
              active={ratingFilter === 'all'}
              onClick={() => onRatingFilterChange('all')}
              color="#f4f4f6"
              label="ALL"
              count={total}
            />
            {RATING_LEVELS.map((level, i) => {
              if (i === 0) return null
              return (
                <Chip
                  key={level}
                  active={ratingFilter === i}
                  onClick={() => onRatingFilterChange(i)}
                  color={RATING_COLORS[level as RatingLevel]}
                  label={RATING_SHORT[level as RatingLevel]}
                  count={byLevel[i] ?? 0}
                />
              )
            })}
            <Chip
              active={ratingFilter === 0}
              onClick={() => onRatingFilterChange(0)}
              color="#353437"
              label="UNRATED"
              count={byLevel[0] ?? 0}
              muted
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Chip({
  active,
  onClick,
  color,
  label,
  count,
  muted,
}: {
  active: boolean
  onClick: () => void
  color: string
  label: string
  count: number
  muted?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded bg-[#1c1b1d] px-2 py-0.5 transition-colors hover:bg-[#201f21]',
        active && 'ring-1 ring-[#3b3b48] bg-[#201f21]',
        muted ? 'text-[#aa888a]' : 'text-foreground',
      )}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span>
        {label} <strong className="font-mono text-[11px]">{count}</strong>
      </span>
    </button>
  )
}
