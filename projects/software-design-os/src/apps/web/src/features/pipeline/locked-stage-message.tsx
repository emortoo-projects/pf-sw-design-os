import { Lock } from 'lucide-react'

export function LockedStageMessage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
        <Lock className="h-5 w-5 text-zinc-400" />
      </div>
      <p className="text-sm font-medium text-zinc-500">Complete the previous stage to unlock this one</p>
    </div>
  )
}
