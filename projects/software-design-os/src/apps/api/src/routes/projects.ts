import { Hono } from 'hono'
import {
  getProjectData,
  getStage,
  updateStage,
  generateForStage,
  completeStage,
  revertStage,
  mockOutputs,
} from '../mock/data'

const projects = new Hono()

// GET /api/projects/:id
projects.get('/:id', (c) => {
  const project = getProjectData()
  if (c.req.param('id') !== project.id) {
    return c.json({ error: 'Project not found' }, 404)
  }
  return c.json(project)
})

// GET /api/projects/:id/stages/:num
projects.get('/:id/stages/:num', (c) => {
  const stageNumber = parseInt(c.req.param('num'), 10)
  const stage = getStage(stageNumber)
  if (!stage) {
    return c.json({ error: 'Stage not found' }, 404)
  }
  const outputs = mockOutputs[stage.id] ?? []
  return c.json({ ...stage, outputs })
})

// PUT /api/projects/:id/stages/:num
projects.put('/:id/stages/:num', async (c) => {
  const stageNumber = parseInt(c.req.param('num'), 10)
  const body = await c.req.json()
  const updated = updateStage(stageNumber, { data: body.data, userInput: body.userInput })
  if (!updated) {
    return c.json({ error: 'Stage not found' }, 404)
  }
  return c.json(updated)
})

// POST /api/projects/:id/stages/:num/generate
projects.post('/:id/stages/:num/generate', async (c) => {
  const stageNumber = parseInt(c.req.param('num'), 10)

  // Simulate AI generation delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const result = generateForStage(stageNumber)
  if (!result) {
    return c.json({ error: 'Cannot generate for this stage' }, 400)
  }
  return c.json(result)
})

// POST /api/projects/:id/stages/:num/complete
projects.post('/:id/stages/:num/complete', (c) => {
  const stageNumber = parseInt(c.req.param('num'), 10)
  const result = completeStage(stageNumber)
  if (!result) {
    return c.json({ error: 'Cannot complete this stage' }, 400)
  }
  return c.json(result)
})

// POST /api/projects/:id/stages/:num/revert
projects.post('/:id/stages/:num/revert', (c) => {
  const stageNumber = parseInt(c.req.param('num'), 10)
  const result = revertStage(stageNumber)
  if (!result) {
    return c.json({ error: 'Cannot revert this stage' }, 400)
  }
  return c.json(result)
})

export { projects }
