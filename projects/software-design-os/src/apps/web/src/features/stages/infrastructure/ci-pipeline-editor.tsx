import { useState, useEffect } from 'react'
import { ArrowRight, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CIPipeline, CIStage, CIStep } from './types'
import { createEmptyCIStep } from './types'

interface CIPipelineEditorProps {
  pipeline: CIPipeline
  onChange: (pipeline: CIPipeline) => void
}

function StepRow({ step, onToggle, onUpdate, onRemove }: { step: CIStep; onToggle: () => void; onUpdate: (updates: Partial<CIStep>) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-zinc-100 bg-white px-3 py-2">
      <input
        type="checkbox"
        checked={step.enabled}
        onChange={onToggle}
        className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
      />
      <input
        type="text"
        value={step.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        placeholder="Step name"
        className={cn(
          'w-28 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs font-medium focus:border-zinc-200 focus:bg-white focus:outline-none',
          step.enabled ? 'text-zinc-900' : 'text-zinc-400 line-through',
        )}
      />
      <input
        type="text"
        value={step.command}
        onChange={(e) => onUpdate({ command: e.target.value })}
        placeholder="command"
        className={cn(
          'ml-auto flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-[11px] focus:border-zinc-200 focus:bg-white focus:outline-none',
          step.enabled ? 'text-zinc-500' : 'text-zinc-300',
        )}
      />
      <button type="button" onClick={onRemove} aria-label="Remove step" className="text-zinc-300 hover:text-red-500 transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function CIPipelineEditor({ pipeline, onChange }: CIPipelineEditorProps) {
  const [activeStageIndex, setActiveStageIndex] = useState(0)

  useEffect(() => {
    if (activeStageIndex >= pipeline.stages.length && pipeline.stages.length > 0) {
      setActiveStageIndex(pipeline.stages.length - 1)
    }
  }, [pipeline.stages.length, activeStageIndex])

  const activeStage = pipeline.stages[activeStageIndex]

  function updateStage(stageIndex: number, updater: (stage: CIStage) => CIStage) {
    onChange({
      ...pipeline,
      stages: pipeline.stages.map((s, i) => (i === stageIndex ? updater(s) : s)),
    })
  }

  function toggleStep(stepId: string) {
    updateStage(activeStageIndex, (stage) => ({
      ...stage,
      steps: stage.steps.map((s) =>
        s.id === stepId ? { ...s, enabled: !s.enabled } : s,
      ),
    }))
  }

  function updateStep(stepId: string, updates: Partial<CIStep>) {
    updateStage(activeStageIndex, (stage) => ({
      ...stage,
      steps: stage.steps.map((s) =>
        s.id === stepId ? { ...s, ...updates } : s,
      ),
    }))
  }

  function removeStep(stepId: string) {
    updateStage(activeStageIndex, (stage) => ({
      ...stage,
      steps: stage.steps.filter((s) => s.id !== stepId),
    }))
  }

  function addStep() {
    updateStage(activeStageIndex, (stage) => ({
      ...stage,
      steps: [...stage.steps, createEmptyCIStep()],
    }))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700">CI/CD Pipeline</label>
        {pipeline.trigger && (
          <span className="text-[10px] text-zinc-400">Trigger: {pipeline.trigger}</span>
        )}
      </div>

      {/* Stage selector pills */}
      <div className="flex items-center gap-1">
        {pipeline.stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center">
            {index > 0 && <ArrowRight className="mx-1 h-3 w-3 text-zinc-300" />}
            <button
              type="button"
              onClick={() => setActiveStageIndex(index)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                activeStageIndex === index
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
              )}
            >
              {stage.name}
              <span className="ml-1.5 text-[10px] opacity-60">({stage.steps.length})</span>
            </button>
          </div>
        ))}
      </div>

      {/* Active stage steps */}
      {activeStage && (
        <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          {activeStage.steps.length === 0 && (
            <p className="py-2 text-center text-xs text-zinc-400">No steps in this stage.</p>
          )}
          {activeStage.steps.map((step) => (
            <StepRow
              key={step.id}
              step={step}
              onToggle={() => toggleStep(step.id)}
              onUpdate={(updates) => updateStep(step.id, updates)}
              onRemove={() => removeStep(step.id)}
            />
          ))}
          <Button variant="ghost" size="sm" onClick={addStep} className="mt-1 w-full">
            <Plus className="h-3.5 w-3.5" />
            Add Step
          </Button>
        </div>
      )}
    </div>
  )
}
