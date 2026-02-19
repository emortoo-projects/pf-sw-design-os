import { useState, useRef, useEffect } from 'react'
import { Check, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UserProfile } from './types'

interface ProfileSettingsProps {
  profile: UserProfile
  onChange: (profile: UserProfile) => void
}

const DB_OPTIONS = ['postgresql', 'mysql', 'sqlite']
const STACK_OPTIONS = ['react', 'nextjs', 'vue', 'svelte']

export function ProfileSettings({ profile, onChange }: ProfileSettingsProps) {
  const [form, setForm] = useState(profile)
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

  const isDirty = JSON.stringify(form) !== JSON.stringify(profile)

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">Profile</h3>
        <p className="text-xs text-zinc-500">Your personal information</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            {form.avatarUrl && /^https?:\/\//.test(form.avatarUrl) ? (
              <img src={form.avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <User className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1">
            <label htmlFor="prof-name" className="text-sm font-medium text-zinc-700">Name</label>
            <input
              id="prof-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="prof-email" className="text-sm font-medium text-zinc-700">Email</label>
          <input
            id="prof-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-6">
        <h3 className="text-sm font-semibold text-zinc-900">Default Preferences</h3>
        <p className="text-xs text-zinc-500">Used when creating new projects</p>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="pref-db" className="text-sm font-medium text-zinc-700">Database Engine</label>
            <select
              id="pref-db"
              value={form.preferences.defaultDbEngine}
              onChange={(e) =>
                setForm({ ...form, preferences: { ...form.preferences, defaultDbEngine: e.target.value } })
              }
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {DB_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pref-stack" className="text-sm font-medium text-zinc-700">Frontend Stack</label>
            <select
              id="pref-stack"
              value={form.preferences.defaultStack}
              onChange={(e) =>
                setForm({ ...form, preferences: { ...form.preferences, defaultStack: e.target.value } })
              }
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {STACK_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={!isDirty}>
          Save Changes
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
