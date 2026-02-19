import { useParams } from 'react-router'
import { useProject } from '@/hooks/use-project'
import { PipelineView } from '@/features/pipeline'
import { PipelineSkeleton } from '@/features/pipeline'
import { PipelineError } from '@/features/pipeline'

export function PipelinePage() {
  const { id } = useParams<{ id: string }>()
  const { data: project, isLoading, error } = useProject(id!)

  if (isLoading) return <PipelineSkeleton />
  if (error || !project) return <PipelineError error={error} />

  return <PipelineView project={project} />
}
