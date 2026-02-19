import { usePipelineStore } from '@/stores/pipeline-store'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ConfirmRevertDialogProps {
  stageName: string
  onConfirm: () => void
  isReverting: boolean
}

export function ConfirmRevertDialog({ stageName, onConfirm, isReverting }: ConfirmRevertDialogProps) {
  const { confirmRevertDialogOpen, setConfirmRevertDialogOpen } = usePipelineStore()

  function handleConfirm() {
    onConfirm()
    setConfirmRevertDialogOpen(false)
  }

  return (
    <Dialog open={confirmRevertDialogOpen} onOpenChange={setConfirmRevertDialogOpen}>
      <DialogHeader>
        <DialogTitle>Revert {stageName}?</DialogTitle>
        <DialogDescription>
          This will revert this stage to active and lock all subsequent stages. Any unsaved changes in
          those stages will be lost.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="mt-4">
        <Button variant="outline" size="sm" onClick={() => setConfirmRevertDialogOpen(false)}>
          Cancel
        </Button>
        <Button variant="destructive" size="sm" onClick={handleConfirm} disabled={isReverting}>
          {isReverting && <Loader2 className="animate-spin" />}
          Revert Stage
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
