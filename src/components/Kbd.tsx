import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Kbd({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <kbd
      className={cn(
        'rounded bg-[#201f21] px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
