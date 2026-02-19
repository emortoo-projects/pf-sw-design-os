import type { MiddlewareHandler } from 'hono'
import { ZodError } from 'zod'

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next()
  } catch (err) {
    if (err instanceof ZodError) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: err.issues,
          },
        },
        400,
      )
    }

    console.error('Unhandled error:', err)

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      },
      500,
    )
  }
}
