import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductIdeaInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isGenerating: boolean
}

const PLACEHOLDER = `Describe your product idea in a few sentences. For example:

"A project management tool for remote teams that combines async video updates with task tracking. Teams can record short video standups, attach them to tasks, and get AI-generated summaries of daily progress."

The more detail you provide, the better the AI can expand your idea into a full product definition.`

export function ProductIdeaInput({ value, onChange, onSubmit, isGenerating }: ProductIdeaInputProps) {
  const [focused, setFocused] = useState(false)
  const isValid = value.trim().length > 10

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-zinc-700">Product Idea</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={PLACEHOLDER}
        rows={6}
        className={`w-full resize-y rounded-lg border bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300 ${
          focused ? 'border-primary-400' : 'border-zinc-200'
        }`}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400">
          {isValid ? 'Ready to generate' : 'Enter at least one sentence to continue'}
        </p>
        <Button size="sm" onClick={onSubmit} disabled={!isValid || isGenerating}>
          <Sparkles />
          {isGenerating ? 'Generating...' : 'Generate Product Definition'}
        </Button>
      </div>
    </div>
  )
}
