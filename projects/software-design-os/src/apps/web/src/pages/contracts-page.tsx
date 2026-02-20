import { useParams } from 'react-router'
import { ContractsView } from '@/features/contracts'

export function ContractsPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
        No project selected
      </div>
    )
  }

  return <ContractsView projectId={id} />
}
