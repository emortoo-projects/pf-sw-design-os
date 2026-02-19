import { useState, useRef, useEffect } from 'react'
import { Check, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CostAlertConfig as CostAlertConfigType } from './types'

interface CostAlertConfigProps {
  config: CostAlertConfigType
  onChange: (config: CostAlertConfigType) => void
}

export function CostAlertConfig({ config, onChange }: CostAlertConfigProps) {
  const [form, setForm] = useState(config)
  const [saved, setSaved] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  function handleSave() {
    onChange(form)
    setSaved(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setSaved(false), 2000)
  }

  const isDirty = JSON.stringify(form) !== JSON.stringify(config)

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">Cost Alerts</h3>
        <p className="text-xs text-zinc-500">Set budget limits and notification preferences</p>
      </div>

      <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
        <div>
          <label htmlFor="budget" className="text-sm font-medium text-zinc-700">
            Monthly Budget
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
            <input
              id="budget"
              type="number"
              min={0}
              step={1}
              value={form.monthlyBudget}
              onChange={(e) => setForm({ ...form, monthlyBudget: Math.max(0, Number(e.target.value)) })}
              className="w-full rounded-md border border-zinc-200 bg-white py-2 pl-7 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="threshold" className="text-sm font-medium text-zinc-700">
            Warning Threshold
          </label>
          <div className="flex items-center gap-2 mt-1">
            <input
              id="threshold"
              type="range"
              min={50}
              max={100}
              step={5}
              value={form.warningThreshold}
              onChange={(e) => setForm({ ...form, warningThreshold: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="w-10 text-right text-sm font-medium text-zinc-700">
              {form.warningThreshold}%
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            Alert when spending reaches {form.warningThreshold}% of ${form.monthlyBudget}
            {' '}(${((form.monthlyBudget * form.warningThreshold) / 100).toFixed(2)})
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-700">Email notifications</span>
          </div>
          <button
            onClick={() =>
              setForm({ ...form, emailNotifications: !form.emailNotifications })
            }
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              form.emailNotifications ? 'bg-primary-600' : 'bg-zinc-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                form.emailNotifications ? 'translate-x-4.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={!isDirty}>
          Save Alerts
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
      </div>
    </div>
  )
}
