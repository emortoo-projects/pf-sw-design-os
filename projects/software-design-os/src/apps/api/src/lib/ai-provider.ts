import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { decrypt } from './encryption'

export interface AIGenerateResult {
  content: string
  inputTokens: number
  outputTokens: number
  model: string
  stopReason: 'end' | 'max_tokens' | 'unknown'
}

export interface AIProviderClient {
  generate(params: {
    model: string
    systemPrompt: string
    userPrompt: string
    maxTokens?: number
  }): Promise<AIGenerateResult>
}

type ProviderType = 'anthropic' | 'openai' | 'openrouter' | 'deepseek' | 'kimi' | 'custom'

interface ProviderConfig {
  provider: ProviderType
  apiKeyEncrypted: string
  baseUrl?: string | null
  defaultModel: string
}

const TIMEOUT_MS = 600_000

/** Default base URLs for providers that have a fixed API endpoint. */
const DEFAULT_BASE_URLS: Partial<Record<ProviderType, string>> = {
  openrouter: 'https://openrouter.ai/api/v1',
  deepseek: 'https://api.deepseek.com/v1',
  kimi: 'https://api.moonshot.cn/v1',
}

function createAnthropicClient(config: ProviderConfig): AIProviderClient {
  const apiKey = decrypt(config.apiKeyEncrypted)
  const client = new Anthropic({
    apiKey,
    timeout: TIMEOUT_MS,
  })

  return {
    async generate({ model, systemPrompt, userPrompt, maxTokens = 4096 }) {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      })

      const textBlock = response.content.find((block) => block.type === 'text')
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text content in Anthropic response')
      }

      let stopReason: AIGenerateResult['stopReason'] = 'unknown'
      if (response.stop_reason === 'end_turn') stopReason = 'end'
      else if (response.stop_reason === 'max_tokens') stopReason = 'max_tokens'

      return {
        content: textBlock.text,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model: response.model,
        stopReason,
      }
    },
  }
}

function createOpenAIClient(config: ProviderConfig): AIProviderClient {
  const apiKey = decrypt(config.apiKeyEncrypted)
  const baseURL = config.baseUrl || DEFAULT_BASE_URLS[config.provider] || undefined
  const client = new OpenAI({
    apiKey,
    baseURL,
    timeout: TIMEOUT_MS,
  })

  return {
    async generate({ model, systemPrompt, userPrompt, maxTokens = 4096 }) {
      const response = await client.chat.completions.create({
        model,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in OpenAI response')
      }

      const finishReason = response.choices[0]?.finish_reason
      let stopReason: AIGenerateResult['stopReason'] = 'unknown'
      if (finishReason === 'stop') stopReason = 'end'
      else if (finishReason === 'length') stopReason = 'max_tokens'

      return {
        content,
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
        model: response.model,
        stopReason,
      }
    },
  }
}

export function createAIProviderClient(config: ProviderConfig): AIProviderClient {
  switch (config.provider) {
    case 'anthropic':
      return createAnthropicClient(config)
    case 'openai':
    case 'openrouter':
    case 'deepseek':
    case 'kimi':
    case 'custom':
      return createOpenAIClient(config)
    default:
      throw new Error(`Unsupported provider: ${config.provider}`)
  }
}
