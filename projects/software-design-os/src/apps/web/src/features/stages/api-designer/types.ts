export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export type AuthStrategy = 'jwt' | 'api-key' | 'oauth' | 'session' | 'none'
export type ApiStyle = 'rest' | 'graphql' | 'trpc'

export interface SchemaField {
  name: string
  type: string
  required: boolean
  description?: string
}

export interface EndpointParam {
  name: string
  in: 'path' | 'query' | 'header'
  type: string
  required: boolean
  description?: string
}

export interface Endpoint {
  id: string
  method: HttpMethod
  path: string
  summary: string
  description?: string
  tag: string
  params: EndpointParam[]
  requestBody?: { contentType: string; schema: SchemaField[] }
  response: { status: number; contentType: string; schema: SchemaField[] }
  curlExample?: string
}

export interface AuthConfig {
  strategy: AuthStrategy
  jwt?: { tokenExpiry: string; refreshTokenExpiry: string; issuer?: string }
  oauth?: { providers: string[] }
  apiKey?: { headerName: string }
}

export interface Integration {
  id: string
  name: string
  url: string
  events: string[]
  payloadFormat: 'json' | 'form'
  description?: string
}

export interface ApiDesign {
  style: ApiStyle
  basePath: string
  auth: AuthConfig
  endpoints: Endpoint[]
  integrations: Integration[]
  pagination?: { style: string; defaultLimit: number; maxLimit: number }
  errorFormat?: { code: string; message: string; details: string }
}

export function createEmptyApiDesign(): ApiDesign {
  return {
    style: 'rest',
    basePath: '/api',
    auth: { strategy: 'none' },
    endpoints: [],
    integrations: [],
  }
}

let idCounter = 0
export function generateId(prefix = 'api'): string {
  return `${prefix}-${Date.now()}-${++idCounter}`
}

export const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'success',
  POST: 'default',
  PUT: 'warning',
  PATCH: 'warning',
  DELETE: 'destructive',
}
