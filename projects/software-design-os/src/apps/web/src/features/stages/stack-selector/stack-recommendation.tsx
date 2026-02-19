import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { StackRecommendationData } from './types'

interface StackRecommendationProps {
  recommendation: StackRecommendationData
}

export function StackRecommendation({ recommendation }: StackRecommendationProps) {
  return (
    <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary-500" />
        <h4 className="text-sm font-semibold text-primary-900">AI Recommendation</h4>
        <Badge variant="default" className="ml-auto text-[10px]">
          {recommendation.confidence}% confidence
        </Badge>
      </div>
      <p className="mt-2 text-sm font-medium text-primary-800">
        {recommendation.summary}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-primary-700">
        {recommendation.reasoning}
      </p>
    </div>
  )
}
