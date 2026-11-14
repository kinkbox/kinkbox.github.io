import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialText: string
  hash: string
  onAccept: (text: string) => void
  onExport: () => void
}

export function EditListDialog({
  open,
  onOpenChange,
  initialText,
  hash,
  onAccept,
  onExport,
}: Props) {
  const [text, setText] = useState(initialText)
  const [copied, setCopied] = useState(false)
  const lines = text.split('\n').length

  useEffect(() => {
    if (open) setText(initialText)
  }, [open, initialText])

  const copyHash = async () => {
    const value = hash.startsWith('#') ? hash : `#${hash}`
    await navigator.clipboard.writeText(
      `${location.origin}${location.pathname}${value}`,
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[95dvh] w-full max-w-3xl flex-col gap-4 overflow-y-auto border-[#2e2e3a] bg-[#18181f] sm:max-w-3xl">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2">
            <DialogTitle className="font-heading">
              List Schema &amp; Storage Vault
            </DialogTitle>
            <Badge
              variant="outline"
              className="border-[#ff516a]/40 font-mono text-[10px] text-[#ffb2b7]"
            >
              DEV-CONSOLE
            </Badge>
          </div>
          <p className="rounded-md border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-3 py-2 text-[12px] text-[#acedff]">
            Syntax: <code className="font-mono"># Category</code>,{' '}
            <code className="font-mono">(fields)</code>,{' '}
            <code className="font-mono">* Item</code>,{' '}
            <code className="font-mono">? Description</code>
          </p>
        </DialogHeader>

        <div className="overflow-hidden rounded-lg border border-[#2e2e3a] bg-[#0e0e10]">
          <Textarea
            aria-label="Kink list text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[280px] resize-y rounded-none border-0 bg-transparent px-4 py-3 font-mono text-[12px] leading-relaxed focus-visible:ring-0"
          />
          <div className="flex items-center justify-between border-t border-[#2e2e3a] px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
            <span className="text-[#4edea3]">Syntax: Valid Schema</span>
            <span>
              {lines} lines • Ln {lines}, Col 1
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[#2e2e3a] bg-[#121216] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-heading text-sm font-semibold">
                Instant URL Hash
              </span>
              <Badge
                variant="outline"
                className="border-[#4edea3]/40 font-mono text-[9px] text-[#4edea3]"
              >
                Zero-Server
              </Badge>
            </div>
            <div className="flex gap-2">
              <code className="flex-1 truncate rounded bg-[#0e0e10] px-2 py-1.5 font-mono text-[10px] text-muted-foreground">
                {hash || '(empty)'}
              </code>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="bg-[#201f21]"
                onClick={() => void copyHash()}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-[#2e2e3a] bg-[#121216] p-3">
            <span className="font-heading text-sm font-semibold">
              High-Density Graphic
            </span>
            <p className="mt-1 mb-3 text-[12px] text-muted-foreground">
              Rasterize the current matrix as a shareable PNG scorecard.
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="bg-[#201f21] font-mono text-[11px]"
              onClick={onExport}
            >
              Export PNG
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="font-mono text-[11px] text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#ff516a] font-heading text-xs font-semibold text-white hover:bg-[#ff516a]/90"
            onClick={() => onAccept(text)}
          >
            Accept &amp; Update Matrix
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
