import { HelpCircle } from 'lucide-react'
import { RatingDots } from '@/components/RatingDots'
import { Button } from '@/components/ui/button'
import { categoryRatedCount } from '@/lib/telemetry'
import type { Category, KinkList, RatingsMap } from '@/lib/types'
import { ratingKey } from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = {
  name: string
  category: Category
  list: KinkList
  ratings: RatingsMap
  collapsed?: boolean
  filter: string
  ratingFilter: number | 'all'
  onlyRated: boolean
  onRate: (key: string, level: number) => void
  onDescribe: (text: string) => void
}

export function KinkCategory({
  name,
  category,
  list,
  ratings,
  collapsed,
  filter,
  ratingFilter,
  onlyRated,
  onRate,
  onDescribe,
}: Props) {
  const { fields, kinks } = category
  const dual = fields.length >= 2
  const { rated, total } = categoryRatedCount(list, ratings, name)
  const q = filter.trim().toLowerCase()

  const visible = kinks.filter((kink) => {
    if (q && !kink.name.toLowerCase().includes(q) && !name.toLowerCase().includes(q)) {
      return false
    }
    if (ratingFilter === 'all' && !onlyRated) return true
    const levels = fields.map((f) => ratings[ratingKey(name, kink.name, f)] ?? 0)
    if (onlyRated && !levels.some((l) => l > 0)) return false
    if (ratingFilter !== 'all' && !levels.includes(ratingFilter)) return false
    return true
  })

  if (visible.length === 0 && (q || onlyRated || ratingFilter !== 'all')) return null

  return (
    <section className="flex flex-col rounded-lg bg-[#1c1b1d] p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between pb-2">
        <h2 className="font-heading text-base font-semibold text-foreground">{name}</h2>
        <span className="rounded bg-[#201f21] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {rated}/{total} rated
        </span>
      </div>

      {!collapsed ? (
        <div className="flex flex-col gap-1">
          {visible.map((kink) => (
            <div
              key={kink.name}
              className="group flex flex-col rounded bg-[#201f21] px-2 py-1.5 transition-colors hover:bg-[#2a2a2c]"
            >
              {dual ? (
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold">{kink.name}</span>
                  {kink.desc ? (
                    <DescButton onClick={() => onDescribe(kink.desc!)} name={kink.name} />
                  ) : null}
                </div>
              ) : null}

              {fields.map((field) => {
                const key = ratingKey(name, kink.name, field)
                return (
                  <div
                    key={field}
                    className={cn(
                      'flex items-center justify-between gap-2',
                      dual && 'py-0.5',
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <RatingDots
                        value={ratings[key] ?? 0}
                        onChange={(v) => onRate(key, v)}
                      />
                      {!dual ? (
                        <span className="truncate text-[13px] font-semibold">{kink.name}</span>
                      ) : (
                        <span className="truncate font-mono text-[10px] text-muted-foreground">
                          {field}
                        </span>
                      )}
                    </div>
                    {!dual ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <span className="hidden font-mono text-[9px] text-[#656573] group-hover:inline">
                          [0-5]
                        </span>
                        {kink.desc ? (
                          <DescButton onClick={() => onDescribe(kink.desc!)} name={kink.name} />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function DescButton({ onClick, name }: { onClick: () => void; name: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="size-6 text-[#aa888a] hover:text-foreground"
      aria-label={`Description for ${name}`}
      onClick={onClick}
    >
      <HelpCircle className="size-4" />
    </Button>
  )
}
