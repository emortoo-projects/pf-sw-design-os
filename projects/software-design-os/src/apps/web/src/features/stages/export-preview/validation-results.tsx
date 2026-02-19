import { useState } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ValidationResult, ValidationCategory, ValidationSeverity } from './types'
import { getValidationCategoryLabel } from './types'

interface ValidationResultsProps {
  results: ValidationResult[]
}

const SEVERITY_CONFIG: Record<ValidationSeverity, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  pass: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
}

const CATEGORIES: ValidationCategory[] = [
  'entity-references',
  'api-endpoint-validity',
  'design-token-consistency',
  'section-data-requirements',
]

export function ValidationResults({ results }: ValidationResultsProps) {
  const passCount = results.filter((r) => r.severity === 'pass').length
  const warningCount = results.filter((r) => r.severity === 'warning').length
  const errorCount = results.filter((r) => r.severity === 'error').length

  const hasIssues = warningCount > 0 || errorCount > 0
  const [collapsed, setCollapsed] = useState(!hasIssues)

  const grouped = CATEGORIES.map((category) => ({
    category,
    label: getValidationCategoryLabel(category),
    results: results.filter((r) => r.category === category),
  })).filter((g) => g.results.length > 0)

  return (
    <div className="border-t border-zinc-200">
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-zinc-50"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        )}
        <span className="text-sm font-semibold text-zinc-800">Validation</span>
        <div className="flex items-center gap-1.5">
          {passCount > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              {passCount} pass
            </span>
          )}
          {warningCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              {warningCount} warning{warningCount !== 1 ? 's' : ''}
            </span>
          )}
          {errorCount > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </button>

      {!collapsed && (
        <div className="space-y-3 px-4 pb-4">
          {grouped.map((group) => (
            <div key={group.category}>
              <h4 className="mb-1 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                {group.label}
              </h4>
              <div className="space-y-1">
                {group.results.map((result) => {
                  const config = SEVERITY_CONFIG[result.severity]
                  const Icon = config.icon
                  return (
                    <div
                      key={result.id}
                      className={cn(
                        'flex items-start gap-2 rounded-md px-2 py-1.5 text-sm',
                        config.bg,
                      )}
                    >
                      <Icon className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', config.color)} />
                      <div className="min-w-0 flex-1">
                        <span className="text-zinc-700">{result.message}</span>
                        {(result.source || result.target) && (
                          <span className="ml-1 text-xs text-zinc-400">
                            {result.source && `[${result.source}]`}
                            {result.target && ` → ${result.target}`}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
