import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  text: string
}

export function DescriptionDialog({ open, onOpenChange, text }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#2e2e3a] bg-[#18181f] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Description</DialogTitle>
        </DialogHeader>
        <p className="text-[13px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {text}
        </p>
      </DialogContent>
    </Dialog>
  )
}
