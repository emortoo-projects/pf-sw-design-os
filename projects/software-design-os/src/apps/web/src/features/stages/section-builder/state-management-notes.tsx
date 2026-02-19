import type { StateManagement } from './types'

interface StateManagementNotesProps {
  stateManagement: StateManagement
  onChange: (sm: StateManagement) => void
}

export function StateManagementNotes({ stateManagement, onChange }: StateManagementNotesProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-700">State Management</label>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Server State</label>
          <textarea
            value={stateManagement.serverState}
            onChange={(e) => onChange({ ...stateManagement, serverState: e.target.value })}
            rows={3}
            placeholder="e.g. useQuery to fetch data..."
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Client State</label>
          <textarea
            value={stateManagement.clientState}
            onChange={(e) => onChange({ ...stateManagement, clientState: e.target.value })}
            rows={3}
            placeholder="e.g. Modal open/close, form state..."
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300"
          />
        </div>
      </div>
    </div>
  )
}
