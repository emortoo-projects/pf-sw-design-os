import type { StageName } from '../types/stage'

export interface StageConfig {
  number: number
  name: StageName
  label: string
  description: string
  icon: string
}

export const STAGE_CONFIGS: readonly StageConfig[] = [
  {
    number: 1,
    name: 'product',
    label: 'Product Definition',
    description: 'Define your product idea, features, and target audience',
    icon: 'Lightbulb',
  },
  {
    number: 2,
    name: 'dataModel',
    label: 'Data Model',
    description: 'Design entities, fields, and relationships',
    icon: 'Database',
  },
  {
    number: 3,
    name: 'database',
    label: 'Database',
    description: 'Select database engine and generate schema',
    icon: 'HardDrive',
  },
  {
    number: 4,
    name: 'api',
    label: 'API Design',
    description: 'Define endpoints, authentication, and request/response schemas',
    icon: 'Globe',
  },
  {
    number: 5,
    name: 'stack',
    label: 'Tech Stack',
    description: 'Choose frameworks, libraries, and project structure',
    icon: 'Layers',
  },
  {
    number: 6,
    name: 'design',
    label: 'Design System',
    description: 'Configure colors, typography, spacing, and component tokens',
    icon: 'Palette',
  },
  {
    number: 7,
    name: 'sections',
    label: 'Sections',
    description: 'Define UI sections and component trees',
    icon: 'LayoutDashboard',
  },
  {
    number: 8,
    name: 'infrastructure',
    label: 'Infrastructure',
    description: 'Configure hosting, Docker, CI/CD, and environment variables',
    icon: 'Server',
  },
  {
    number: 9,
    name: 'export',
    label: 'Export',
    description: 'Preview and download your Software Design Package',
    icon: 'Download',
  },
] as const

export const TOTAL_STAGES = STAGE_CONFIGS.length

export function getStageConfig(stageNumber: number): StageConfig | undefined {
  return STAGE_CONFIGS.find((s) => s.number === stageNumber)
}

export function getStageConfigByName(name: StageName): StageConfig | undefined {
  return STAGE_CONFIGS.find((s) => s.name === name)
}
