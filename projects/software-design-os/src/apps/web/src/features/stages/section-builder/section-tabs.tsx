import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { SectionSpec } from './types'

interface SectionTabsProps {
  sections: SectionSpec[]
  activeId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
}

export function SectionTabs({ sections, activeId, onSelect, onAdd, onRemove }: SectionTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-200 pb-2">
      {sections.map((section) => {
        const isActive = section.id === activeId
        const hasComponents = section.components.length > 0

        return (
          <div
            key={section.id}
            className={cn(
              'group relative inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              isActive
                ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-primary-300'
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700',
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(section.id)}
              className="inline-flex items-center gap-2"
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  hasComponents ? 'bg-green-500' : 'bg-zinc-300',
                )}
              />
              {section.name}
            </button>
            <button
              type="button"
              onClick={() => onRemove(section.id)}
              className="ml-1 hidden rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 group-hover:inline-flex"
              aria-label={`Remove ${section.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )
      })}
      <Button variant="outline" size="sm" onClick={onAdd} className="ml-1 h-7 gap-1 text-xs">
        <Plus className="h-3 w-3" />
        Add
      </Button>
    </div>
  )
}
