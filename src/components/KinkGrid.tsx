import { KinkCategory } from '@/components/KinkCategory'
import type { KinkList, RatingsMap } from '@/lib/types'

type Props = {
  list: KinkList
  ratings: RatingsMap
  filter: string
  ratingFilter: number | 'all'
  onlyRated: boolean
  collapsed: boolean
  onRate: (key: string, level: number) => void
  onDescribe: (text: string) => void
}

export function KinkGrid({
  list,
  ratings,
  filter,
  ratingFilter,
  onlyRated,
  collapsed,
  onRate,
  onDescribe,
}: Props) {
  const categories = Object.keys(list)

  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-3 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((name) => (
        <KinkCategory
          key={name}
          name={name}
          category={list[name]}
          list={list}
          ratings={ratings}
          collapsed={collapsed}
          filter={filter}
          ratingFilter={ratingFilter}
          onlyRated={onlyRated}
          onRate={onRate}
          onDescribe={onDescribe}
        />
      ))}
    </div>
  )
}
