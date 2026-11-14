import {
  RATING_COLORS,
  RATING_GLOW,
  RATING_LEVELS,
  type RatingLevel,
} from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = {
  value: number
  onChange: (levelIndex: number) => void
  size?: 'sm' | 'md'
}

export function RatingDots({ value, onChange, size = 'sm' }: Props) {
  return (
    <div className="flex shrink-0 items-center gap-1" role="radiogroup">
      {RATING_LEVELS.map((level, i) => {
        const selected = value === i
        const color = RATING_COLORS[level as RatingLevel]
        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={selected}
            title={`${i}: ${level}`}
            aria-label={level}
            onClick={() => onChange(i)}
            className={cn(
              'rounded-full transition-transform hover:scale-125',
              size === 'sm' ? 'size-4' : 'size-5',
              selected ? 'scale-110' : undefined,
            )}
            style={{
              backgroundColor: selected ? color : '#3b3b48',
              boxShadow: selected
                ? `0 0 0 2px ${color}4d, 0 0 8px ${RATING_GLOW[level as RatingLevel]}`
                : undefined,
            }}
          />
        )
      })}
    </div>
  )
}
