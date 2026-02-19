import type { LucideIcon } from 'lucide-react'
import {
  Lightbulb,
  Database,
  HardDrive,
  Globe,
  Layers,
  Palette,
  LayoutDashboard,
  Server,
  Download,
  CircleHelp,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Lightbulb,
  Database,
  HardDrive,
  Globe,
  Layers,
  Palette,
  LayoutDashboard,
  Server,
  Download,
}

interface DynamicIconProps {
  name: string
  className?: string
}

export function DynamicIcon({ name, className }: DynamicIconProps) {
  const Icon = iconMap[name] ?? CircleHelp
  return <Icon className={className} />
}
