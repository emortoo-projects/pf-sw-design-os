import { useState } from 'react'
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface ContractGenerateButtonProps {
  hasContracts: boolean
  isGenerating: boolean
  onGenerate: () => void
}

export function ContractGenerateButton({ hasContracts, isGenerating, onGenerate }: ContractGenerateButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleClick = () => {
    if (hasContracts) {
      setConfirmOpen(true)
    } else {
      onGenerate()
    }
  }

  const handleConfirm = () => {
    setConfirmOpen(false)
    onGenerate()
  }

  return (
    <>
      <Button onClick={handleClick} disabled={isGenerating}>
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : hasContracts ? (
          <RefreshCw className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {isGenerating ? 'Generating...' : hasContracts ? 'Regenerate' : 'Generate Contracts'}
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogHeader>
          <DialogTitle>Regenerate Contracts?</DialogTitle>
          <DialogDescription>
            This will delete all existing contracts and generate new ones from the current stage data. Any status changes will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Regenerate
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}
