import { Download, Link2, Pencil, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/Kbd'
import {
  LIST_LABELS,
  RATING_COLORS,
  RATING_GLOW,
  RATING_LEVELS,
  type ListType,
  type RatingLevel,
} from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = {
  listType: ListType
  listCounts?: Partial<Record<ListType, number>>
  onListTypeChange: (v: ListType) => void
  onEdit: () => void
  onStart: () => void
  onExport: () => void
  onCopyHash: () => void
}

const TYPES: ListType[] = ['classic', 'detailed', 'plsno']

export function AppHeader({
  listType,
  listCounts,
  onListTypeChange,
  onEdit,
  onStart,
  onExport,
  onCopyHash,
}: Props) {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-[#0e0e10]/90 shadow-[0_1px_8px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <div className="flex h-16 w-full items-center justify-between gap-3 px-4">
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-[#ff516a]/15 text-[#ff516a]">
            <span className="font-heading text-sm font-bold">K</span>
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-base font-semibold leading-none tracking-tight">
              kinklist
            </span>
            <span className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-[#e3bdbf]">
              <span className="inline-block size-1.5 rounded-full bg-[#4edea3]" />
              v2.4 • Private &amp; Local
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-1 rounded-lg bg-[#1c1b1d] p-1 xl:flex">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onListTypeChange(t)}
              className={cn(
                'flex items-center gap-1.5 rounded px-3 py-1 font-mono text-[11px] transition-colors',
                listType === t
                  ? 'bg-[#2a2a2c] text-foreground'
                  : 'text-muted-foreground hover:bg-[#201f21] hover:text-foreground',
              )}
            >
              <span>{LIST_LABELS[t]}</span>
              {listCounts?.[t] != null ? (
                <span className="rounded-full bg-[#201f21] px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {listCounts[t]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 rounded-lg bg-[#1c1b1d] px-3 py-1 font-mono text-[10px] text-muted-foreground lg:flex">
          {RATING_LEVELS.map((level, i) => (
            <div key={level} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{
                  backgroundColor: RATING_COLORS[level as RatingLevel],
                  boxShadow:
                    i === 0
                      ? undefined
                      : `0 0 8px ${RATING_GLOW[level as RatingLevel]}`,
                }}
              />
              <span>
                {level}{' '}
                <span className="text-foreground font-mono">{i}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-9 gap-1.5 bg-[#1c1b1d] text-muted-foreground hover:bg-[#2a2a2c] hover:text-foreground"
            onClick={onEdit}
          >
            <Pencil className="size-[18px]" />
            <span className="hidden sm:inline font-mono text-[10px]">Edit List</span>
            <Kbd className="hidden sm:inline">E</Kbd>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-9 gap-1.5 bg-[#1c1b1d] text-muted-foreground hover:bg-[#2a2a2c] hover:text-foreground"
            onClick={onStart}
          >
            <Play className="size-[18px] fill-current" />
            <span className="hidden sm:inline font-mono text-[10px]">Guided</span>
            <Kbd className="hidden sm:inline">Space</Kbd>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-9 gap-1.5 bg-[#1c1b1d] text-muted-foreground hover:bg-[#2a2a2c] hover:text-foreground"
            onClick={onCopyHash}
          >
            <Link2 className="size-[18px]" />
            <span className="hidden md:inline font-mono text-[10px]">Copy Hash</span>
          </Button>
          <Button type="button" size="sm" className="h-9 gap-1.5 font-heading text-xs" onClick={onExport}>
            <Download className="size-[18px]" />
            <span className="hidden sm:inline font-semibold">Download PNG</span>
          </Button>
        </div>
      </div>

      {/* Mobile list-type strip */}
      <div className="flex gap-1 overflow-x-auto border-t border-border/40 px-4 py-2 xl:hidden">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onListTypeChange(t)}
            className={cn(
              'shrink-0 rounded px-3 py-1 font-mono text-[11px]',
              listType === t
                ? 'bg-[#2a2a2c] text-foreground'
                : 'bg-[#1c1b1d] text-muted-foreground',
            )}
          >
            {LIST_LABELS[t]}
          </button>
        ))}
      </div>
    </header>
  )
}
