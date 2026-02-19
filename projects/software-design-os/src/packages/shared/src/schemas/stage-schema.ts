import { z } from 'zod'

export const stageNameSchema = z.enum([
  'product',
  'dataModel',
  'database',
  'api',
  'stack',
  'design',
  'sections',
  'infrastructure',
  'export',
])

export const stageStatusSchema = z.enum(['locked', 'active', 'generating', 'review', 'complete'])

export const generateInputSchema = z.object({
  userInput: z.string().optional(),
  context: z.record(z.unknown()).optional(),
})

export const updateStageInputSchema = z.object({
  data: z.record(z.unknown()),
  userInput: z.string().optional(),
})

export type GenerateInput = z.infer<typeof generateInputSchema>
export type UpdateStageInput = z.infer<typeof updateStageInputSchema>
