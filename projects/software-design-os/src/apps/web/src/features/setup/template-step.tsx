import { cn } from '@/lib/utils'

interface TemplateOption {
  id: string
  name: string
  description: string
  icon: string
}

const BUILT_IN_TEMPLATES: TemplateOption[] = [
  { id: 'saas-starter', name: 'SaaS Starter', description: 'Full-stack SaaS with auth, billing & dashboard', icon: 'Rocket' },
  { id: 'rest-api', name: 'REST API Service', description: 'Backend-only API with auth & OpenAPI docs', icon: 'Globe' },
  { id: 'landing-page', name: 'Landing Page', description: 'Marketing page with hero, pricing & contact', icon: 'Layout' },
  { id: 'mobile-app', name: 'Mobile App', description: 'Cross-platform with offline & push notifications', icon: 'Smartphone' },
  { id: 'cli-tool', name: 'CLI Tool', description: 'Command-line tool with args, config & prompts', icon: 'Terminal' },
  { id: 'fullstack-app', name: 'Fullstack App', description: 'Complete web app — blank canvas for any idea', icon: 'Layers' },
]

interface TemplateStepProps {
  value: string | undefined
  onChange: (v: string | undefined) => void
}

export function TemplateStep({ value, onChange }: TemplateStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600">
        Choose a starting template for your first project, or skip to start from scratch.
        Templates will be applied when you create your first project.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {BUILT_IN_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onChange(value === tpl.id ? undefined : tpl.id)}
            className={cn(
              'rounded-lg border p-3 text-left transition-colors',
              value === tpl.id
                ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-200'
                : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50',
            )}
          >
            <p className="text-sm font-medium text-zinc-900">{tpl.name}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{tpl.description}</p>
          </button>
        ))}
      </div>

      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          Clear selection
        </button>
      )}
    </div>
  )
}
